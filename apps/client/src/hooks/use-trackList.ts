import { useDebounce } from "./use-debounce";
import { useApiClient } from "@/hooks/use-api-client";
import { useFilterStore, usePlayerStore } from "@/stores";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

export const useTrackList = () => {
  const { setPlaylists, playlistOrder } = usePlayerStore(
    useShallow((state) => ({
      setPlaylists: state.setPlaylists,
      playlistOrder: state.playlistOrder,
    })),
  );

  const { sort, query } = useFilterStore();
  const { useTracks, getTrackAudioSrc } = useApiClient();

  const isPlaylistInitialized = useRef(false);
  const debouncedQuery = useDebounce(query, 500);
  const tracksQuery = useTracks(debouncedQuery, sort);
  const { data: tracks } = tracksQuery;

  const trackList = useMemo(() => {
    if (!tracks) return [];
    return tracks.map((track) => ({
      id: track.id,
      src: getTrackAudioSrc([track.id])[0],
    }));
  }, [tracks, getTrackAudioSrc]);

  const resetPlaylist = useCallback(() => {
    if (trackList.length) setPlaylists(trackList);
  }, [trackList, setPlaylists]);

  useEffect(() => {
    if (!tracks || isPlaylistInitialized.current) return;

    if (playlistOrder?.length) {
      const src = getTrackAudioSrc(playlistOrder);
      setPlaylists(playlistOrder.map((id, index) => ({ id, src: src[index] })));
    } else {
      resetPlaylist();
    }

    isPlaylistInitialized.current = true;
  }, [tracks, playlistOrder, getTrackAudioSrc, setPlaylists, resetPlaylist]);

  return { trackList, tracksQuery, resetPlaylist };
};
