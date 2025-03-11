import { memo } from "react";
import { cn } from "@/lib/utils.ts";
import { Slider } from "../ui/slider";
import { motion } from "motion/react";
import { useShallow } from "zustand/react/shallow";
import { useAudioRef } from "@/hooks/use-audio-ref";
import { SliderProps } from "@radix-ui/react-slider";
import { usePlayerStore } from "@/stores/player/store";

export const TrackProgress = memo((props: TrackProgressProps) => {
  const audioRef = useAudioRef();
  const { position, duration } = usePlayerStore(
    useShallow((state) => ({
      position: state.position,
      duration: state.duration,
    })),
  );

  const handlePositionChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  return (
    <motion.div
      whileHover={{
        scaleY: 2,
        backfaceVisibility: "hidden",
      }}
    >
      <Slider
        {...props}
        max={duration}
        value={[position]}
        onValueChange={handlePositionChange}
        className={cn("w-full will-change-transform", props.className)}
      />
    </motion.div>
  );
});

export type TrackProgressProps = SliderProps;
