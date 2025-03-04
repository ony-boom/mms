import { useRef } from "react";
import { Separator } from "../ui/separator";
import { usePlayerStore } from "@/stores";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useShallow } from "zustand/react/shallow";
import { TrackListElement } from "@/components/track-list-element.tsx";
import { useApiClient } from "@/hooks";

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
      <Separator className="bg-foreground/[8%] w-full" />
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

  const { data: track } = useApiClient().useTracks({ id: trackId });

  return (
    <TrackListElement
      showWaveBars
      index={index}
      track={track?.at(0)}
      onClick={playTrackAtIndex}
    />
  );
};
