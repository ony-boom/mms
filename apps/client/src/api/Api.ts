import type {
  UseQueryResult,
  UseMutationResult,
  DefaultError,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  ImageSize,
  LoadedTracks,
  LyricsResponse,
  PingResponse,
  SortOrder,
  Track,
  TrackSortField,
  User,
} from "@/api/types.ts";

export type GetTrackWhereInput = {
  id?: string;
  title?: string;
  artistName?: string;
  albumTitle?: string;
  isFavorite?: boolean;
};

export type GetTrackSortByInput = {
  field: TrackSortField;
  order: SortOrder;
};

export type Payload = {
  title: string;
  album: string;
  artist: string;
  cover: string;
};

export interface Api {
  useTracks: (
    where?: GetTrackWhereInput,
    sortBy?: GetTrackSortByInput,
    options?: Omit<UseQueryOptions<Track[]>, "queryFn" | "queryKey">,
  ) => UseQueryResult<Track[]>;

  useArtistTracks: (
    artistId: string,
    options?: Omit<UseQueryOptions<Track[]>, "queryFn" | "queryKey">,
  ) => UseQueryResult<Track[]>;

  useLoadTracks: (
    options?: Omit<UseQueryOptions, "queryFn" | "queryKey">,
  ) => UseMutationResult<boolean>;

  useTrackLyrics: (
    trackId: string,
    options?: Omit<UseQueryOptions, "queryFn" | "queryKey">,
  ) => UseQueryResult<LyricsResponse>;

  useFavoriteTrackMutation: <TError = DefaultError>() => UseMutationResult<
    Partial<Track>,
    TError,
    {
      trackId: string;
      value?: boolean;
    }
  >;

  useUpdateTrack: <TError = DefaultError>() => UseMutationResult<
    Track,
    TError,
    Payload & {
      albumId: string;
      trackId: string;
      trackPath: string;
    }
  >;

  useArtistImage: (
    artistName: string,
    options?: Omit<UseQueryOptions<string>, "queryFn" | "queryKey">,
  ) => UseQueryResult<string>;

  usePing: (
    options?: Omit<UseQueryOptions<PingResponse>, "queryFn" | "queryKey">,
  ) => UseQueryResult<PingResponse>;

  useLogin: <TError = DefaultError>() => UseMutationResult<
    User,
    TError,
    {
      username: string;
      password: string;
    }
  >;

  useUpdateProfile: <TError = DefaultError>() => UseMutationResult<
    User,
    TError,
    {
      id: string;
      username: string;
      password: string;
    }
  >;

  useLogout: <TError = DefaultError>() => UseMutationResult<void, TError, void>;

  getTrackCoverSrc: (trackId: string, size?: ImageSize) => string;
  getTrackAudioSrc: (trackIds: string[]) => string[];
  useTrackLoadEvent: (params: {
    debounce?: number;
    enabled: boolean;
  }) => LoadedTracks;
}
