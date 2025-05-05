import { Loader } from "lucide-react";
import { motion } from "motion/react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { TrackListElement } from "../track-list-element";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Track } from "@/api/types";
import { useResultFocusStore } from "@/stores/resultFocus";

const LoadingIndicator = memo(() => (
  <div className="flex w-full justify-center">
    <Loader className="animate-spin" />
  </div>
));

const EmptyResults = memo(() => (
  <div className="flex w-full justify-center">
    <p className="text-foreground">No results found</p>
  </div>
));

const TrackItem = memo(
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
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (focused && itemRef.current) {
        itemRef.current.focus();
      }
    }, [focused]);

    const handleClick = useCallback(() => {
      handleResultClick(data, index);
    }, [data, index, handleResultClick]);

    return (
      <motion.div
        ref={itemRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="focus:outline-0 focus:ring-0"
        tabIndex={focused ? 0 : -1}
      >
        <TrackListElement
          track={track}
          index={index}
          showWaveBars
          focused={focused}
          onClick={handleClick}
        />
      </motion.div>
    );
  },
);

type GlobalSearchResultProps = {
  localValue: string;
  isLoading: boolean;
  data: Track[];
  handleResultClick: (track: Track[], index: number) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export const GlobalSearchResult = memo(
  forwardRef<HTMLDivElement, GlobalSearchResultProps>(
    (
      { localValue, isLoading, data = [], handleResultClick, inputRef },
      ref,
    ) => {
      const virtuosoRef = useRef<VirtuosoHandle>(null);
      const containerRef = useRef<HTMLDivElement>(null);

      // Forward the ref to access the container element
      useImperativeHandle(ref, () => containerRef.current!);

      const {
        setToFirst,
        setShouldFocusResult,
        current: focusedIndex,
        shouldFocusResult,
        setCurrent,
      } = useResultFocusStore();

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
          if (!data.length) return;

          switch (event.key) {
            case "ArrowDown":
              setCurrent(
                focusedIndex === null
                  ? 0
                  : Math.min(focusedIndex + 1, data.length - 1),
              );
              event.preventDefault();
              break;
            case "ArrowUp":
              if (focusedIndex === 0 && inputRef?.current) {
                inputRef.current.focus();
                setShouldFocusResult(false);
              } else {
                setCurrent(
                  focusedIndex === null ? 0 : Math.max(focusedIndex - 1, 0),
                );
              }
              event.preventDefault();
              break;
            case "Enter":
              if (focusedIndex !== null) {
                handleResultClick(data, focusedIndex);
                event.preventDefault();
              }
              break;
          }
        },
        [
          data,
          focusedIndex,
          handleResultClick,
          setCurrent,
          inputRef,
          setShouldFocusResult,
        ],
      );

      useEffect(() => {
        if (focusedIndex !== null && virtuosoRef.current && data.length) {
          virtuosoRef.current.scrollIntoView({
            index: focusedIndex,
            behavior: "auto",
            align: "center",
          });
        }
      }, [focusedIndex, data]);

      const handleListFocus = useCallback(() => {
        if (data.length > 0 && focusedIndex === null) {
          setToFirst();
          setShouldFocusResult(true);
        }
      }, [data.length, focusedIndex, setToFirst, setShouldFocusResult]);

      if (!localValue) return null;

      const renderContent = () => {
        if (isLoading) return <LoadingIndicator />;
        if (!data.length) return <EmptyResults />;

        return (
          <Virtuoso
            data={data}
            ref={virtuosoRef}
            style={{ height: "100%" }}
            className="overflow-x-hidden will-change-transform"
            totalCount={data.length}
            itemContent={(index, track) => (
              <TrackItem
                track={track}
                index={index}
                data={data}
                focused={index === focusedIndex && shouldFocusResult}
                handleResultClick={handleResultClick}
              />
            )}
          />
        );
      };

      return (
        <motion.div
          ref={containerRef}
          layout
          role="dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-[calc(100vh-48px)] flex-col rounded-md py-2 shadow-md outline-0 md:h-[400px]"
          onKeyDown={handleKeyDown}
          onFocus={handleListFocus}
          tabIndex={0}
        >
          {renderContent()}
        </motion.div>
      );
    },
  ),
);
