import { z } from "zod";
import fs from "node:fs";
import id3 from "node-id3";
import path from "node:path";
import { prisma } from "~~/prisma";
import { config } from "@repo/config";
import { musicLibrary } from "~~/lib/music-manager";

export default defineEventHandler(async (event) => {
  const trackId = getRouterParam(event, "trackId");
  const payload = await readBody<MetadataPayload>(event);

  const parsedPayload = payloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      data: null,
      success: false,
      error: parsedPayload.error.message,
    };
  }
  const { data } = parsedPayload;

  const defaultCover =
    await useStorage("assets:server").getItemRaw("no-album-art.png");

  const success = id3.update(
    {
      title: data.title,
      artist: data.artist,
      album: data.album,
      image: {
        imageBuffer:
          data.cover && data.cover.startsWith("data:image")
            ? Buffer.from(data.cover.split(",")[1], "base64")
            : defaultCover,
        mime: "image/jpeg",
        type: { id: 3 },
        description: "Album cover",
      },
    },
    data.trackPath,
  );

  if (!success) {
    setResponseStatus(event, 500);
    return {
      data: null,
      success: false,
      error: "Failed to update metadata",
    };
  }

  try {
    await deleteOldCover(data.albumId);

    await musicLibrary.trackSaver.removeTrack(data.trackPath);
    await musicLibrary.trackSaver.updateTrack(data.trackPath);

    const savedTrack = await prisma.track.findUnique({
      where: { id: trackId },
    });

    return {
      data: savedTrack,
      success: true,
      error: null,
    };
  } catch (error) {
    setResponseStatus(event, 500);
    return {
      data: null,
      success: false,
      error: error.message,
    };
  }
});

const deleteOldCover = async (albumId: string) => {
  const coverPath = path.join(
    config.coverPath,
    `${albumId}.${config.defaultCoverExtension}`,
  );
  if (fs.existsSync(coverPath)) {
    await fs.promises.unlink(coverPath);
  }
};

const payloadSchema = z.object({
  title: z.string().nonempty(),
  artist: z.string().nonempty(),
  album: z.string().nonempty(),
  cover: z
    .string()
    .refine(
      (val) => val.startsWith("data:image") || val === "" || val === null,
      { message: "Cover must be a data URL, empty string, or null" },
    ),
  albumId: z.string().uuid(),
  trackId: z.string().uuid(),
  trackPath: z.string(),
});

type MetadataPayload = z.infer<typeof payloadSchema>;
