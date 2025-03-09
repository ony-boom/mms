import { memo } from "react";
import { Track } from "@/api/types.ts";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useShallow } from "zustand/react/shallow";
import { TrackCover } from "@/components/track-cover";
import { usePlayerStore } from "@/stores/player/store";
import { TrackContextMenu } from "@/components/track-context-menu";
import { ArtistName } from "@/components/artist-name.tsx";

function Card({ track, index, onTrackPlay }: TrackCardProps) {
  const artistNames = track.artists.map((artist) => artist.name);
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
    <>
      <div className="group relative flex flex-col gap-1">
        <TrackContextMenu track={track}>
          <TrackCover
            trackId={track.id}
            trackTitle={track.title}
            onClick={onPlayButtonClick}
            className="mb-2 hover:cursor-pointer"
          />
          <p
            title={track.title}
            className="overflow-hidden text-ellipsis text-nowrap font-bold leading-6"
          >
            {track.title}
          </p>
          <p className="overflow-hidden text-ellipsis text-nowrap">
            {artistNames.map((_, index) => (
              <span key={index}>
                <ArtistName artist={track.artists[index]!} />
                {index !== artistNames.length - 1 && (
                  <span className="text-foreground/70">, </span>
                )}
              </span>
            ))}
          </p>
        </TrackContextMenu>
        <Button
          size="icon"
          onClick={onPlayButtonClick}
          className="absolute bottom-20 right-2 z-20 opacity-0 shadow-xl transition group-hover:opacity-100"
        >
          {isCurrent && isPlaying ? <Pause /> : <Play />}
        </Button>
      </div>
    </>
  );
}

export const TrackCard = memo(Card);

type TrackCardProps = {
  track: Track;
  index: number;
  onTrackPlay: (index: number, id: string) => void;
};
