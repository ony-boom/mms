import { Track } from "@/api/types";
import { Audio } from "./audio";
import { cn } from "@/lib/utils";
import { Extra } from "./extra";
import { Controller } from "./controller";
import { TrackProgress } from "./track-progress";
import { MicVocal } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { Fullscreen } from "./fullscreen/fullscreen";
import { TrackCover } from "@/components/track-cover";
import { Playlists } from "@/components/player/playlists";
import { ShuffleButton } from "@/components/player/shuffle-button";
import { FavouriteButton } from "@/components/favourite-button";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useApiClient } from "@/hooks/use-api-client";
import { useAudioRef } from "@/hooks/use-audio-ref";
import { usePlayerStore } from "@/stores/player/store";
import {
  memo,
  useCallback,
  useEffect,
  useState,
  useMemo,
  Fragment,
} from "react";
import { ArtistName } from "../artist-name";

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
        <Audio currentTrack={currentTrack} />

        <div
          className={cn(
            "fixed bottom-2 left-[50%] z-50 w-[92%] translate-x-[-50%] space-y-2 md:w-max",
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
            className="with-blur flex w-full flex-col overflow-hidden rounded-md md:w-[560px]"
            style={{
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="mt-2 flex justify-center">
              <button
                className={cn(
                  "bg-foreground/10 hover:bg-foreground/20 w-20 cursor-pointer rounded-xl py-[6px] transition-all hover:w-20",
                  {
                    "w-28": playlistsExpanded,
                  },
                )}
                onClick={togglePlaylistsExpanded}
              />
            </div>
            <div className="relative flex items-center justify-between gap-4 px-3 pb-4 pt-1">
              <TrackInfo
                currentTrack={currentTrack!}
                openLyricsView={openFullscreen}
                onFullScreenToggle={handleLyricsToggle}
              />
              <div className="flex items-center gap-2">
                <FavouriteButton className="hidden sm:flex" variant="ghost" />
                <ShuffleButton className="hidden sm:flex" />
                <Controller
                  className="shrink-0 grow"
                  shouldPlay={!currentTrack}
                />
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
                  style={{
                    willChange: "height",
                    backfaceVisibility: "hidden",
                  }}
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
    return (
      <motion.div
        className="flex items-center gap-4 sm:items-end"
        variants={trackInfoVariants}
        initial="initial"
        animate="animate"
      >
        {currentTrack ? (
          <>
            <div className="group relative shrink-0">
              <TrackCover
                className="md:w-18 md:h-18 h-10 w-10 rounded-md"
                trackId={currentTrack.id}
                trackTitle={currentTrack.title}
              />
              <Button
                size="icon"
                title={openLyricsView ? "Hide lyrics" : "Show lyrics"}
                onClick={onFullScreenToggle}
                className="absolute bottom-0 right-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                {<MicVocal />}
              </Button>
            </div>
            <div className="max-w-28 md:max-w-48 md:space-y-1">
              <p className="truncate text-sm font-bold md:text-base">
                {currentTrack.title}
              </p>

              <p className="hidden truncate md:block">
                {currentTrack.artists.map((_, index) => (
                  <Fragment key={index}>
                    <ArtistName artist={currentTrack.artists[index]!} />
                    {index !== currentTrack.artists.length - 1 && (
                      <span className="text-foreground/70">, </span>
                    )}
                  </Fragment>
                ))}
              </p>
            </div>
          </>
        ) : (
          <motion.div
            className="flex items-end gap-4"
            variants={skeletonVariants}
          >
            <div className="bg-muted md:w-18 md:h-18 aspect-square h-10 w-10 rounded-xl" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
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
    height: "100dvh",
    bottom: "-100dvh",
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
