import { Api } from "@/api/Api";
import { CACHE_KEY } from "@/api/constant";
import { useEffect, useState } from "react";
import { http } from "./http-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadedTracks, TrackSortField } from "@/api/types";

const mapTrackSortField = (field: TrackSortField) => {
  const obj: Record<TrackSortField, string> = {
    [TrackSortField.TITLE]: "title",
    [TrackSortField.DATE_ADDED]: "dateAdded",
    [TrackSortField.ALBUM_TITLE]: "album",
    [TrackSortField.NONE]: "",
  };

  return obj[field];
};

export const restApi: Api = {
  getTrackCoverSrc: (trackId, size) =>
    `/api/cover/${trackId}${size ? `?size=${size}` : ""}`,

  getTrackAudioSrc: (trackIds) =>
    trackIds.map((trackId) => `/api/tracks/audio/${trackId}`),

  useArtistImage: (artistName, options) =>
    useQuery({
      queryKey: [CACHE_KEY.ARTIST_IMAGE, artistName],
      queryFn: async () => {
        const { data } = await http(
          `/api/cover/fromDeezer/${encodeURIComponent(artistName)}`,
        );
        return data.picture_big || "";
      },
      ...options,
    }),

  useLoadTracks: () =>
    useMutation({
      mutationFn: async () => {
        const { data } = await http(`/api/tracks/load`, {
          method: "POST",
        });
        return data;
      },
    }),

  useTracks: (where, sortBy, options) =>
    useQuery({
      queryKey: [CACHE_KEY.TRACKS, where, sortBy],
      queryFn: async () => {
        const url = new URL("/api/tracks", window.location.origin);

        if (where) {
          const fields: Record<string, string> = {
            id: "id",
            title: "*",
            albumTitle: "album",
            artistName: "artist",
            isFavorite: "isFavorite",
          };

          for (const key of Object.keys(fields)) {
            const typedKey = key as keyof typeof where;
            if (typedKey === "isFavorite") {
              if (where.isFavorite) {
                url.searchParams.append("isFavorite", "true");
              }
              continue;
            }

            if (where[typedKey]) {
              url.searchParams.append("field", fields[typedKey] ?? "*");
              url.searchParams.append("query", where[typedKey] ?? "");
              break;
            }
          }
        }

        if (sortBy) {
          url.searchParams.append(
            "orderByField",
            mapTrackSortField(sortBy.field),
          );
          url.searchParams.append(
            "orderByDirection",
            sortBy.order.toLowerCase(),
          );
        }

        const { data } = await http(url.pathname + url.search);
        return data;
      },
      ...options,
    }),

  useUpdateTrack: () =>
    useMutation({
      mutationFn: async (payload) =>
        http(`/api/tracks/metadata/${payload.trackId}`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
    }),

  useTrackLoadEvent: ({ enabled }) => {
    const [state, setState] = useState<LoadedTracks>({
      current: 0,
      total: 0,
    });

    useEffect(() => {
      if (!enabled) return;

      const eventSource = new EventSource(`/api/tracks/load/sse`, {
        withCredentials: true,
      });

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "status") return;

        const { current, total } = data;
        setState({ current, total });
      };

      return () => {
        eventSource.close();
      };
    }, [enabled]);

    return state;
  },

  useFavoriteTrackMutation: () =>
    useMutation({
      mutationFn: async ({ trackId, value }) => {
        const { data } = await http(`/api/tracks/favorite/${trackId}`, {
          method: "POST",
          body: JSON.stringify({ value: value ?? true }),
        });
        return data;
      },
    }),

  useTrackLyrics: (trackId) =>
    useQuery({
      queryKey: [CACHE_KEY.LYRICS, trackId],
      queryFn: async () => {
        const { data } = await http(`/api/lyrics/${trackId}`);
        return data;
      },
    }),

  useArtistTracks: (artistId, options) =>
    useQuery({
      queryKey: [CACHE_KEY.ARTIST_TRACKS, artistId],
      queryFn: async () => {
        const { data } = await http(`/api/tracks/byArtist/${artistId}`);
        return data;
      },
      ...options,
    }),

  usePing: (opts) =>
    useQuery({
      ...opts,
      queryKey: [CACHE_KEY.PING],
      queryFn: async () => {
        const response = await http(`/api/ping`);
        // The server returns a wrapped payload: { success, error, data: { ... } }
        // Map it to the PingResponse shape expected by the client
        return response?.data ?? {};
      },
    }),

  useLogin: () =>
    useMutation({
      mutationFn: async (loginParams) => {
        const { data } = await http(`/api/auth/login`, {
          method: "POST",
          body: JSON.stringify(loginParams),
        });
        return data;
      },
    }),

  useLogout: () => {
    return useMutation({
      mutationFn: async () => {
        const { data } = await http("/api/auth/logout", {
          method: "POST",
        });
        return data;
      },
    });
  },

  useUpdateProfile: () => {
    return useMutation({
      mutationFn: async (profile) => {
        const { data } = await http(`/api/user/${profile.id}`, {
          method: "PUT",
          body: JSON.stringify(profile),
        });
        return data;
      },
    });
  },
};
