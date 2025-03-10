import type { Api } from "@/api/Api";
import { createClient } from "graphql-sse";
import { useEffect, useState } from "react";
import { CACHE_KEY } from "@/api/constant.ts";
import { axiosClient, BASE_URL } from "./axios-client";
import {
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { LoadedTracks, LyricsResponse, Track } from "@/api/types";

import { GET_LYRICS } from "./queries/lyrics";
import { GET_TRACKS } from "./queries/get-tracks";
import { FAVORITE_TRACK } from "./queries/favorite-track";
import { LOAD_TRACK, TRACK_LOAD } from "./queries/track-load";

export const graphqlApi: Api = {
  useTracks: (where, sortBy) => {
    return useQuery<Track[]>({
      queryKey: [CACHE_KEY.TRACKS, where, sortBy],
      queryFn: async () => {
        const { data: responseData } = await axiosClient.post<{
          data: { tracks: Track[] };
        }>("/graphql", {
          query: GET_TRACKS,
          variables: { where, sortBy },
        });

        return responseData.data.tracks;
      },
    });
  },

  useLoadTracks: () => {
    return useMutation({
      mutationFn: async () => {
        const { data: responseData } = await axiosClient.post<{
          data: { loadTracks: boolean };
        }>("/graphql", {
          query: LOAD_TRACK,
        });

        return responseData.data.loadTracks;
      },
    });
  },

  getTrackCoverSrc: (trackId) => {
    return `${BASE_URL}/api/cover/${trackId}`;
  },

  getTrackAudioSrc: (trackIds) => {
    return trackIds.map((trackId) => `${BASE_URL}/api/audio/${trackId}`);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useTrackLoadEvent: (_debounce) => {
    const [state, setState] = useState<LoadedTracks>({
      current: 0,
      total: 0,
    });

    useEffect(() => {
      const client = createClient({ url: `${BASE_URL}/graphql` });

      (async () => {
        const subscription = client.iterate({
          query: TRACK_LOAD,
        });

        try {
          for await (const result of subscription) {
            const { data } = result as { data: { loadedTrack: LoadedTracks } };
            if (data) {
              setState(data.loadedTrack);
            }
          }
          client.dispose();
        } catch {
          client.dispose();
        }
      })();

      return () => {
        client.dispose();
      };
    }, []);

    return state;
  },

  useTrackLyrics(trackId) {
    return useQuery<LyricsResponse>({
      queryKey: [CACHE_KEY.LYRICS, trackId],
      queryFn: async () => {
        const { data: responseData } = await axiosClient.post<{
          data: { lyrics: LyricsResponse };
        }>("/graphql", {
          query: GET_LYRICS,
          variables: { trackId },
        });

        return responseData.data.lyrics;
      },
    });
  },

  useUpdateTrack() {
    // TODO: Implement
    return useMutation({});
  },

  useFavoriteTrack: () => {
    return useMutation({
      mutationFn: async ({ trackId, value }) => {
        const { data: responseData } = await axiosClient.post<{
          data: { favoriteTrack: Partial<Track> };
        }>("/graphql", {
          query: FAVORITE_TRACK,
          variables: { trackId, value: value ?? true },
        });

        return responseData.data.favoriteTrack;
      },
    });
  },
  useArtistTracks: function (): UseQueryResult<Track[]> {
    throw new Error("Function not implemented.");
  },
  useArtistImage: function (): UseQueryResult<string> {
    throw new Error("Function not implemented.");
  },
};
