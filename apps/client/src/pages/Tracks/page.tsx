import { memo, useCallback } from "react";
import { Search } from "@/components/global-search/search";
import { useTrackList } from "@/hooks/use-track-list";
import { usePlayerStore } from "@/stores/player/store";
import { Loading } from "./loading";
import { TracksGrid } from "./tracks-grid";

export const Tracks = memo(() => {
  const { toggleShuffle, playTrackAtIndex, currentTrackId, toggle } =
    usePlayerStore.getState();

  const { tracksQuery, resetPlaylist } = useTrackList();

  const handleTrackPlay = useCallback(
    (index: number, id: string) => {
      resetPlaylist();
      const isCurrent = id === currentTrackId;
      if (!isCurrent) {
        toggleShuffle(false);
        playTrackAtIndex(index);
        return;
      }
      toggle();
    },
    [resetPlaylist, currentTrackId, toggle, toggleShuffle, playTrackAtIndex],
  );

  if (tracksQuery.isPending) {
    return (
      <div className="px-4">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Search />
      <TracksGrid
        onTrackPlay={handleTrackPlay}
        tracks={tracksQuery.data ?? []}
      />
    </>
  );
});
