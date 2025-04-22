import { Loader } from "lucide-react";
import { motion } from "motion/react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { TrackListElement } from "../track-list-element";
import { memo, useCallback, useEffect, useRef, useState } from "react";
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

export const GlobalSearchResult = memo(
  ({
    localValue,
    isLoading,
    data,
    handleResultClick,
  }: GlobalSearchResultProps) => {
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const ref = useRef<VirtuosoHandle>(null);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (!data || data.length === 0) return;

        if (event.key === "ArrowDown") {
          setFocusedIndex((prev) =>
            prev === null || prev === data.length - 1 ? 0 : prev + 1
          );
        } else if (event.key === "ArrowUp") {
          setFocusedIndex((prev) =>
            prev === null || prev === 0 ? data.length - 1 : prev - 1
          );
        } else if (event.key === "Enter" && focusedIndex !== null) {
          handleResultClick(data, focusedIndex);
        }
      },
      [data, focusedIndex, handleResultClick]
    );

    useEffect(() => {
      ref.current?.scrollIntoView({
        index: focusedIndex ?? 0,
        behavior: "smooth",
        align: "center",
      });
    }, [focusedIndex]);

    if (!localValue) return null;

    return (
      <motion.div
        layout
        role="dialog"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ height: 400 }}
        className="flex flex-col rounded-md py-2 shadow-md"
        onKeyDown={handleKeyDown}
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          data &&
          (data.length ? (
            <Virtuoso
              data={data}
              ref={ref}
              style={{ height: "100%" }}
              className="overflow-x-hidden will-change-transform"
              totalCount={data.length}
              itemContent={(index, track) => {
                return (
                  <LocalTrackItem
                    track={track}
                    index={index}
                    data={data}
                    focused={index === focusedIndex}
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
  }
);

const LocalTrackItem = memo(
  ({
    track,
    index,
    data,
    focused,
    handleResultClick,
  }: {
    track: Track;
    index: number;
    data: Track[];
    focused?: boolean;
    handleResultClick: (tracks: Track[], index: number) => void;
  }) => {
    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        handleResultClick(data, index);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onKeyPress={handleKeyPress}
      >
        <TrackListElement
          track={track}
          index={index}
          showWaveBars
          focused={focused}
          onClick={() => handleResultClick(data, index)}
        />
      </motion.div>
    );
  }
);

type GlobalSearchResultProps = {
  localValue: string;
  isLoading: boolean;
  data: Track[] | undefined;
  handleResultClick: (track: Track[], index: number) => void;
};
