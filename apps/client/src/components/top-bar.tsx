import { Sort } from "./sort";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Search, Shuffle } from "lucide-react";
import { TrackLoadToast } from "./track-load-toast";
import { ModeToggle } from "@/components/mode-toggle";
import { SortOrder, TrackSortField } from "@/api/types";
import { useApiClient } from "@/hooks/use-api-client";
import { useTrackList } from "@/hooks/use-track-list";
import { useFilterStore } from "@/stores/filter";
import { usePlayerStore } from "@/stores/player/store";
import { Input } from "./ui/input";

export function TopBar() {
  const { resetPlaylist, trackList } = useTrackList();
  const { setSort, sort } = useFilterStore();
  const { setOpenSearchComponent } = useFilterStore();

  const { toggleShuffle, playTrackAtIndex } = usePlayerStore.getState();

  const { useTracks } = useApiClient();
  const { data } = useTracks();

  const onTrackSortChange = (value: TrackSortField, direction: SortOrder) => {
    setSort({ field: value, order: direction });
  };

  const handleShuffle = useCallback(() => {
    resetPlaylist();
    toggleShuffle(true, true);
    playTrackAtIndex(0);
  }, [resetPlaylist, toggleShuffle, playTrackAtIndex]);

  const handleSearchClick = () => {
    setOpenSearchComponent(true);
  };

  return (
    <div>
      <Input
        readOnly
        onClick={handleSearchClick}
        placeholder="Search..."
        className="block h-12 rounded-none border-0 border-b outline-none md:hidden"
      />
      <div className="relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-md px-4 py-2">
        <div className="flex gap-2">
          <Sort
            onValueChange={onTrackSortChange}
            value={sort ?? { order: SortOrder.ASC, field: TrackSortField.NONE }}
          />
        </div>

        <div className="flex gap-2">
          {trackList?.length > 0 && (
            <Button
              variant={"ghost"}
              className="p-0 md:px-4 md:py-2"
              onClick={handleShuffle}
            >
              <span className="-mt-[2px]">{trackList?.length} Songs</span>
              <Shuffle />
            </Button>
          )}

          <Button
            size={"icon"}
            variant={"ghost"}
            className="hidden md:flex"
            onClick={handleSearchClick}
            disabled={!data || !data.length}
          >
            <Search />
          </Button>

          <TrackLoadToast variant={"ghost"} className="hidden md:flex" />

          <div className="hidden md:flex">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
