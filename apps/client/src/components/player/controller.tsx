import { Pause, Play, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { FavouriteButton } from "@/components";
import { useShallow } from "zustand/react/shallow";
import { memo } from "react";

export const Controller = memo(({ shouldPlay }: ControllerProps) => {
  const playerState = usePlayerStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      currentTrackId: state.currentTrackId,
      toggle: state.toggle,
      playNext: state.playNext,
      playPrev: state.playPrev,
      toggleShuffle: state.toggleShuffle,
      isShuffle: state.isShuffle,
      hasNext: state.hasNext,
      hasPrev: state.hasPrev,
      getCurrentPlaylist: state.getCurrentPlaylist,
      playlistOrder: state.playlistOrder, // just to trigger re-render so hasPrev/hasNext works
    })),
  );

  const handleShuffle = () => {
    playerState.toggleShuffle();
  };

  return (
    <div aria-labelledby="controller" className="flex items-center gap-2">
      <FavouriteButton variant={"ghost"} />
      <Button
        onClick={handleShuffle}
        className={
          playerState.isShuffle ? "text-foreground" : "text-foreground/50"
        }
        size="icon"
        variant="ghost"
        disabled={playerState.getCurrentPlaylist().length === 0}
      >
        <Shuffle />
      </Button>
      <Button
        onClick={playerState.playPrev}
        disabled={!playerState.hasPrev() || !playerState.currentTrackId}
        size="icon"
        variant="ghost"
      >
        <SkipBack />
      </Button>
      <Button
        disabled={Boolean(shouldPlay)}
        onClick={playerState.toggle}
        size="icon"
      >
        {playerState.isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button
        onClick={playerState.playNext}
        disabled={!playerState.hasNext() || !playerState.currentTrackId}
        size="icon"
        variant="ghost"
      >
        <SkipForward />
      </Button>
    </div>
  );
});
export type ControllerProps = {
  shouldPlay?: boolean;
};
