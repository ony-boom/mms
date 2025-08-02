import { Lyrics } from "../lyrics";
import { Track } from "@/api/types";
import { LocalController } from "./controller";
import { Button } from "@/components/ui/button";
import { Minimize2 as Minimize } from "lucide-react";
import { TrackInfo } from "./track-info";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/hooks/use-api-client";
import { cn } from "@/lib/utils";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 26,
  duration: 0.5,
};

const FADE_TRANSITION = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4,
};

const IMAGE_TRANSITION = {
  type: "spring",
  stiffness: 250,
  damping: 25,
  duration: 0.6,
};

export type FullscreenProps = {
  onClose: () => void;
  track?: Track;
  loadingTrack?: boolean;
};

export function Fullscreen({
  onClose,
  track,
  loadingTrack = false,
}: FullscreenProps) {
  const [showLyrics, setShowLyrics] = useState(true);
  const apiClient = useApiClient();

  const coverArt = useMemo(
    () => (track?.id ? apiClient.getTrackCoverSrc(track.id) : ""),
    [apiClient, track?.id],
  );

  const handleLyricBtnClick = useCallback(() => {
    setShowLyrics((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden">
      <AnimatePresence>
        {!showLyrics && coverArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
            className="with-blur absolute inset-0 z-10 h-full w-full overflow-hidden"
          >
            <motion.img
              src={coverArt}
              alt={
                track?.title ? `${track.title} album artwork` : "Track cover"
              }
              initial={{ opacity: 0.6, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.95 }}
              transition={IMAGE_TRANSITION}
              className="top-5/12 md:top-6/12 -translate-y-8/12 absolute left-1/2 aspect-square w-11/12 max-w-2xl -translate-x-1/2 rounded-md object-cover shadow-xl md:w-full"
              loading="eager"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="absolute right-6 top-6 z-20"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close fullscreen view"
      >
        <Minimize />
      </Button>

      <AnimatePresence mode="wait">
        {showLyrics && (
          <motion.div
            key="track-info-top"
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                ...SPRING_TRANSITION,
                delay: 0.2,
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: SPRING_TRANSITION,
            }}
            className="z-10"
          >
            {track && !loadingTrack ? (
              <TrackInfo
                track={track}
                className="mx-auto mb-4 max-w-7xl p-4 md:w-[80%]"
              />
            ) : (
              <LoadingTrackInfo className="mx-auto mb-4 max-w-7xl p-4 md:w-[80%]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {showLyrics ? (
          <motion.div
            key="lyrics-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                ...SPRING_TRANSITION,
                delay: 0.2,
              },
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={SPRING_TRANSITION}
            className="h-full flex-1 overflow-auto"
            data-scroller
          >
            <Lyrics />
          </motion.div>
        ) : (
          <motion.div
            key="cover-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
            className="relative z-10 flex-1"
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={SPRING_TRANSITION}
        className="z-10 flex w-full flex-col"
      >
        <AnimatePresence>
          {!showLyrics && track && !loadingTrack && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                ...SPRING_TRANSITION,
                delay: 0.1,
              }}
            >
              <TrackInfo
                track={track}
                hideCover={true}
                className="mx-auto max-w-7xl px-4 md:w-[80%]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player controls */}
        <motion.div
          layout
          transition={{
            ...SPRING_TRANSITION,
            velocity: 1,
          }}
          className="with-blur relative z-20"
        >
          <LocalController onLyricBtnClick={handleLyricBtnClick} />
        </motion.div>
      </motion.div>
    </div>
  );
}

const LoadingTrackInfo = ({ className }: { className?: string }) => (
  <div className={cn("mx-auto flex max-w-7xl gap-4 md:px-8", className)}>
    <Skeleton
      className="aspect-square h-24 w-24 rounded md:h-48 md:w-48"
      aria-label="Loading track artwork"
    />
    <div className="flex flex-col justify-center space-y-1">
      <Skeleton className="h-8 w-56 md:h-10 md:w-80" />
      <Skeleton className="h-5 w-32 opacity-70 md:h-6 md:w-48" />
    </div>
  </div>
);
