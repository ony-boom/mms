import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "@/components/track-list-element.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useApiClient } from "@/hooks/use-api-client";
import { usePlayerStore } from "@/stores/player/store";

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
        overscan={5}
        totalCount={playlistOrder.length}
        style={{ height: 256, overflowX: "hidden", willChange: "transform" }}
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
