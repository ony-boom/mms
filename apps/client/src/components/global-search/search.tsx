import clsx from "clsx";
import { Track } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { GlobalSearchResult } from "./global-search-result";
import { useApiClient } from "@/hooks/use-api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { QueryField, useFilterStore } from "@/stores/filter";
import { usePlayerStore } from "@/stores/player/store";

const SearchFieldBadges = ({
  activeField,
  onFieldChange,
}: {
  activeField: QueryField;
  onFieldChange: (field: string) => void;
}) => (
  <div className="flex gap-2 px-2 py-4">
    {searchFields.map((field) => {
      const isActive = activeField === field.value;
      return (
        <Badge
          key={field.value}
          className={clsx("cursor-pointer", {
            "hover:bg-accent": !isActive,
          })}
          onClick={() => onFieldChange(field.value)}
          variant={isActive ? "default" : "outline"}
        >
          {field.label}
        </Badge>
      );
    })}
  </div>
);

const SearchForm = ({
  value,
  onValueChange,
  activeField,
  onFieldChange,
  onSubmit,
}: {
  value: string;
  onValueChange: (e: ChangeEvent<HTMLInputElement>) => void;
  activeField: QueryField;
  onFieldChange: (field: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => (
  <form onSubmit={onSubmit}>
    <Input
      autoFocus
      value={value}
      onChange={onValueChange}
      placeholder="Search..."
      className="border-b-foreground/10 focus-visible:border-b-foreground/30 h-12 min-w-[560px] rounded-none border-t-0 border-r-0 border-l-0 focus-visible:ring-0"
      onClick={(e) => e.stopPropagation()}
    />

    <div className="flex items-center justify-between gap-2 px-2">
      <SearchFieldBadges
        activeField={activeField}
        onFieldChange={onFieldChange}
      />
    </div>
  </form>
);

export function Search() {
  const { queryField, query, openSearchComponent, setOpenSearchComponent } =
    useFilterStore();

  const { setPlaylists, toggleShuffle, playTrackAtIndex } =
    usePlayerStore.getState();
  const { getTrackAudioSrc } = useApiClient();

  // Local state
  const [localValue, setLocalValue] = useState(
    (queryField === "*" ? query?.title : query?.[queryField]) ?? "",
  );
  const [localSearchField, setLocalSearchField] = useState(queryField);

  const debouncedValue = useDebounce(localValue, 500);

  // Local Search logic
  const filter =
    localSearchField === "*"
      ? { title: debouncedValue }
      : { [localSearchField]: debouncedValue };

  const { data, isLoading } = useApiClient().useTracks(filter, undefined, {
    enabled: !!localValue,
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenSearchComponent(false);
  };

  const onBadgeClick = (field: string) => {
    if (field === localSearchField) return;
    setLocalSearchField(field as QueryField);
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

  // Keyboard shortcuts
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
          aria-modal
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/60 fixed top-0 left-0 z-50 grid h-full w-full justify-center"
          onClick={() => setOpenSearchComponent(false)}
        >
          <div
            className="bg-background mt-32 h-max overflow-hidden rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <SearchForm
              value={localValue}
              onValueChange={handleInputChange}
              activeField={localSearchField}
              onFieldChange={onBadgeClick}
              onSubmit={handleSubmit}
            />

            <GlobalSearchResult
              localValue={localValue}
              isLoading={isLoading}
              data={data ?? []}
              handleResultClick={handleResultClick}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const searchFields = [
  { label: "All", value: "*" },
  { label: "Artist", value: "artistName" },
  { label: "Album", value: "albumTitle" },
];
