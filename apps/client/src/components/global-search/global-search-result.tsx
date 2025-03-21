import { Loader } from "lucide-react";
import { motion } from "motion/react";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "../track-list-element";
import { memo, useEffect } from "react";
import { Track } from "@/api/types";
import { RemoteTrackListElement } from "../remote-track-list-element";
import { useAudioPreviewRef } from "@/hooks/use-audio-preview-ref";
import { usePreviewStore } from "@/stores/preview";
import { usePlayerStore } from "@/stores/player/store";

const LoadingIndicator = () => (
  <div className="flex w-full justify-center">
    <Loader className="animate-spin" />
  </div>
);

const EmptyResults = () => (
  <div className="flex w-full justify-center">
    <p className="text-foreground">No results found</p>
  </div>
);

const LocalTrackItem = memo(
  ({
    track,
    index,
    data,
    handleResultClick,
  }: {
    track: Track;
    index: number;
    data: Track[];
    handleResultClick: (tracks: Track[], index: number) => void;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <TrackListElement
        track={track}
        index={index}
        showWaveBars
        onClick={() => handleResultClick(data, index)}
      />
    </motion.div>
  ),
);

const RemoteTrackItem = memo(
  ({
    index,
    track,
    isPlaying,
    onTogglePlayButton,
    isLoading,
  }: {
    track: Track;
    index: number;
    isPlaying: boolean;
    onTogglePlayButton: (track: Track) => void;
    isLoading: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <RemoteTrackListElement
        track={track}
        index={index}
        isPlaying={isPlaying}
        onTogglePlayButton={() => onTogglePlayButton(track)}
        isLoading={isLoading}
      />
    </motion.div>
  ),
);

export const GlobalSearchResult = memo(
  ({
    localValue,
    isLoading,
    data,
    handleResultClick,
  }: GlobalSearchResultProps) => {
    const audioRef = useAudioPreviewRef();

    const pause = usePlayerStore((state) => state.pause);

    const { isPlaying, setIsPlaying, setCurrentTrackId, loading, src, setSrc } =
      usePreviewStore();

    const handleTogglePlay = (track: Track) => {
      // If the same track is clicked and is already playing, pause it
      if (src === track.remoteTrackPreview && isPlaying) {
        pause();
        setIsPlaying(false);
        return;
      }

      // If it's a new track or the same track but paused, play it
      setSrc(track.remoteTrackPreview!);
      setCurrentTrackId(track.id);
      pause();
      setIsPlaying(true);
    };

    useEffect(() => {
      const audioElement = audioRef.current;
      if (!audioElement) return;
      (async () => {
        if (!isPlaying) {
          audioElement.pause();
          return;
        }

        if (!src) {
          return;
        }

        if (audioRef.current?.src === src) {
          audioElement.play();
          return;
        }

        audioElement.src = src;
        audioElement.load();
        await audioElement.play();
      })();
    }, [audioRef, isPlaying, src]);

    if (!localValue) return null;

    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ height: 400 }}
        className="flex flex-col rounded-md py-2 shadow-md"
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          data &&
          (data.length ? (
            <Virtuoso
              data={data}
              style={{ height: "100%" }}
              className="overflow-x-hidden will-change-transform"
              totalCount={data.length}
              itemContent={(index, track) => {
                if (track.isRemoteTrack) {
                  return (
                    <RemoteTrackItem
                      track={track}
                      index={index}
                      isPlaying={isPlaying && src === track.remoteTrackPreview}
                      onTogglePlayButton={handleTogglePlay}
                      isLoading={loading && src === track.remoteTrackPreview}
                    />
                  );
                }
                return (
                  <LocalTrackItem
                    track={track}
                    index={index}
                    data={data}
                    handleResultClick={handleResultClick}
                  />
                );
              }}
            />
          ) : (
            <EmptyResults />
          ))
        )}
      </motion.div>
    );
  },
);

type GlobalSearchResultProps = {
  localValue: string;
  isLoading: boolean;
  data: Track[] | undefined;
  handleResultClick: (track: Track[], index: number) => void;
};
