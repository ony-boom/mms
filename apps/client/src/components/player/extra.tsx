import { motion } from "motion/react";
import { Progress } from "../ui/progress";
import { usePlayerStore } from "@/stores";
import {
  useVolumeCompClickEventHandler,
  useVolumeCompWheelEventHandler,
} from "@/hooks";
import { Volume, Volume1, Volume2, VolumeOff } from "lucide-react";

export const Extra = () => {
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);

  const volumeValue = volume * 100;
  const handleIconClick = useVolumeCompClickEventHandler();
  const handleMouseWheel = useVolumeCompWheelEventHandler();

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
          className="will-change-transform"
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

export const VolumeComp = ({
  volume,
  muted,
}: {
  volume: number;
  muted: boolean;
}) => {
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
