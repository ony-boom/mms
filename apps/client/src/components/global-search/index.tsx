import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { QueryField, useFilterStore, usePlayerStore } from "@/stores";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useApiClient, useDebounce } from "@/hooks";
import { Track } from "@/api";
import { GlobalSearchResult } from "./global-search-result";

export function GlobalSearch() {
  const {
    // setSearchValue,
    setOpenSearchComponent,
    // setQueryField,
    queryField,
    query,
    openSearchComponent,
  } = useFilterStore();

  const { setPlaylists, toggleShuffle, playTrackAtIndex } =
    usePlayerStore.getState();
  const { getTrackAudioSrc } = useApiClient();

  const [localValue, setLocalValue] = useState(
    (queryField === "*" ? query?.title : query?.[queryField]) ?? "",
  );
  const [localSearchField, setLocalSearchField] = useState(queryField);

  const debouncedValue = useDebounce(localValue, 500);
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
    /*
        setSearchValue(localValue);
        setQueryField(localSearchField);
    */
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setOpenSearchComponent]);

  const onBadgeClick = (field: string) => {
    if (field === localSearchField) return;
    setLocalSearchField(field as QueryField);
  };

  const handleResultClick = (track: Track[], index: number) => {
    const newPlaylist = track.map((t) => {
      const src = getTrackAudioSrc([t.id])[0]!;
      return {
        src,
        id: t.id,
      };
    });
    setPlaylists(newPlaylist);
    toggleShuffle(false);
    playTrackAtIndex(index);
  };

  return (
    <AnimatePresence>
      {openSearchComponent && (
        <motion.div
          layout
          aria-modal
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background/60 fixed left-0 top-0 z-50 grid h-full w-full justify-center"
          onClick={() => setOpenSearchComponent(false)}
        >
          <div className="with-blur mt-32 h-max overflow-hidden rounded-md">
            <form onSubmit={handleSubmit}>
              <Input
                autoFocus
                value={localValue}
                onChange={handleInputChange}
                placeholder="Search..."
                className="border-b-foreground/10 focus-visible:border-b-foreground/30 min-w-xl h-12 rounded-none focus-visible:ring-0"
                onClick={(e) => e.stopPropagation()}
              />

              <div
                className="flex gap-2 px-2 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                {searchField.map((field) => {
                  const isActive = localSearchField === field.value;
                  return (
                    <Badge
                      key={field.value}
                      className={clsx("cursor-pointer", {
                        "hover:bg-accent": !isActive,
                      })}
                      onClick={() => onBadgeClick(field.value)}
                      variant={isActive ? "default" : "outline"}
                    >
                      {field.label}
                    </Badge>
                  );
                })}
              </div>
            </form>

            <GlobalSearchResult
              localValue={localValue}
              isLoading={isLoading}
              data={data}
              handleResultClick={handleResultClick}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const searchField = [
  {
    label: "All",
    value: "*",
  },
  {
    label: "Artist",
    value: "artistName",
  },
  {
    label: "Album",
    value: "albumTitle",
  },
];
