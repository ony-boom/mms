import { musicLibrary } from "~~/lib/music-manager";
import { prisma } from "~~/prisma";
import { LRUCache } from "lru-cache";
import sharp from "sharp";

const coverCache = new LRUCache<
  string,
  { data: Buffer; contentType: string; etag: string }
>({
  maxSize: 150 * 1024 * 1024,
  sizeCalculation: (value) => value.data.length,
  ttl: 1000 * 60 * 60,
  allowStale: true,
});

const trackMetaCache = new LRUCache<
  string,
  { albumCoverPath: string | null; exists: boolean }
>({
  max: 1000,
  ttl: 1000 * 60 * 15,
});

const SUPPORTED_SIZES = {
  thumb: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 500, height: 500 },
  large: { width: 800, height: 800 },
  original: null,
} as const;

type ImageSize = keyof typeof SUPPORTED_SIZES;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const requestedSize = (query.size as keyof typeof SUPPORTED_SIZES) || "small";

  if (!Object.keys(SUPPORTED_SIZES).includes(requestedSize)) {
    setResponseStatus(event, 400);
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: `Invalid size. Supported sizes: ${Object.keys(SUPPORTED_SIZES).join(", ")}`,
      }),
    );
  }

  const size = requestedSize as ImageSize;
  const trackId = getRouterParam(event, "trackId");

  if (!trackId) {
    setResponseStatus(event, 400);
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: "Track ID is required",
      }),
    );
  }

  try {
    let trackMeta = trackMetaCache.get(trackId);

    if (!trackMeta) {
      const track = await prisma.track.findUnique({
        where: { id: trackId },
        include: {
          album: {
            select: {
              coverPath: true,
            },
          },
        },
      });

      trackMeta = {
        albumCoverPath: track?.album?.coverPath || null,
        exists: !!track,
      };

      trackMetaCache.set(trackId, trackMeta);
    }

    if (!trackMeta.exists) {
      setResponseStatus(event, 404);
      setResponseHeader(event, "Content-Type", "image/png");
      return await useStorage("assets:server").getItemRaw("no-album-art.png");
    }

    if (!trackMeta.albumCoverPath) {
      const fallbackImage = await getFallbackImage(size);
      setResponseHeader(event, "Content-Type", "image/png");
      return fallbackImage;
    }

    const cacheKey = `${trackId}-${trackMeta.albumCoverPath}-${size}`;

    const cached = coverCache.get(cacheKey);
    if (cached) {
      const clientETag = getHeader(event, "if-none-match");
      if (clientETag === cached.etag) {
        setResponseStatus(event, 304);
        return null;
      }

      setResponseHeader(event, "Content-Type", cached.contentType);
      setResponseHeader(event, "Cache-Control", "public, max-age=3600");
      setResponseHeader(event, "ETag", cached.etag);
      return cached.data;
    }

    try {
      const originalCoverData = await musicLibrary.getCover(
        trackMeta.albumCoverPath,
      );

      const originalBuffer = Buffer.isBuffer(originalCoverData)
        ? originalCoverData
        : Buffer.from(originalCoverData);

      const processedBuffer = await processImage(originalBuffer, size);

      const contentType =
        size === "original"
          ? getContentTypeFromPath(trackMeta.albumCoverPath) || "image/jpeg"
          : "image/jpeg";

      const etag = `"${trackId}-${trackMeta.albumCoverPath}-${size}-${processedBuffer.length}"`;

      const cacheEntry = {
        data: processedBuffer,
        contentType,
        etag,
      };
      coverCache.set(cacheKey, cacheEntry);

      const clientETag = getHeader(event, "if-none-match");
      if (clientETag === etag) {
        setResponseStatus(event, 304);
        return null;
      }

      setResponseHeader(event, "Content-Type", contentType);
      setResponseHeader(event, "Cache-Control", "public, max-age=3600");
      setResponseHeader(event, "ETag", etag);

      return processedBuffer;
    } catch (coverError) {
      console.error(
        `Failed to retrieve cover for track ${trackId}:`,
        coverError,
      );

      const fallbackImage = await getFallbackImage(size);
      setResponseHeader(event, "Content-Type", "image/png");
      return fallbackImage;
    }
  } catch (error) {
    console.error(`Error handling track cover request for ${trackId}:`, error);

    setResponseStatus(event, 500);
    setResponseHeader(event, "Content-Type", "image/png");

    return await getFallbackImage(size);
  }
});

export function clearTrackCache(trackId: string) {
  trackMetaCache.delete(trackId);

  for (const key of coverCache.keys()) {
    if (key.startsWith(`${trackId}-`)) {
      coverCache.delete(key);
    }
  }
}

async function processImage(buffer: Buffer, size: ImageSize): Promise<Buffer> {
  if (size === "original") {
    return buffer;
  }

  const dimensions = SUPPORTED_SIZES[size];
  if (!dimensions) {
    throw new Error(`Invalid size: ${size}`);
  }

  try {
    return await sharp(buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();
  } catch (error) {
    console.error(`Error processing image for size ${size}:`, error);
    throw error;
  }
}

async function getFallbackImage(size: ImageSize): Promise<Buffer> {
  const cacheKey = `fallback-${size}`;

  const cached = coverCache.get(cacheKey);
  if (cached) {
    return cached.data;
  }

  try {
    const fallbackBuffer = (await useStorage("assets:server").getItemRaw(
      "no-album-art.png",
    )) as Buffer;

    const processedFallback = await processImage(fallbackBuffer, size);

    const cacheEntry = {
      data: processedFallback,
      contentType: size === "original" ? "image/png" : "image/jpeg",
      etag: `"fallback-${size}-${processedFallback.length}"`,
    };
    coverCache.set(cacheKey, cacheEntry);

    return processedFallback;
  } catch (error) {
    console.error(`Error processing fallback image for size ${size}:`, error);
    return (await useStorage("assets:server").getItemRaw(
      "no-album-art.png",
    )) as Buffer;
  }
}

export function getCacheStats() {
  return {
    coverCache: {
      size: coverCache.size,
      calculatedSize: coverCache.calculatedSize,
      maxSize: coverCache.maxSize,
      hitRate:
        coverCache.calculatedSize > 0
          ? coverCache.size / coverCache.calculatedSize
          : 0,
    },
    trackMetaCache: {
      size: trackMetaCache.size,
      max: trackMetaCache.max,
    },
    supportedSizes: Object.keys(SUPPORTED_SIZES),
  };
}

function getContentTypeFromPath(filePath: string): string | null {
  const extension = filePath.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}
