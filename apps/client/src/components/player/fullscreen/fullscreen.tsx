import { Lyrics } from "../lyrics";
import { Track } from "@/api/types";
import { LocalController } from "./controller";
import { Button } from "@/components/ui/button";
import { Minimize2 as Minimize } from "lucide-react";
import { LoadingTrackInfo, TrackInfo } from "./track-info";

export function Fullscreen({ onClose, track, loadingTrack }: FullscreenProps) {
  return (
    <div className="relative flex h-full flex-col justify-between">
      <Button
        className="absolute top-6 right-6"
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

      <div className="from-background pointer-events-none absolute right-0 bottom-32 left-0 h-44 bg-gradient-to-t to-transparent" />
    </div>
  );
}

export type FullscreenProps = {
  onClose: () => void;
  track?: Track;
  loadingTrack?: boolean;
};
