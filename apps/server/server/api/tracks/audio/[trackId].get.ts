import fs, { Stats } from "node:fs";
import { createHash } from "node:crypto";
import { prisma } from "~~/prisma";
import { LRUCache } from "lru-cache";

interface CachedTrack {
  id: string;
  title: string;
  path: string;
  albumId: string;
  dateAdded: Date;
  isFavorite: boolean;
}

const trackCache = new LRUCache<string, CachedTrack>({
  max: 200,
  ttl: 1000 * 60 * 60, // 1 hour
});

const generateETag = (stat: Stats) => {
  return createHash("md5")
    .update(`${stat.size}-${stat.mtime.getTime()}`)
    .digest("hex");
};

const CHUNK_SIZE = 65536; // 64KB

export default defineEventHandler(async (event) => {
  const trackId = getRouterParam(event, "trackId");

  try {
    let track = trackCache.get(trackId);

    if (!track) {
      track = await prisma.track.findUnique({
        where: { id: trackId },
      });

      if (!track) {
        setResponseHeader(event, "Content-Type", "text/plain");
        setResponseStatus(event, 404);
        return "Track not found";
      }

      // Store in cache for future requests
      trackCache.set(trackId, track);
    }

    const filePath = track.path;
    const stat = await fs.promises.stat(filePath);

    // Generate ETag
    const etag = generateETag(stat);
    setResponseHeader(event, "ETag", `"${etag}"`);

    // Check if-none-match header for conditional requests
    const ifNoneMatch = getRequestHeader(event, "if-none-match");
    if (ifNoneMatch === `"${etag}"`) {
      setResponseStatus(event, 304); // Not Modified
      return "";
    }

    setResponseHeaders(event, {
      "Accept-Ranges": "bytes",
      "Content-Type": "audio/mpeg",
      "Cache-Control": "max-age=3600", // Client can cache for an hour
    });

    const range = getRequestHeader(event, "range");

    if (!range) {
      setResponseHeader(event, "Content-Length", stat.size);
      return sendStream(
        event,
        fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE }),
      ); // 64KB chunks
    }

    // Parse range
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

    // Validate range
    if (start >= stat.size || end >= stat.size) {
      setResponseStatus(event, 416); // Range Not Satisfiable
      setResponseHeader(event, "Content-Range", `bytes */${stat.size}`);
      return "";
    }

    const chunkSize = end - start + 1;

    setResponseStatus(event, 206);
    setResponseHeaders(event, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Length": chunkSize,
    });

    const stream = fs.createReadStream(filePath, {
      start,
      end,
      highWaterMark: CHUNK_SIZE,
    });

    return sendStream(event, stream);
  } catch (error) {
    console.error("Error serving audio file:", error);
    setResponseStatus(event, 500);
    setResponseHeader(event, "Content-Type", "application/json");
    return {
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
});
