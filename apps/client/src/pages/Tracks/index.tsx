import { usePlayerStore } from "@/stores";
import { Loading } from "./components/loading";
import { useTrackList } from "@/hooks";
import { TracksGrid } from "./components/tracks-grid";
import { useCallback } from "react";
import { TopBar, GlobalSearch } from "@/components";

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
      <GlobalSearch />
      <TopBar />
      <TracksGrid
        onTrackPlay={handleTrackPlay}
        tracks={tracksQuery.data ?? []}
      />
    </>
  );
}
