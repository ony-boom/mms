export type Track = {
  id: string;
  title: string;
  path: string;
  artists: Artist[];
  dateAdded?: string;
  isFavorite?: boolean;
};

export type LoadedTracks = { current: number; total: number; };

export type LyricsResponse = {
  isSync: boolean;
  text: string;
};

export type Artist = {
  id: string;
  name: string;
};

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export enum TrackSortField {
  TITLE = "TITLE",
  DATE_ADDED = "DATE_ADDED",
  ALBUM_TITLE = "ALBUM_TITLE",
  NONE = "",
}
