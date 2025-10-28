import { Volume, Volume1, Volume2, VolumeOff } from "lucide-react";
import { motion } from "motion/react";
import {
  useVolumeCompClickEventHandler,
  useVolumeCompWheelEventHandler,
} from "@/hooks/use-volume-comp-event-handler";
import { usePlayerStore } from "@/stores/player/store";
import { Progress } from "../ui/progress";
import { withPlayerBg } from "../with-player-bg";

const VolumeContainer = withPlayerBg((props) => (
  <div {...props}>{props.children}</div>
));

export const Extra = () => {
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);

  const volumeValue = volume * 100;
  const handleIconClick = useVolumeCompClickEventHandler();
  const handleMouseWheel = useVolumeCompWheelEventHandler();

  return (
    <motion.div className="flex w-full justify-end">
      <VolumeContainer
        onWheel={handleMouseWheel}
        className="flex w-max items-center gap-1 rounded-md p-2"
      >
        <button type="button" onClick={handleIconClick}>
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
      </VolumeContainer>
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
