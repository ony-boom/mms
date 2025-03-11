import { deemixApp } from "@/utils/deemix-app";
import { Deezer } from "@repo/deezer-sdk";

export default defineEventHandler(async (event) => {
  // get url field from body
  const { url: urlBody } = await readBody<{ url: string }>(event);

  const url = urlBody.split(/[\s;]+/);

  const deezer = new Deezer();

  // handle error if url is not provided
  if (!url || url.length === 0) {
    setResponseStatus(event, 400);
    return {
      success: false,
      data: null,
      error: "URL is required",
    };
  }

  try {
    const response = await deemixApp.addToQueue(deezer, url, 0);
    return {
      success: true,
      data: response,
      error: null,
    };
  } catch (error) {
    setResponseStatus(event, 500);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
});
