import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { QueryField, useFilterStore, usePlayerStore } from "@/stores";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useApiClient, useDebounce } from "@/hooks";
import { Track } from "@/api";
import { GlobalSearchResult } from "./global-search-result";
import { DownloaderButtonState } from "./downloader-button-state";
import { fetchData } from "@/lib/api-utils";
import { formatSingleTrack } from "@/lib/search";

// Search field options
const searchFields = [
  { label: "All", value: "*" },
  { label: "Artist", value: "artistName" },
  { label: "Album", value: "albumTitle" },
];

// Search field badges component
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

// Search form component
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
      className="border-b-foreground/10 focus-visible:border-b-foreground/30 min-w-xl h-12 rounded-none border-l-0 border-r-0 border-t-0 focus-visible:ring-0"
      onClick={(e) => e.stopPropagation()}
    />

    <div className="flex items-center justify-between gap-2 px-2">
      <SearchFieldBadges
        activeField={activeField}
        onFieldChange={onFieldChange}
      />

      <DownloaderButtonState />
    </div>
  </form>
);

export function GlobalSearch() {
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

  const [remoteSearchResults, setRemoteSearchResults] = useState<Track[]>([]);

  const debouncedValue = useDebounce(localValue, 500);

  // Local Search logic
  const filter =
    localSearchField === "*"
      ? { title: debouncedValue }
      : { [localSearchField]: debouncedValue };

  const { data: localData, isLoading } = useApiClient().useTracks(
    filter,
    undefined,
    {
      enabled: !!localValue,
    },
  );

  // Remote Search Logic
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetchData("mainSearch", {
          term: debouncedValue,
        });

        const trackDatas = response.TRACK.data;
        const formattedDatas: Track[] = trackDatas.map(
          (track: { [key: string]: unknown }) => formatSingleTrack(track),
        );
        setRemoteSearchResults(formattedDatas);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    };

    if (debouncedValue) {
      fetchTracks();
    }
  }, [debouncedValue]);

  // Event handlers
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

  if (!openSearchComponent) return null;

  return (
    <AnimatePresence>
      <motion.div
        layout
        aria-modal
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/60 fixed left-0 top-0 z-50 grid h-full w-full justify-center"
      >
        <div
          className="with-blur mt-32 h-max overflow-hidden rounded-md"
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
            data={[...(localData ?? []), ...remoteSearchResults]}
            handleResultClick={handleResultClick}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
