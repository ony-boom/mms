export const WIKI_API_URL = "https://en.wikipedia.org/api/rest_v1";

export const lasFmBaseUrl = (() => {
  const baseUrl = new URL("https://ws.audioscrobbler.com/2.0/");
  baseUrl.searchParams.set("format", "json");
  baseUrl.searchParams.set("api_key", import.meta.env.VITE_LASTFM_API_KEY);

  return baseUrl;
})();

export const hasLastFmApiKey = () => {
  return !!import.meta.env.VITE_LASTFM_API_KEY;
};
