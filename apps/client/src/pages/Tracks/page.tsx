import { useCallback } from "react";
import { Loading } from "./loading";
import { TracksGrid } from "./tracks-grid";
import { TopBar } from "@/components/top-bar";
import { useTrackList } from "@/hooks/use-track-list";
import { usePlayerStore } from "@/stores/player/store";
import { Search } from "@/components/global-search/search";

export function Tracks() {
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

  if (tracksQuery.isLoading) {
    return (
      <div className="px-4">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Search />
      <TopBar />
      <TracksGrid
        onTrackPlay={handleTrackPlay}
        tracks={tracksQuery.data ?? []}
      />
    </>
  );
}
