import { prisma } from "~~/prisma";

export default defineEventHandler(async (event) => {
  const trackId = getRouterParam(event, "trackId");
  const { value } = await readBody<{ value: boolean }>(event);

  try {
    const track = await prisma.track.update({
      where: { id: trackId },
      data: {
        isFavorite: value,
      },
    });

    return {
      success: true,
      data: track,
      error: null,
    };
  } catch (e) {
    setResponseStatus(event, 500);
    return {
      success: false,
      data: null,
      error: e.message,
    };
  }
});
