import { useMemo } from "react";
import { useApiClient } from "@/hooks";
import { usePlayerStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "@/components/track-list-element.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function Playlists() {
  const { playlistOrder, shuffleOrder, isShuffle } = usePlayerStore(
    useShallow((state) => ({
      playlistOrder: state.playlistOrder,
      shuffleOrder: state.shuffleOrder,
      isShuffle: state.isShuffle,
      getCurrentIndex: state.getCurrentIndex,
    })),
  );

  const data = useMemo(
    () => (isShuffle ? shuffleOrder : playlistOrder),
    [isShuffle, shuffleOrder, playlistOrder],
  );

  return (
    <>
      <Virtuoso
        data={data}
        style={{ height: 256 }}
        overscan={8}
        className={"overflow-x-hidden will-change-transform"}
        totalCount={playlistOrder.length}
        itemContent={(index, data) => {
          return <ItemContent index={index} trackId={data} />;
        }}
      />
    </>
  );
}

const ItemContent = ({
  trackId,
  index,
}: {
  trackId: string;
  index: number;
}) => {
  const { playTrackAtIndex } = usePlayerStore.getState();

  const { data: track, isLoading } = useApiClient().useTracks({ id: trackId });

  return isLoading ? (
    <Skeleton className={"h-[68px] w-full"} />
  ) : track ? (
    <TrackListElement
      showWaveBars
      index={index}
      track={track.at(0)}
      onClick={playTrackAtIndex}
    />
  ) : (
    <div className="h-[64px]"></div>
  );
};
