import { memo } from "react";
import { Track } from "@/api";
import { usePlayerStore } from "@/stores";
import { TrackCover } from "./track-cover";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackContextMenu } from "@/components";
import { useShallow } from "zustand/react/shallow";

function Card({ track, index, onTrackPlay }: TrackCardProps) {
  const artistNames = track.artists.map((artist) => artist.name).join(", ");
  const { currentTrackId, isPlaying } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      isPlaying: state.isPlaying,
    })),
  );

  const isCurrent = track.id === currentTrackId;

  const onPlayButtonClick = () => {
    onTrackPlay(index, track.id);
  };

  return (
    <div className="group relative flex flex-col gap-1">
      <TrackContextMenu track={track}>
        <TrackCover
          className="mb-2"
          trackId={track.id}
          trackTitle={track.title}
        />
        <p
          title={track.title}
          className="overflow-hidden text-ellipsis text-nowrap font-bold"
        >
          {track.title}
        </p>
        <p
          title={artistNames}
          className="overflow-hidden text-ellipsis text-nowrap text-sm"
        >
          {artistNames}
        </p>
      </TrackContextMenu>
      <Button
        size="icon"
        onClick={onPlayButtonClick}
        className="absolute bottom-16 right-2 z-20 opacity-0 shadow-xl transition group-hover:opacity-100"
      >
        {isCurrent && isPlaying ? <Pause /> : <Play />}
      </Button>
    </div>
  );
}

export const TrackCard = memo(Card);

type TrackCardProps = {
  track: Track;
  index: number;
  onTrackPlay: (index: number, id: string) => void;
};
