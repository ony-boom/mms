import { Track } from "@/api";
import { Audio } from "./audio";
import { cn } from "@/lib/utils";
import { Extra } from "./extra";
import { usePlayerStore } from "@/stores";
import { Controller } from "./controller";
import { memo, useCallback, useEffect, useState, useMemo } from "react";
import { TrackProgress } from "./track-progress";
import { MessageSquareQuote } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button.tsx";
import { useApiClient, useAudioRef } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Playlists } from "@/components/player/playlists";
import { TrackCover } from "@/pages/Tracks/components/track-cover";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { Fullscreen } from "./fullscreen";
import { FavouriteButton } from "@/components";
import { ShuffleButton } from "@/components/player/shuffle-button.tsx";

export function Player() {
  const [uiState, setUiState] = useState({
    openExtra: false,
    openFullscreen: false,
    playlistsExpanded: false,
  });

  const { useTracks } = useApiClient();

  const { isPlaying, src, currentTrackId } = usePlayerStore(
    useShallow((state) => ({
      src: state.src,
      isPlaying: state.isPlaying,
      currentTrackId: state.currentTrackId,
      volume: state.volume,
    })),
  );

  const audioRef = useAudioRef();

  const { data, isLoading } = useTracks(
    {
      id: currentTrackId,
    },
    undefined,
    {
      staleTime: 60000,
    },
  );

  const currentTrack = useMemo(
    () => (data?.length === 1 ? data[0] : undefined),
    [data],
  );

  const handleLyricsToggle = useCallback((value?: boolean) => {
    setUiState((prev) => ({
      ...prev,
      openFullscreen: typeof value === "boolean" ? value : !prev.openFullscreen,
    }));
  }, []);

  const closeFullscreenView = useCallback(() => {
    handleLyricsToggle(false);
  }, [handleLyricsToggle]);

  const handleHoverStart = useCallback(() => {
    if (!uiState.openFullscreen) {
      setUiState((prev) => ({ ...prev, openExtra: true }));
    }
  }, [uiState.openFullscreen]);

  const handleHoverEnd = useCallback(() => {
    if (!uiState.openFullscreen) {
      setUiState((prev) => ({ ...prev, openExtra: false }));
    }
  }, [uiState.openFullscreen]);

  const togglePlaylistsExpanded = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      playlistsExpanded: !prev.playlistsExpanded,
    }));
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    let playPromise: Promise<void> | undefined;

    const handlePlayback = async () => {
      try {
        if (isPlaying && src) {
          playPromise = audioElement.play();
          await playPromise;
        } else if (audioElement) {
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                audioElement.pause();
              })
              .catch(() => {
                audioElement.pause();
              });
          } else {
            audioElement.pause();
          }
        }
      } catch (error) {
        console.error("Audio playback error:", error);
      }
    };

    handlePlayback().then();
  }, [audioRef, isPlaying, src]);

  useEffect(() => {
    if (uiState.openFullscreen) {
      setUiState((prev) => ({ ...prev, openExtra: false }));
    }
  }, [uiState.openFullscreen]);

  const { openExtra, openFullscreen, playlistsExpanded } = uiState;

  return (
    <>
      <AnimatePresence>
        {openFullscreen && (
          <motion.div
            key="lyrics"
            variants={fullscreenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="with-blur fixed bottom-0 left-1/2 z-50 overflow-y-hidden border-none"
            style={{
              transformOrigin: "bottom center",
              willChange: "transform, opacity",
            }}
          >
            <Fullscreen
              loadingTrack={isLoading}
              track={currentTrack}
              onClose={closeFullscreenView}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div onHoverEnd={handleHoverEnd} onHoverStart={handleHoverStart}>
        <Audio currentTrack={currentTrack} ref={audioRef} />

        <div
          className={cn(
            "fixed bottom-2 left-[50%] z-50 translate-x-[-50%] space-y-2",
            {
              "z-0": openFullscreen,
            },
          )}
        >
          <AnimatePresence>
            {openExtra && (
              <motion.div
                className="relative"
                initial={{
                  opacity: 0,
                  translateY: 64,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  translateY: 64,
                }}
                style={{ willChange: "transform, opacity" }}
              >
                <Extra />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            id="player"
            layout
            animate={{
              transition: {
                delay: openFullscreen ? 0 : 0.3,
              },
              translateY: openFullscreen ? 256 : 0,
            }}
            className="with-blur flex w-max flex-col overflow-hidden rounded-md"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="mt-2 flex justify-center">
              <button
                className={cn(
                  "bg-foreground/10 hover:bg-foreground/20 w-16 cursor-pointer rounded py-1 transition-all hover:w-20",
                  {
                    "w-24": playlistsExpanded,
                  },
                )}
                onClick={togglePlaylistsExpanded}
              />
            </div>
            <div className="relative flex items-center justify-between gap-16 px-3 pb-4 pt-1">
              <TrackInfo
                currentTrack={currentTrack!}
                openLyricsView={openFullscreen}
                onFullScreenToggle={handleLyricsToggle}
              />
              <div className="flex items-center gap-2">
                <FavouriteButton variant="ghost" />
                <ShuffleButton />
                <Controller shouldPlay={!currentTrack} />
              </div>
            </div>
            <TrackProgress />
            <AnimatePresence>
              {playlistsExpanded && (
                <motion.div
                  key="playlists"
                  variants={playlistVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout="position"
                  style={{ willChange: "height" }}
                >
                  <Playlists />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

const TrackInfo = memo(
  ({
    currentTrack,
    openLyricsView,
    onFullScreenToggle,
  }: {
    currentTrack: Track;
    openLyricsView: boolean;
    onFullScreenToggle: () => void;
  }) => {
    // Memoize artists string to prevent recalculation
    const artists = useMemo(
      () =>
        currentTrack?.artists?.map((artist) => artist.name).join(", ") || "",
      [currentTrack?.artists],
    );

    return (
      <motion.div
        aria-labelledby="track info"
        className="flex shrink-0 items-end gap-4"
        variants={trackInfoVariants}
        initial="initial"
        animate="animate"
      >
        {currentTrack ? (
          <>
            <div className="group relative">
              <TrackCover
                className="w-18 rounded-md"
                trackId={currentTrack.id}
                trackTitle={currentTrack.title}
              />
              <Button
                size="icon"
                title={openLyricsView ? "Hide lyrics" : "Show lyrics"}
                onClick={onFullScreenToggle}
                className="absolute bottom-0 right-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                {<MessageSquareQuote />}
              </Button>
            </div>
            <div className="w-[148px] space-y-1 text-nowrap">
              <p
                title={currentTrack.title}
                className="overflow-hidden text-ellipsis font-bold"
              >
                {currentTrack.title}
              </p>

              <p
                title={artists}
                className="overflow-hidden text-ellipsis text-xs"
              >
                {artists}
              </p>
            </div>
          </>
        ) : (
          <motion.div
            className="flex items-end gap-4"
            variants={skeletonVariants}
          >
            <div className="bg-muted w-18 aspect-square rounded-xl" />
            <div className="w-[148px]">
              <Skeleton className="w-full" />
              <Skeleton className="w-full" />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.openLyricsView === nextProps.openLyricsView &&
      prevProps.currentTrack?.id === nextProps.currentTrack?.id
    );
  },
);

const fullscreenVariants: Variants = {
  initial: {
    x: "-50%",
    width: "100vw",
    height: "100vh",
    bottom: "-100vh",
  },
  animate: {
    bottom: 0,
    backfaceVisibility: "hidden",
  },
  exit: {
    bottom: "-100vh",
  },
};

const playlistVariants: Variants = {
  initial: { height: 0 },
  animate: {
    height: "auto",
    backfaceVisibility: "hidden",
  },
  exit: {
    height: 0,
  },
};

const trackInfoVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
  },
};

const skeletonVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
  },
};
