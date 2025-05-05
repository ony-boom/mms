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
    <div className="group relative overflow-hidden">
      <TrackContextMenu track={track}>
        <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-2">
          <TrackCover
            trackId={track.id}
            trackTitle={track.title}
            onClick={onPlayButtonClick}
            className="mb-2 h-16 w-16 flex-shrink-0 hover:cursor-pointer md:h-full md:w-full"
          />

          <div className="min-w-0 flex-1 pr-4 md:w-full md:pr-0">
            <p title={track.title} className="truncate font-bold leading-6">
              {track.title}
            </p>
            <div className="truncate text-sm">
              {artistNames.map((_, index) => (
                <span key={index}>
                  <ArtistName artist={track.artists[index]!} />
                  {index !== artistNames.length - 1 && (
                    <span className="text-foreground/70">, </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </TrackContextMenu>
      <Button
        size="icon"
        onClick={onPlayButtonClick}
        className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 shadow-xl transition md:bottom-20 md:top-auto md:flex md:opacity-0 md:group-hover:opacity-100"
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
