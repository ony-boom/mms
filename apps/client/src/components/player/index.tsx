import { Track } from "@/api";
import { Audio } from "./audio";
import { cn } from "@/lib/utils";
import { Extra } from "./extra";
import { usePlayerStore } from "@/stores";
import { Controller } from "./controller";
import { memo, useCallback, useEffect, useState } from "react";
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

export function Player() {
  const [openExtra, setOpenExtra] = useState(false);
  const [openFullscreen, setOpenFullscreen] = useState(false);
  const [playlistsExpanded, setPlaylistsExpanded] = useState(false);

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
  const { data, isLoading } = useTracks({ id: currentTrackId });

  const currentTrack = data?.length === 1 ? data?.[0] : undefined;

  const handleLyricsToggle = useCallback((value?: boolean) => {
    if (typeof value === "boolean") {
      setOpenFullscreen(value);
    } else {
      setOpenFullscreen((prev) => !prev);
    }
  }, []);

  const closeFullscreenView = useCallback(() => {
    handleLyricsToggle(false);
  }, [handleLyricsToggle]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    (async () => {
      if (isPlaying && src) {
        await audioElement.play();
      } else {
        audioElement.pause();
      }
    })();
  }, [audioRef, isPlaying, src]);

  useEffect(() => {
    setOpenExtra(false);
  }, [openFullscreen]);

  return (
    <>
      <AnimatePresence>
        {openFullscreen && (
          <motion.div
            key="lyrics"
            variants={lyricsVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="with-blur fixed bottom-0 left-1/2 z-50 origin-bottom overflow-y-hidden border-none"
            style={{ transformOrigin: "bottom center" }}
          >
            <Fullscreen
              loadingTrack={isLoading}
              track={currentTrack}
              onClose={closeFullscreenView}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onHoverEnd={() => !openFullscreen && setOpenExtra(false)}
        onHoverStart={() => !openFullscreen && setOpenExtra(true)}
      >
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
              >
                <Extra />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            id="player"
            layout
            animate={{
              opacity: openFullscreen ? 0 : 1,
              translateY: openFullscreen ? 256 : 0,
            }}
            className="with-blur flex w-max flex-col overflow-hidden rounded-md"
          >
            <div className="mt-2 flex justify-center">
              <button
                className={cn(
                  "bg-foreground/10 hover:bg-foreground/20 w-16 cursor-pointer rounded py-1 transition-all hover:w-20",
                  {
                    "w-24": playlistsExpanded,
                  },
                )}
                onClick={() => setPlaylistsExpanded((prev) => !prev)}
              />
            </div>
            <div className="relative flex items-center justify-between gap-16 px-3 pb-4 pt-1">
              <TrackInfo
                currentTrack={currentTrack!}
                openLyricsView={openFullscreen}
                onFullScreenToggle={handleLyricsToggle}
              />
              <Controller shouldPlay={!currentTrack} />
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
    const artists = currentTrack?.artists
      .map((artist) => artist.name)
      .join(", ");
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
);

const lyricsVariants: Variants = {
  initial: {
    x: "-50%",
    width: "100vw",
    bottom: "-100vh",
  },
  animate: {
    height: "100vh",
    width: "100vw",
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
  animate: { opacity: 1, transition: { duration: 0.3 } },
};

const skeletonVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
