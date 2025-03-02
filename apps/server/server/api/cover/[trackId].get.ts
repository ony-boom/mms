import { musicLibrary } from "~~/lib/music-manager";
import { prisma } from "~~/prisma";

export default defineEventHandler(async (event) => {
  const trackId = getRouterParam(event, "trackId");

  try {
    setResponseHeader(event, "Content-Type", "image/jpeg");

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        album: true,
      },
    });

    if (!track) {
      setResponseStatus(event, 404);
      return await useStorage("assets:server").getItemRaw("no-album-art.png");
    }

    return await musicLibrary.getCover(track.album.coverPath!);
  } catch (e) {
    setResponseStatus(event, 500);
    return await useStorage("assets:server").getItemRaw("no-album-art.png");
  }
});
