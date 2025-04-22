import { HTMLProps, memo, MouseEventHandler } from "react";
import { usePlayerStore } from "@/stores/player/store";
import {
  TrackContextMenu,
  TrackContextMenuProps,
} from "@/components/track-context-menu";
import { TrackCover } from "@/components/track-cover.tsx";
import { WaveBars } from "@/components/player/wave-bars";
import { Track } from "@/api/types";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { GripVertical, ListMinus } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

export const TrackListElement = memo(
  ({
    track,
    index,
    onClick,
    showWaveBars,
    showAction,
    focused,
    contextMenuItemProps,
    ...liProps
  }: TrackListElementProps) => {
    const { currentTrackId, removeFromQueue } = usePlayerStore(
      useShallow((state) => ({
        currentTrackId: state.currentTrackId,
        removeFromQueue: state.removeFromQueue,
      })),
    );

    const isCurrent = currentTrackId === track?.id;

    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({
        id: track?.id || "",
        disabled: track?.id === currentTrackId,
      });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    if (!track) return <div className="h-[64px]"></div>;

    const handleClick: MouseEventHandler<HTMLLIElement> = (event) => {
      if (isCurrent) return;
      event.stopPropagation();
      onClick?.(index);
    };

    const handleRemove = (event: React.MouseEvent) => {
      event.stopPropagation();
      removeFromQueue(index);
    };

    return (
      <TrackContextMenu track={track} itemProps={contextMenuItemProps}>
        <li
          {...liProps}
          style={style}
          ref={setNodeRef}
          className={cn(
            "hover:bg-foreground/[5%] group mt-2 flex cursor-pointer items-center justify-between rounded-md p-2",
            {
              "bg-foreground/[3%]": isCurrent,
            },
            {
              "bg-foreground/[5%]": focused
            },
            liProps.className,
          )}
          onClick={handleClick}
        >
          <div className="flex items-end gap-3">
            <TrackCover
              className="w-12"
              trackId={track.id}
              trackTitle={track.title}
            />

            <div className="flex flex-col">
              <small className="font-bold">{track.title}</small>
              <small className="text-foreground/80">
                {track.artists.map((artist) => artist.name).join(", ")}
              </small>
            </div>
          </div>
          <div className="flex items-center">
            {!isCurrent && showAction && (
              <div className="flex gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  onClick={handleRemove}
                  title="Remove from queue"
                  size="icon"
                  variant="ghost"
                >
                  <ListMinus />
                </Button>
                <Button
                  size="icon"
                  {...attributes}
                  {...listeners}
                  variant="ghost"
                  className="cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                >
                  <GripVertical />
                </Button>
              </div>
            )}
            {isCurrent && showWaveBars && (
              <div className="px-2">
                <WaveBars />
              </div>
            )}
          </div>
        </li>
      </TrackContextMenu>
    );
  },
);

type TrackListElementProps = {
  track?: Track;
  index: number;
  focused?: boolean;
  showWaveBars?: boolean;
  showAction?: boolean;
  onClick?: (index: number) => void;
  contextMenuItemProps?: TrackContextMenuProps["itemProps"];
} & Omit<HTMLProps<HTMLLIElement>, "onClick">;
