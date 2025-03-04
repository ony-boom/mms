import { memo } from "react";
import { usePlayerStore } from "@/stores";
import { TrackContextMenu } from "@/components/track-context-menu.tsx";
import { TrackCover } from "@/pages/Tracks/components/track-cover.tsx";
import { WaveBars } from "@/components/player/wave-bars.tsx";
import { Track } from "@/api";

export const TrackListElement = memo(
  ({ track, index, onClick, showWaveBars }: TrackListElementProps) => {
    const { currentTrackId } = usePlayerStore.getState();

    const isCurrent = currentTrackId === track?.id;

    if (!track) return <div className="h-[64px]"></div>;

    const handleClick = () => {
      onClick?.(index);
    };

    return (
      <TrackContextMenu track={track}>
        <li
          className="hover:bg-foreground/[5%] mt-2 flex cursor-pointer items-center justify-between p-2"
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
              <small>
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
