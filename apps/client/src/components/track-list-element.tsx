import { memo, MouseEventHandler } from "react";
import { usePlayerStore } from "@/stores/player/store";
import { TrackContextMenu } from "@/components/track-context-menu";
import { TrackCover } from "@/components/track-cover.tsx";
import { WaveBars } from "@/components/player/wave-bars";
import { Track } from "@/api/types";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

export const TrackListElement = memo(
  ({ track, index, onClick, showWaveBars }: TrackListElementProps) => {
    const { currentTrackId } = usePlayerStore(
      useShallow((state) => ({
        currentTrackId: state.currentTrackId,
        removeFromQueue: state.removeFromQueue,
      })),
    );

    const isCurrent = currentTrackId === track?.id;

    if (!track) return <div className="h-[64px]"></div>;

    const handleClick: MouseEventHandler<HTMLLIElement> = (event) => {
      event.stopPropagation();
      onClick?.(index);
    };

    return (
      <TrackContextMenu track={track}>
        <li
          className={cn(
            "hover:bg-foreground/[5%] mt-2 flex cursor-pointer items-center justify-between p-2",
            {
              "bg-foreground/[3%]": isCurrent,
            },
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

          {isCurrent && showWaveBars && <WaveBars />}
        </li>
      </TrackContextMenu>
    );
  },
);

type TrackListElementProps = {
  track?: Track;
  index: number;
  showWaveBars?: boolean;
  onClick?: (index: number) => void;
};
