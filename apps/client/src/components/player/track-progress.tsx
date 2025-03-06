import { memo } from "react";
import { Track } from "@/api";
import { motion } from "motion/react";
import { usePlayerStore } from "@/stores";
import { MouseEventHandler } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAudioRef } from "@/hooks/use-audio-ref";
import { Progress } from "@/components/ui/progress.tsx";

export const TrackProgress = memo(({ currentTrack }: TrackProgressProps) => {
  const { position, duration } = usePlayerStore(
    useShallow((state) => ({
      position: state.position,
      duration: state.duration,
    })),
  );

  const progress = (position * 100) / duration;
  const audioRef = useAudioRef();

  const onProgressClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!audioRef.current || !currentTrack) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  return (
    <motion.div
      whileHover={{
        scaleY: 2,
      }}
    >
      <Progress
        value={progress}
        onClick={onProgressClick}
        className="z-50 h-1 w-full rounded-none hover:cursor-pointer"
      />
    </motion.div>
  );
});

export type TrackProgressProps = {
  currentTrack: Track | undefined;
};
