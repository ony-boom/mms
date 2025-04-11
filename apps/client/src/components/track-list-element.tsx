import { forwardRef, HTMLProps, memo, MouseEventHandler } from "react";
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
import { GripVertical } from "lucide-react";

export const TrackListElement = memo(
  forwardRef<HTMLLIElement, TrackListElementProps>(
    (
      { track, index, onClick, showWaveBars, contextMenuItemProps, ...liProps },
      ref,
    ) => {
      const { currentTrackId } = usePlayerStore(
        useShallow((state) => ({
          currentTrackId: state.currentTrackId,
          removeFromQueue: state.removeFromQueue,
        })),
      );

      const isCurrent = currentTrackId === track?.id;

      if (!track) return <div className="h-[64px]"></div>;

      const handleClick: MouseEventHandler<HTMLLIElement> = (event) => {
        if (isCurrent) return;
        event.stopPropagation();
        onClick?.(index);
      };

      return (
        <TrackContextMenu track={track} itemProps={contextMenuItemProps}>
          <li
            {...liProps}
            ref={ref}
            className={cn(
              "hover:bg-foreground/[5%] group mt-2 flex cursor-pointer items-center justify-between rounded-md p-2",
              {
                "bg-foreground/[3%]": isCurrent,
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
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                hidden={isCurrent}
                className="cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
              >
                <GripVertical />
              </Button>
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
  ),
);

type TrackListElementProps = {
  track?: Track;
  index: number;
  showWaveBars?: boolean;
  onClick?: (index: number) => void;
  contextMenuItemProps?: TrackContextMenuProps["itemProps"];
} & Omit<HTMLProps<HTMLLIElement>, "onClick">;
