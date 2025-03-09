import { CACHE_KEY } from "@/api/constant.ts";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  ArtistWikiSummary,
  LasFmArtistInfoRawResponse,
} from "@/api/wiki/types.ts";
import { hasLastFmApiKey, lasFmBaseUrl, WIKI_API_URL } from "./utils";

const withWikipedia = async (artistName: string) => {
  const url = `${WIKI_API_URL}/page/summary/${encodeURIComponent(artistName)}`;
  // TODO: Handle errors
  const wikResponse = (await fetch(url).then((response) =>
    response.json(),
  )) as {
    extract_html: string;
    description: string;
  };

  return {
    htmlSummary: wikResponse.extract_html,
    description: wikResponse.description,
  } satisfies ArtistWikiSummary;
};

export function useArtistBio(
  artistName: string,
  options?: Omit<UseQueryOptions<ArtistWikiSummary>, "queryKey" | "queryFn">,
) {
  return useQuery({
    ...options,
    queryKey: [CACHE_KEY.ARTIST_BIO, artistName],
    queryFn: async () => {
      const hasLastFm = hasLastFmApiKey();
      if (!hasLastFm) {
        return withWikipedia(artistName);
      }
      lasFmBaseUrl.searchParams.set("method", "artist.getinfo");
      lasFmBaseUrl.searchParams.set("artist", artistName);
      const lastFmResponse = (await fetch(lasFmBaseUrl.toString()).then((res) =>
        res.json(),
      )) as LasFmArtistInfoRawResponse;

      return {
        htmlSummary: lastFmResponse.artist.bio.content,
        description: lastFmResponse.artist.bio.summary,
      };
    },
  });
}
