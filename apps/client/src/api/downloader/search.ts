import { useQuery } from "@tanstack/react-query";
import { fetchData } from "./utils";
import { Track } from "@/api/types";
import { formatSingleTrack } from "@/lib/search";
import { CACHE_KEY } from "../constant";
import { useState } from "react";

export const useSearchRemoteTracks = (query: string) => {
  const [remoteSearchResults, setRemoteSearchResults] = useState<Track[]>([]);

  const { isFetching } = useQuery({
    queryKey: [CACHE_KEY.SEARCH_REMOTE_TRACKS, query],
    queryFn: async () => {
      try {
        const response = await fetchData("mainSearch", {
          term: query,
        });

        const trackDatas = response.TRACK.data;
        const formattedDatas: Track[] = trackDatas.map(
          (track: { [key: string]: unknown }) => formatSingleTrack(track),
        );

        setRemoteSearchResults(formattedDatas);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    },
    enabled: !!query,
  });

  return { remoteSearchResults, isFetching };
};
