import { useRef } from "react";
import { useApiClient } from "@/hooks";
import { usePlayerStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { TrackListElement } from "@/components/track-list-element.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function Playlists() {
  const { playlistOrder, shuffleOrder, isShuffle, getCurrentIndex } =
    usePlayerStore(
      useShallow((state) => ({
        playlistOrder: state.playlistOrder,
        shuffleOrder: state.shuffleOrder,
        isShuffle: state.isShuffle,
        getCurrentIndex: state.getCurrentIndex,
      })),
    );
  const virtuoso = useRef<VirtuosoHandle>(null);

  const playingIndex = getCurrentIndex();

  return (
    <>
      <Virtuoso
        ref={virtuoso}
        data={isShuffle ? shuffleOrder : playlistOrder}
        style={{ height: 256 }}
        initialTopMostItemIndex={playingIndex}
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
    <Skeleton className={"h-[64px] w-full"} />
  ) : (
    track && (
      <TrackListElement
        showWaveBars
        index={index}
        track={track.at(0)}
        onClick={playTrackAtIndex}
      />
    )
  );
};
