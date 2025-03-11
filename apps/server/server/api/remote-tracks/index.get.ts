import { Deezer } from "@repo/deezer-sdk";

export default defineEventHandler(async (event) => {
  const query = getQuery<RequestQuery>(event);

  const deezer = new Deezer();

  try {
    const results = await deezer.gw.search(query.query);

    return {
      data: results,
      success: true,
      error: null,
    };
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    //   response 500
    setResponseStatus(event, 500);
    return {
      error: "Internal Server Error",
      data: null,
      success: false,
    };
  }
});

type RequestQuery = {
  query?: string;
};
