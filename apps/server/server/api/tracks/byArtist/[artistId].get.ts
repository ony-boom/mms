import { prisma } from "~~/prisma";

export default defineEventHandler(async (event) => {
  const artistId = getRouterParam(event, "artistId");

  try {
    const tracks = await prisma.track.findMany({
      where: {
        artists: {
          some: {
            id: artistId,
          },
        },
      },

      include: {
        artists: true,
        album: true,
      },
    });

    return {
      data: tracks,
      error: null,
      success: true,
    };
  } catch (e) {
    setResponseStatus(event, 500);
    return {
      data: null,
      error: e.message,
      success: false,
    };
  }
});
