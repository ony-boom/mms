import clsx from "clsx";
import { Badge } from "./ui/badge";
import { QueryField, useFilterStore, usePlayerStore } from "@/stores";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useApiClient, useDebounce } from "@/hooks";
import { Loader } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "@/components/track-list-element.tsx";
import { Track } from "@/api";

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
          className="bg-background/60 fixed top-0 left-0 z-50 grid h-full w-full justify-center"
          onClick={() => setOpenSearchComponent(false)}
        >
          <div className="with-blur mt-32 h-max overflow-hidden rounded-md">
            <form onSubmit={handleSubmit}>
              <Input
                autoFocus
                value={localValue}
                onChange={handleInputChange}
                placeholder="Search..."
                className="border-b-foreground/10 focus-visible:border-b-foreground/30 h-12 min-w-xl rounded-none focus-visible:ring-0"
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

            {/*TODO: Move this to it's own filer*/}
            <AnimatePresence>
              {localValue && (
                <motion.div
                  layout
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  style={{ height: 400 }}
                  className="flex flex-col py-2"
                >
                  {isLoading ? (
                    <div className="flex w-full justify-center">
                      <Loader className="animate-spin" />
                    </div>
                  ) : (
                    data &&
                    (data.length ? (
                      <Virtuoso
                        data={data}
                        style={{ height: "100%" }}
                        className={"overflow-x-hidden will-change-transform"}
                        totalCount={data.length}
                        itemContent={(index, track) => {
                          return (
                            <AnimatePresence>
                              <motion.div
                                initial={{
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                }}
                                exit={{
                                  opacity: 0,
                                }}
                              >
                                <TrackListElement
                                  track={track}
                                  index={index}
                                  showWaveBars
                                  onClick={() => handleResultClick(data, index)}
                                />
                              </motion.div>
                            </AnimatePresence>
                          );
                        }}
                      />
                    ) : (
                      <div className="flex w-full justify-center">
                        <p className="text-foreground">No results found</p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
