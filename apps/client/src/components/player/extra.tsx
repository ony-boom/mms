import { motion } from "motion/react";
import { useAudioRef } from "@/hooks";
import { Progress } from "../ui/progress";
import { usePlayerStore } from "@/stores";
import { WheelEventHandler } from "react";
import { Volume, Volume1, Volume2, VolumeOff } from "lucide-react";

export const Extra = () => {
  const audioRef = useAudioRef();
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);

  const handleMouseWheel: WheelEventHandler<HTMLDivElement> = (e) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    audio.volume = Math.min(1, Math.max(0, +(audio.volume + delta).toFixed(2)));
  };

  const volumeValue = volume * 100;

  const handleIconClick = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
  };

  return (
    <motion.div className="flex w-full justify-end">
      <div
        onWheel={handleMouseWheel}
        className="with-blur flex w-max items-center gap-1 rounded-md p-2"
      >
        <button onClick={handleIconClick}>
          <VolumeComp muted={muted} volume={volumeValue} />
        </button>
        <motion.div
          whileHover={{
            scaleY: 1.5,
          }}
        >
          <Progress value={volumeValue} className="w-20" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const VolumeComp = ({ volume, muted }: { volume: number; muted: boolean }) => {
  const SIZE = 18;

  if (volume === 0 || muted) {
    return <VolumeOff size={SIZE} />;
  }

  if (volume <= 50 && volume >= 20) {
    return <Volume1 size={SIZE} />;
  }

  if (volume > 50) {
    return <Volume2 size={SIZE} />;
  }

  return <Volume size={SIZE} />;
};
