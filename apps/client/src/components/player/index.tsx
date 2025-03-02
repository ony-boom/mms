import { Track } from "@/api";
import { Audio } from "./audio";
import { cn } from "@/lib/utils";
import { Lyrics } from "./lyrics";
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

export function Player() {
  const [openExtra, setOpenExtra] = useState(false);
  const [openLyricsView, setOpenLyricsView] = useState(false);
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
  const { data } = useTracks({ id: currentTrackId });

  const currentTrack = data?.length === 1 ? data?.[0] : undefined;

  const handleLyricsToggle = useCallback((value?: boolean) => {
    if (value !== undefined) {
      setOpenLyricsView(value);
    } else {
      setOpenLyricsView((prev) => !prev);
    }
  }, []);

  const closeLyricsView = useCallback(() => {
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

  return (
    <>
      <AnimatePresence>
        {openLyricsView && (
          <motion.div
            key="lyrics"
            variants={lyricsVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            data-scroller
            className="with-blur fixed bottom-0 left-1/2 z-50 origin-bottom overflow-y-auto border-none"
            style={{ transformOrigin: "bottom center" }}
          >
            <Lyrics onClose={closeLyricsView} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onHoverEnd={() => setOpenExtra(false)}
        onHoverStart={() => setOpenExtra(true)}
      >
        <Audio currentTrack={currentTrack} ref={audioRef} />

        <div className="fixed bottom-2 left-[50%] z-50 translate-x-[-50%] space-y-2">
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
          <div
            id="player"
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
            <div className="relative flex items-center justify-between gap-16 px-3 pt-1 pb-4">
              <TrackInfo
                currentTrack={currentTrack!}
                openLyricsView={openLyricsView}
                onFullScreenToggle={handleLyricsToggle}
              />
              <Controller shouldPlay={!currentTrack} />
            </div>
            <TrackProgress currentTrack={currentTrack} />
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
          </div>
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
                className="absolute right-0 bottom-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                {<MessageSquareQuote />}
              </Button>
            </div>
            <div className="w-[148px] space-y-1 text-nowrap">
              <p
                title={currentTrack.title}
                className="overflow-hidden font-bold text-ellipsis"
              >
                {currentTrack.title}
              </p>

              <p
                title={artists}
                className="overflow-hidden text-xs text-ellipsis"
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
            <div className="bg-muted aspect-square w-18 rounded-xl" />
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
    height: 0,
    width: 0,
    opacity: 0,
    x: "-50%",
    bottom: 0,
  },
  animate: {
    height: "100vh",
    width: "100vw",
    opacity: 1,
    x: "-50%",
    bottom: 0,
    backfaceVisibility: "hidden",
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    height: 0,
    width: 0,
    opacity: 0,
    x: "-50%",
    bottom: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut",
    },
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
