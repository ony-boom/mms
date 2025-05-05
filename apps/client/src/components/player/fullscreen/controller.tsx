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
import { FullscreenProgress } from "./fullscreen-progress";
import { MicVocal } from "lucide-react";

export const LocalController = ({ onLyricBtnClick }: LocalControllerProps) => {
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
    <div className="sticky bottom-0 mx-auto w-full max-w-7xl p-4 md:w-[80%] md:p-8">
      <FullscreenProgress />
      <div className="mt-6 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <FavouriteButton variant="ghost" className="self-start" />
        </div>
        <div className="flex justify-center">
          <Controller />
        </div>
        <div className="flex items-center justify-end gap-1 md:gap-2">
          <Button size="icon" variant="ghost" onClick={onLyricBtnClick}>
            {<MicVocal />}
          </Button>
          <ShuffleButton className="hidden md:flex" />
          <div className="hidden items-center gap-1 md:flex">
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

export type LocalControllerProps = {
  onLyricBtnClick?: () => void;
};
