const DEEZER_API_URL = "https://api.deezer.com/search/artist";
export default defineEventHandler(async (event) => {
  const artistName = getRouterParam(event, "artistName");

  try {
    const response = (await fetch(
      `${DEEZER_API_URL}?q=${encodeURIComponent(artistName)}`,
    ).then((res) => res.json())) as {
      data: {
        picture: string;
        picture_small: string;
        picture_medium: string;
        picture_big: string;
        picture_xl: string;
      }[];
    };

    const artist = response.data[0];
    return {
      data: {
        picture: artist.picture,
        picture_small: artist.picture_small,
        picture_medium: artist.picture_medium,
        picture_big: artist.picture_big,
        picture_xl: artist.picture_xl,
      },
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
