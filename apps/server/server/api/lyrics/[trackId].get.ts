import fs from "node:fs";
import path from "node:path";
import { prisma } from "~~/prisma";
import * as mm from "music-metadata";

export default defineEventHandler(async (event) => {
  const trackId = getRouterParam(event, "trackId");

  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      setResponseStatus(event, 404);
      return {
        success: false,
        error: "Track not found",
        data: null,
      };
    }

    const trackDir = path.dirname(track.path);
    const trackName = path.basename(track.path, path.extname(track.path));
    const lyricsPath = path.join(trackDir, `${trackName}.lrc`);

    if (fs.existsSync(lyricsPath)) {
      const lrcContent = await fs.promises.readFile(lyricsPath, "utf-8");
      return {
        success: true,
        error: null,
        data: {
          text: lrcContent,
          isSync: true,
        },
      };
    }
    const tags = (await mm.parseFile(track.path)).common;
    return {
      success: true,
      error: null,
      data: {
        text: tags.lyrics?.at(0)?.text ?? "",
        isSync: false,
      },
    };
  } catch (e) {
    setResponseStatus(event, 500);
    return {
      success: false,
      error: e.message,
      data: null,
    };
  }
});
