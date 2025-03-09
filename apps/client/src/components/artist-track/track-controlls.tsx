import { Play, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArtistTrackControls({
  tracksCount,
  onShuffleClick,
  onPlayClick,
}: ArtistTrackControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <small className="text-foreground/70">
        {tracksCount} track{tracksCount === 1 ? "" : "s"}
      </small>
      <div className="flex gap-4">
        <Button
          size="icon"
          variant="ghost"
          disabled={!tracksCount}
          onClick={onShuffleClick}
        >
          <Shuffle />
        </Button>
        <Button size="icon" disabled={!tracksCount} onClick={onPlayClick}>
          <Play />
        </Button>
      </div>
    </div>
  );
}

type ArtistTrackControlsProps = {
  tracksCount: number | undefined;
  onPlayClick: () => void;
  onShuffleClick: () => void;
};
