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

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  duration: 0.4,
};

const FADE_TRANSITION = { duration: 0.3 };

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

  const bgSrc = useMemo(
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
        {!showLyrics && bgSrc && (
          <motion.div
            data-testid="track-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
            className="with-blur h-full w-full overflow-hidden"
          >
            <img
              src={bgSrc}
              alt={
                track?.title ? `${track.title} album artwork` : "Track cover"
              }
              className="top-5/12 md:top-6/12 -translate-y-8/12 absolute left-1/2 aspect-square w-11/12 max-w-2xl -translate-x-1/2 rounded-md object-cover md:w-full"
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
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                ...SPRING_TRANSITION,
                delay: 0.4,
              },
            }}
            exit={{
              opacity: 0,
              transition: SPRING_TRANSITION,
            }}
            className="z-10"
          >
            {track && !loadingTrack ? (
              <TrackInfo track={track} className="mb-4 p-4 md:w-[80%] max-w-7xl mx-auto" />
            ) : (
              <LoadingTrackInfo />
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
                delay: 0.3,
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
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
            className="flex-1"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={SPRING_TRANSITION}
              className="mb-4"
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
          transition={SPRING_TRANSITION}
          className="relative z-20"
        >
          <LocalController onLyricBtnClick={handleLyricBtnClick} />
        </motion.div>
      </motion.div>
    </div>
  );
}

const LoadingTrackInfo = () => (
  <div className="mt-8 flex items-end gap-4 px-8">
    <Skeleton className="h-36 w-36" aria-label="Loading track artwork" />
    <div className="space-y-1">
      <Skeleton className="h-8 w-full" aria-label="Loading track title" />
      <Skeleton className="h-8 w-[70%]" aria-label="Loading artist name" />
    </div>
  </div>
);
