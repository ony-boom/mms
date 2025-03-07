import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { memo } from "react";
import { FavouriteButton } from "../favourite-button";
import { ShuffleButton } from "./shuffle-button";

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

  return (
    <div
      aria-labelledby="controller"
      className="flex items-center justify-center gap-2"
    >
      <FavouriteButton variant="ghost" />
      <ShuffleButton/>
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
export type ControllerProps = {
  shouldPlay?: boolean;
};
