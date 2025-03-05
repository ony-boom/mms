import { Api } from "@/api/Api.ts";
import { LoadedTracks, TrackSortField } from "@/api";
import { CACHE_KEY } from "@/api/constant.ts";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

export const BASE_URL =
  import.meta.env.VITE_DEFAULT_REST_API_URL ?? "http://localhost:3000";

const mapTrackSortField = (field: TrackSortField) => {
  const obj: Record<TrackSortField, string> = {
    [TrackSortField.TITLE]: "title",
    [TrackSortField.DATE_ADDED]: "dateAdded",
    [TrackSortField.ALBUM_TITLE]: "album",
    [TrackSortField.NONE]: "",
  };

  return obj[field];
};

export const rest: Api = {
  getTrackCoverSrc: (trackId: string) => {
    return `${BASE_URL}/api/cover/${trackId}`;
  },
  getTrackAudioSrc: (trackIds: string[]) => {
    return trackIds.map((trackId) => `${BASE_URL}/api/tracks/audio/${trackId}`);
  },

  useLoadTracks: () => {
    return useMutation({
      mutationFn: async () => {
        const response = await fetch(`${BASE_URL}/api/tracks/load`, {
          method: "POST",
        });

        const { data } = await response.json();
        return data;
      },
    });
  },

  useTracks: (where, sortBy, options) => {
    return useQuery({
      queryKey: [CACHE_KEY.TRACKS, where, sortBy],
      queryFn: async () => {
        const newUrl = new URL(`${BASE_URL}/api/tracks`);

        if (where) {
          const fields: Record<string, string> = {
            id: "id",
            title: "*",
            albumTitle: "album",
            artistName: "artist",
          };

          for (const key of Object.keys(fields)) {
            const typedKey = key as keyof typeof where;
            if (where[typedKey]) {
              newUrl.searchParams.append("field", fields[typedKey] ?? "*");
              newUrl.searchParams.append("query", where[typedKey] ?? "");
              break;
            }
          }
        }

        if (sortBy) {
          newUrl.searchParams.append(
            "orderByField",
            mapTrackSortField(sortBy.field),
          );
          newUrl.searchParams.append(
            "orderByDirection",
            sortBy.order.toLowerCase(),
          );
        }

        const response = await fetch(newUrl.toString());
        const { data } = await response.json();
        return data;
      },
      ...options,
    });
  },

  updateTrack: async (payload, trackId) => {
    const newUrl = new URL(`${BASE_URL}/api/tracks/metadata/${trackId}`);
    const response = await fetch(newUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    return response.json()
  },

  useTrackLoadEvent: () => {
    const [state, setState] = useState<LoadedTracks>({
      current: 0,
      total: 0,
    });

    useEffect(() => {
      const eventSource = new EventSource(`${BASE_URL}/api/tracks/load/sse`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "status") return;

        const { current, total } = data;

        setState({ current, total });
      };

      return () => {
        eventSource.close();
      };
    }, []);

    return state;
  },

  useFavoriteTrack: () => {
    return useMutation({
      mutationFn: async ({ trackId, value }) => {
        const response = await fetch(
          `${BASE_URL}/api/tracks/favorite/${trackId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value: value ?? true }),
          },
        );

        const { data } = await response.json();
        return data;
      },
    });
  },

  useTrackLyrics: (trackId) => {
    return useQuery({
      queryKey: [CACHE_KEY.LYRICS, trackId],
      queryFn: async () => {
        const response = await fetch(`${BASE_URL}/api/lyrics/${trackId}`);
        const { data } = await response.json();

        return data;
      },
    });
  },
};
