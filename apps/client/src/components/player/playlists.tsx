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
	TouchSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
				tolerance: 5,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 0,
				tolerance: 10,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
			activationConstraint: {
				delay: 100,
				tolerance: 5,
			},
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
	const { data: track, isLoading } = useApiClient().useTracks({ id: trackId });

	return isLoading ? (
		<Skeleton className={"h-[64px] mb-4 w-full"} />
	) : (
		track && (
			<TrackListElement
				showWaveBars
				showAction
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
		)
	);
};
