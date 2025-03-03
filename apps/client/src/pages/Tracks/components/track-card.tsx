import { memo } from "react";
import { Track } from "@/api";
import { useFilterStore, usePlayerStore } from "@/stores";
import { TrackCover } from "./track-cover";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackContextMenu } from "@/components";
import { useShallow } from "zustand/react/shallow";

function Card({ track, index, onTrackPlay }: TrackCardProps) {
  const artistNames = track.artists.map((artist) => artist.name);
  const { setQueryField, setQuery } = useFilterStore.getState();
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

  const onArtistClick = (index: number) => {
    const artistName = track.artists[index].name;
    setQueryField("artistName");
    setQuery({ artistName });
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
        <p className="overflow-hidden text-ellipsis text-nowrap text-sm">
          {artistNames.map((name, index) => (
            <Button
              variant="link"
              className="text-foreground p-0"
              onClick={() => onArtistClick(index)}
            >
              {index === artistNames.length - 1 ? name : `${name}, `}
            </Button>
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
  );
}

export const TrackCard = memo(Card);

type TrackCardProps = {
  track: Track;
  index: number;
  onTrackPlay: (index: number, id: string) => void;
};
