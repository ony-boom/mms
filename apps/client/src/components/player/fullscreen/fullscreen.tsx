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

/**
 * Animation configuration for smooth transitions
 */
const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  duration: 0.4,
};

/**
 * Fade transition for simpler animations
 */
const FADE_TRANSITION = { duration: 0.3 };

export type FullscreenProps = {
  onClose: () => void;
  track?: Track;
  loadingTrack?: boolean;
};

/**
 * Fullscreen view component for displaying track information and lyrics
 */
export function Fullscreen({
  onClose,
  track,
  loadingTrack = false,
}: FullscreenProps) {
  const [showLyrics, setShowLyrics] = useState(true);
  const apiClient = useApiClient();

  // Get background image source with memoization
  const bgSrc = useMemo(
    () => (track?.id ? apiClient.getTrackCoverSrc(track.id) : ""),
    [apiClient, track?.id],
  );

  // Create a memoized callback for toggling lyrics
  const handleLyricBtnClick = useCallback(() => {
    setShowLyrics((prev) => !prev);
  }, []);

  // Add escape key handler
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
      {/* Background image - only shown when lyrics are hidden */}
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
              className="absolute top-6/12 left-1/2 aspect-square w-full max-w-2xl -translate-x-1/2 -translate-y-9/12 rounded-md object-cover"
              loading="eager"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button */}
      <Button
        className="absolute top-6 right-6 z-20"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close fullscreen view"
      >
        <Minimize />
      </Button>

      {/* Track information - shown at top when lyrics are visible */}
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
                delay: 0.4, // Add delay only to entrance animation
              },
            }}
            exit={{
              opacity: 0,
              transition: SPRING_TRANSITION, // No delay on exit
            }}
            className="z-10"
          >
            {track && !loadingTrack ? (
              <TrackInfo track={track} className="mb-4" />
            ) : (
              <LoadingTrackInfo />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main content area - either lyrics or empty space */}
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
            <Lyrics className="w-full text-center" />
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

      {/* Bottom controls area */}
      <motion.div
        layout
        transition={SPRING_TRANSITION}
        className="z-10 flex w-full flex-col"
      >
        {/* Track info shown at bottom when lyrics are hidden */}
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
                className="mx-auto w-[80%] max-w-7xl"
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

/**
 * Loading skeleton for track info
 */
const LoadingTrackInfo = () => (
  <div className="mt-8 flex items-end gap-4 px-8">
    <Skeleton className="h-36 w-36" aria-label="Loading track artwork" />
    <div className="space-y-1">
      <Skeleton className="h-8 w-full" aria-label="Loading track title" />
      <Skeleton className="h-8 w-[70%]" aria-label="Loading artist name" />
    </div>
  </div>
);
