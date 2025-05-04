import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { ComponentProps, memo } from "react";
import { usePlayerStore } from "@/stores/player/store";
import { cn } from "@/lib/utils";

export const Controller = memo(({ shouldPlay, className, ...rest }: ControllerProps) => {
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
      shuffleOrder: state.shuffleOrder,
    })),
  );

  return (
    <div
      {...rest}
      aria-labelledby="controller"
      className={cn("flex grow shrink-0 items-center justify-center gap-2", className)}
    >
      <Button
        onClick={playerState.playPrev}
        disabled={!playerState.hasPrev() || !playerState.currentTrackId}
        size="icon"
        variant="ghost"
      >
        <SkipBack />
      </Button>
      <Button
        disabled={Boolean(shouldPlay) || !playerState.currentTrackId}
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

export type ControllerProps = ComponentProps<'div'> & {
  shouldPlay?: boolean;
};
