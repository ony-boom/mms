import { Lyrics } from "./lyrics";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TrackCover } from "@/components/track-cover.tsx";
import { Minimize2 as Minimize } from "lucide-react";
import { Track } from "@/api/types";
import { useShallow } from "zustand/react/shallow";
import { Controller } from "./controller";
import { ShuffleButton } from "./shuffle-button";
import { TrackProgress } from "./track-progress";
import { VolumeComp } from "./extra";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { motion } from "motion/react";
import { FavouriteButton } from "../favourite-button";
import { useAudioRef } from "@/hooks/use-audio-ref";
import {
  useVolumeCompClickEventHandler,
  useVolumeCompWheelEventHandler,
} from "@/hooks/use-volume-comp-event-handler";
import { usePlayerStore } from "@/stores/player/store";

export function Fullscreen({ onClose, track, loadingTrack }: FullscreenProps) {
  return (
    <div className="relative flex h-full flex-col justify-between">
      <Button
        className="absolute right-6 top-6"
        variant="ghost"
        size="icon"
        onClick={onClose}
      >
        <Minimize />
      </Button>
      {track && !loadingTrack ? (
        <TrackInfo track={track} />
      ) : (
        <LoadingTrackInfo />
      )}
      <Lyrics className="w-full text-center" />
      <LocalController />

      <div className="from-background pointer-events-none absolute bottom-32 left-0 right-0 h-44 bg-gradient-to-t to-transparent" />
    </div>
  );
}

const TrackInfo = ({ track }: { track: Track }) => {
  const artist = track.artists.map((artist) => artist.name).join(", ");
  return (
    <div className="flex items-end gap-4 px-8 py-4">
      <TrackCover
        trackId={track.id}
        trackTitle={track.title}
        className="h-36 w-36"
      />
      <div className="space-y-1">
        <p className="text-2xl font-black">{track.title}</p>
        <p className="text-foreground/80">{artist}</p>
      </div>
    </div>
  );
};

const LoadingTrackInfo = () => (
  <div className="mt-8 flex items-end gap-4 px-8">
    <Skeleton className="h-36 w-36" />
    <div className="space-y-1">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-[70%]" />
    </div>
  </div>
);

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

const LocalController = () => {
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
