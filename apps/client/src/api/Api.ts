import type {
  UseQueryResult,
  UseMutationResult,
  DefaultError,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  LoadedTracks,
  LyricsResponse,
  SortOrder,
  Track,
  TrackSortField,
} from "@/api/types.ts";

export type GetTrackWhereInput = {
  id?: string;
  title?: string;
  artistName?: string;
  albumTitle?: string;
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

  useFavoriteTrack: <TError = DefaultError>() => UseMutationResult<
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

  getTrackCoverSrc: (trackId: string) => string;
  getTrackAudioSrc: (trackIds: string[]) => string[];
  useTrackLoadEvent: (debounce?: number) => LoadedTracks;
}
