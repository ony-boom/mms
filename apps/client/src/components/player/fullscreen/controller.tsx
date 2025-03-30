import { motion } from "motion/react";
import { FavouriteButton } from "../../favourite-button";
import { useAudioRef } from "@/hooks/use-audio-ref";
import {
  useVolumeCompClickEventHandler,
  useVolumeCompWheelEventHandler,
} from "@/hooks/use-volume-comp-event-handler";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ShuffleButton } from "../shuffle-button";
import { usePlayerStore } from "@/stores/player/store";
import { Controller } from "../controller";
import { VolumeComp } from "../extra";
import { useShallow } from "zustand/react/shallow";
import { TrackProgress } from "../track-progress";

export const LocalController = () => {
  const audioRef = useAudioRef();
  const { volume, muted } = usePlayerStore(
    useShallow((state) => ({
      volume: state.volume,
      muted: state.muted,
    })),
  );

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  const onVolumeSliderWheel = useVolumeCompWheelEventHandler();
  const onVolumeIconClick = useVolumeCompClickEventHandler();

  return (
    <div className="sticky bottom-0 mx-auto w-[80%] max-w-7xl p-8">
      <Progress />
      <div className="mt-6 flex items-center">
        <div className="flex-1">
          <FavouriteButton variant="ghost" className="self-start" />
        </div>
        <div className="flex flex-1 justify-center">
          <Controller />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <ShuffleButton />
          <div className="flex items-center gap-1">
            <Button onClick={onVolumeIconClick} variant="ghost" size="icon">
              <VolumeComp volume={volume * 100} muted={muted} />
            </Button>
            <motion.div
              onWheel={onVolumeSliderWheel}
              whileHover={{ scaleY: 1.5 }}
            >
              <Slider
                className="w-24 overflow-hidden rounded-full"
                value={[volume * 100]}
                onValueChange={handleVolumeChange}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Progress = () => {
  const { duration, position } = usePlayerStore(
    useShallow((state) => ({
      duration: state.duration,
      position: state.position,
    })),
  );

  return (
    <>
      <div className="mb-2 flex justify-between text-xs">
        <span>{formatPosition(position)}</span>
        <span>{formatPosition(duration)}</span>
      </div>
      <TrackProgress className="mb-4 overflow-hidden rounded-full" />
    </>
  );
};

function formatPosition(ms: number) {
  const minutes = Math.floor(ms / 60);
  const seconds = Math.round(ms % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
