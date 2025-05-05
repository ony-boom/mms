import clsx from "clsx";
import { Track } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GlobalSearchResult } from "./global-search-result";
import { useApiClient } from "@/hooks/use-api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { QueryField, useFilterStore } from "@/stores/filter";
import { usePlayerStore } from "@/stores/player/store";
import { useResultFocusStore } from "@/stores/resultFocus";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const searchFields = [
  { label: "All", value: "*" },
  { label: "Artist", value: "artistName" },
  { label: "Album", value: "albumTitle" },
];

const SearchFieldBadges = ({
  activeField,
  onFieldChange,
}: {
  activeField: QueryField;
  onFieldChange: (field: string) => void;
}) => (
  <div className="flex gap-2 px-2 py-4">
    {searchFields.map((field) => (
      <Badge
        key={field.value}
        className={clsx("cursor-pointer", {
          "hover:bg-accent": activeField !== field.value,
        })}
        onClick={() => onFieldChange(field.value)}
        variant={activeField === field.value ? "default" : "outline"}
      >
        {field.label}
      </Badge>
    ))}
  </div>
);

export function Search() {
  const { queryField, query, openSearchComponent, setOpenSearchComponent } =
    useFilterStore();
  const { setPlaylists, toggleShuffle, playTrackAtIndex } =
    usePlayerStore.getState();
  const { getTrackAudioSrc, useTracks } = useApiClient();
  const { setShouldFocusResult, setCurrent, setToFirst } =
    useResultFocusStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [localValue, setLocalValue] = useState(
    (queryField === "*" ? query?.title : query?.[queryField]) ?? "",
  );
  const [localSearchField, setLocalSearchField] =
    useState<QueryField>(queryField);
  const debouncedValue = useDebounce(localValue, 500);

  const filter =
    localSearchField === "*"
      ? { title: debouncedValue }
      : { [localSearchField]: debouncedValue };

  const { data = [], isLoading } = useTracks(filter, undefined, {
    enabled: !!localValue,
  });

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown" && data.length) {
        event.preventDefault();

        setToFirst();
        setShouldFocusResult(true);

        if (resultsRef.current) {
          resultsRef.current.focus();
        }
      }
    },
    [data.length, setToFirst, setShouldFocusResult],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  };

  const handleFieldChange = (field: string) => {
    if (field !== localSearchField) {
      setLocalSearchField(field as QueryField);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenSearchComponent(false);
  };

  const handleResultClick = (tracks: Track[], index: number) => {
    const newPlaylist = tracks.map((track) => ({
      src: getTrackAudioSrc([track.id])[0]!,
      id: track.id,
    }));

    setPlaylists(newPlaylist);
    toggleShuffle(false);
    playTrackAtIndex(index);
  };

  const handleInputFocus = useCallback(() => {
    setCurrent(null);
  }, [setCurrent]);

  const handleExit = () => {
    setCurrent(null);
    setOpenSearchComponent(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" && e.ctrlKey) {
        setOpenSearchComponent(true);
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setOpenSearchComponent(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpenSearchComponent]);

  return (
    <AnimatePresence>
      {openSearchComponent && (
        <motion.div
          layout
          role="dialog"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/60 fixed left-0 top-0 z-50 grid h-full w-full justify-center"
          onClick={handleExit}
        >
          <div
            className={cn(
              "bg-background mx-auto h-max w-screen overflow-hidden md:mt-32 md:max-w-[546px] md:rounded-md",
              {
                "popup-border": !isMobile,
              },
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <Input
                ref={inputRef}
                autoFocus
                tabIndex={0}
                value={localValue}
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Search..."
                className="border-b-foreground/10 focus-visible:border-b-foreground/30 hadow-none h-12 rounded-none border-l-0 border-r-0 border-t-0 focus-visible:ring-0"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex items-center justify-between gap-2 px-2">
                <SearchFieldBadges
                  activeField={localSearchField}
                  onFieldChange={handleFieldChange}
                />
              </div>
            </form>

            <GlobalSearchResult
              ref={resultsRef}
              localValue={localValue}
              isLoading={isLoading}
              data={data}
              handleResultClick={handleResultClick}
              inputRef={inputRef}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
