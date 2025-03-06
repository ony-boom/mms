import { Lyrics } from "./lyrics";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TrackCover } from "@/pages/Tracks/components/track-cover";
import { Minimize2 as Minimize } from "lucide-react";
import { Track } from "@/api";
import { usePlayerStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";
import { Controller } from "./controller";
import { ShuffleButton } from "./shuffle-button";
import { FavouriteButton } from "@/components";
import { TrackProgress } from "./track-progress";
import { VolumeComp } from "./extra";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { motion } from "motion/react";
import {
  useAudioRef,
  useVolumeCompClickEventHandler,
  useVolumeCompWheelEventHandler,
} from "@/hooks";

export function Fullscreen({ onClose, track, loadingTrack }: FullscreenProps) {
  if (track && !loadingTrack) {
    const artist = track.artists.map((artist) => artist.name).join(", ");

    return (
      <div className="relative flex h-full flex-col justify-between">
        <div className="mt-8 flex items-end gap-4 px-8">
          <TrackCover
            trackId={track.id}
            trackTitle={track.title}
            className="h-36 w-36"
          />
          <div className="space-y-1">
            <p className="text-2xl font-black">{track.title}</p>
            <p>{artist}</p>
          </div>
        </div>

        <Lyrics className="w-full justify-center text-center" />

        <LocalController onMinimize={onClose} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-between">
      <div className="mt-8 flex items-end gap-4 px-8">
        <Skeleton className="h-24 w-24" />
        <div className="space-y-1">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-[70%]" />
        </div>
      </div>

      <Lyrics className="w-full justify-center text-center" />

      <div className="pointer-events-none opacity-70">
        <LocalController onMinimize={onClose} />
      </div>
    </div>
  );
}

const LocalController = ({ onMinimize }: { onMinimize: () => void }) => {
  const audioRef = useAudioRef();
  const { duration, volume, muted, position } = usePlayerStore(
    useShallow((state) => ({
      duration: state.duration,
      volume: state.volume,
      muted: state.muted,
      position: state.position,
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
    <div className="sticky bottom-0 mx-auto w-[80%] max-w-7xl px-8 py-4">
      <div className="mb-2 flex justify-between text-xs">
        <span>{formatPosition(position)}</span>
        <span>{formatPosition(duration)}</span>
      </div>
      <TrackProgress className="mb-4 overflow-hidden rounded-full" />
      <div className="mt-6 flex items-center">
        <div className="flex-1">
          <FavouriteButton variant="ghost" className="self-start" />
        </div>
        <div className="flex flex-1 justify-center">
          <Controller />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <ShuffleButton />
          <Button variant="ghost" size="icon" onClick={onMinimize}>
            <Minimize />
          </Button>
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

function formatPosition(ms: number) {
  const minutes = Math.floor(ms / 60);
  const seconds = Math.round(ms % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export type FullscreenProps = {
  onClose: () => void;
  track?: Track;
  loadingTrack?: boolean;
};
