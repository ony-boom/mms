import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "@/components/track-list-element.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useApiClient } from "@/hooks/use-api-client";
import { usePlayerStore } from "@/stores/player/store";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

export function Playlists() {
  const { playlistOrder, shuffleOrder, isShuffle, getCurrentIndex, moveTrack } =
    usePlayerStore(
      useShallow((state) => ({
        playlistOrder: state.playlistOrder,
        shuffleOrder: state.shuffleOrder,
        isShuffle: state.isShuffle,
        getCurrentIndex: state.getCurrentIndex,
        moveTrack: state.moveTrack,
      })),
    );

  const currentIndex = getCurrentIndex();

  const data = useMemo(
    () => (isShuffle ? shuffleOrder : playlistOrder),
    [isShuffle, shuffleOrder, playlistOrder],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 100,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const activeIndex = data.indexOf(active.id as string);
      const overIndex = data.indexOf(over?.id as string);
      if (activeIndex !== -1 && overIndex !== -1) {
        moveTrack(activeIndex, overIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={data} strategy={verticalListSortingStrategy}>
        <Virtuoso
          data={data}
          overscan={5}
          initialTopMostItemIndex={currentIndex}
          totalCount={playlistOrder.length}
          style={{
            height: 256,
            overflowX: "hidden",
            width: "100%",
            willChange: "transform",
          }}
          itemContent={(index, data) => {
            return <ItemContent index={index} trackId={data} />;
          }}
        />
      </SortableContext>
    </DndContext>
  );
}

const ItemContent = ({
  trackId,
  index,
}: {
  trackId: string;
  index: number;
}) => {
  const playTrackAtIndex = usePlayerStore((state) => state.playTrackAtIndex);
  const currentTrackId = usePlayerStore((state) => state.currentTrackId);

  const { data: track, isLoading } = useApiClient().useTracks({ id: trackId });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: trackId, disabled: trackId === currentTrackId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return isLoading ? (
    <Skeleton className={"h-[64px] w-full"} />
  ) : track ? (
    <TrackListElement
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      showWaveBars
      className={"outline-0"}
      index={index}
      track={track.at(0)}
      onClick={playTrackAtIndex}
      contextMenuItemProps={{
        addToQueue: {
          disabled: true,
        },
      }}
    />
  ) : (
    <div className="h-[64px]"></div>
  );
};
