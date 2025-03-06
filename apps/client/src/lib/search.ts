import { Track } from "@/api/types";
import { getPropertyWithFallback } from "./utils";

export function formatSingleTrack(track: { [key: string]: unknown }) {
  let remoteTrackIsExplicit = getPropertyWithFallback(
    track,
    "explicit_lyrics",
    "EXPLICIT_LYRICS",
  );

  if (typeof remoteTrackIsExplicit === "string") {
    remoteTrackIsExplicit = remoteTrackIsExplicit !== "0";
  }

  return {
    /* Track */
    remoteTrackTitle: getPropertyWithFallback(track, "title", "SNG_TITLE"),
    remoteTrackVersion: getPropertyWithFallback(
      track,
      "title_version",
      "VERSION",
    ),
    remoteTrackPreview: getPropertyWithFallback(
      track,
      "preview",
      "MEDIA.0.HREF",
    ),
    remoteTrackDuration: getPropertyWithFallback(track, "duration", "DURATION"),
    remoteTrackLink:
      getPropertyWithFallback(track, "link") ||
      `https://www.deezer.com/track/${track.SNG_ID}`,
    remoteTrackIsExplicit,

    /* Artist */
    remoteArtistId: getPropertyWithFallback(track, "artist.id", "ART_ID"),
    remoteArtistName: getPropertyWithFallback(track, "artist.name", "ART_NAME"),

    /* Album */
    remoteAlbumId: getPropertyWithFallback(track, "album.id", "ALB_ID"),
    remoteAlbumTitle: getPropertyWithFallback(
      track,
      "album.title",
      "ALB_TITLE",
    ),
    remoteAlbumCover:
      getPropertyWithFallback(track, "album.cover_small") ||
      `https://e-cdns-images.dzcdn.net/images/cover/${track.ALB_PICTURE}/56x56-000000-80-0-0.jpg`,
    isRemoteTrack: true,
  } as Track;
}

export function formatAlbums(album: Record<string, unknown>) {
  let isAlbumExplicit = getPropertyWithFallback(
    album,
    "explicit_lyrics",
    "EXPLICIT_ALBUM_CONTENT.EXPLICIT_LYRICS_STATUS",
  );

  if (typeof isAlbumExplicit === "number") {
    isAlbumExplicit = isAlbumExplicit === 1;
  }

  return {
    /* Album */
    albumID: getPropertyWithFallback(album, "id", "ALB_ID"),
    albumTitle: getPropertyWithFallback(album, "title", "ALB_TITLE"),
    albumCoverMedium:
      getPropertyWithFallback(album, "cover_medium") ||
      `https://e-cdns-images.dzcdn.net/images/cover/${album.ALB_PICTURE}/156x156-000000-80-0-0.jpg`,
    albumLink:
      getPropertyWithFallback(album, "link") ||
      `https://deezer.com/album/${album.ALB_ID}`,
    albumTracks: getPropertyWithFallback(album, "nb_tracks", "NUMBER_TRACK"),
    isAlbumExplicit,

    /* Artist */
    artistName: getPropertyWithFallback(album, "artist.name", "ART_NAME"),
  };
}

export function formatArtist(artist: { [key: string]: unknown }) {
  return {
    /* Artist */
    artistID: getPropertyWithFallback(artist, "id", "ART_ID"),
    artistName: getPropertyWithFallback(artist, "name", "ART_NAME"),
    artistPictureMedium:
      getPropertyWithFallback(artist, "picture_medium") ||
      `https://e-cdns-images.dzcdn.net/images/artist/${artist.ART_PICTURE}/156x156-000000-80-0-0.jpg`,
    artistLink:
      getPropertyWithFallback(artist, "link") ||
      `https://deezer.com/artist/${artist.ART_ID}`,
    // TODO Fix
    artistAlbumsNumber: getPropertyWithFallback(artist, "nb_album", "NB_FAN"),
  };
}

export function formatPlaylist(playlist: { [key: string]: unknown }) {
  return {
    /* Playlist */
    playlistID: getPropertyWithFallback(playlist, "id", "PLAYLIST_ID"),
    playlistTitle: getPropertyWithFallback(playlist, "title", "TITLE"),
    playlistPictureMedium:
      getPropertyWithFallback(playlist, "picture_medium") ||
      `https://e-cdns-images.dzcdn.net/images/${playlist.PICTURE_TYPE}/${playlist.PLAYLIST_PICTURE}/156x156-000000-80-0-0.jpg`,
    playlistLink:
      getPropertyWithFallback(playlist, "link") ||
      `https://deezer.com/playlist/${playlist.PLAYLIST_ID}`,
    playlistTracksNumber: getPropertyWithFallback(
      playlist,
      "nb_tracks",
      "NB_SONG",
    ),

    /* Artist */
    artistName: getPropertyWithFallback(
      playlist,
      "user.name",
      "PARENT_USERNAME",
    ),
  };
}

export function formatTitle(track: { [key: string]: unknown }) {
  const trackTitle = track.trackTitle as string;
  const trackTitleVersion = track.trackTitleVersion as string;

  const hasTitleVersion =
    trackTitleVersion && !trackTitle.includes(trackTitleVersion);

  return `${trackTitle}${hasTitleVersion ? ` ${trackTitleVersion}` : ""}`;
}
