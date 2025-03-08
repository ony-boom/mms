import fs from "node:fs";
import { prisma } from "~~/prisma";

export default defineEventHandler(async (event) => {
  const trackId = getRouterParam(event, "trackId");

  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Track not found";
    }

    const filePath = track.path;
    const stat = await fs.promises.stat(filePath);

    setResponseHeaders(event, {
      "Accept-Ranges": "bytes",
      "Content-Type": "audio/mpeg",
    });

    const range = getRequestHeader(event, "range");

    if (!range) {
      setResponseHeader(event, "Content-Length", stat.size);
      return sendStream(event, fs.createReadStream(filePath));
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;

    setResponseStatus(event, 206);
    setResponseHeader(
      event,
      "Content-Range",
      `bytes ${start}-${end}/${stat.size}`,
    );

    setResponseHeader(event, "Content-Length", chunkSize);

    const stream = fs.createReadStream(filePath, { start, end });
    return sendStream(event, stream);
  } catch (e) {
    setResponseStatus(event, 500);
    return e.message;
  }
});
