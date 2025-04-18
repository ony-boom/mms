import { Loader } from "lucide-react";
import { motion } from "motion/react";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "../track-list-element";
import { memo } from "react";
import { Track } from "@/api/types";

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

export const GlobalSearchResult = memo(
  ({
    localValue,
    isLoading,
    data,
    handleResultClick,
  }: GlobalSearchResultProps) => {
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
