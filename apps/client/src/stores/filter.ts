import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { GetTrackSortByInput, GetTrackWhereInput } from "@/api/Api.ts";
import { TrackSortField } from "@/api";

export type QueryField = "artistName" | "albumTitle" | "*";

interface FilterStore {
  query?: GetTrackWhereInput;
  sort?: GetTrackSortByInput;
  queryField: QueryField;
  setFilter: (filter: {
    query?: GetTrackWhereInput;
    sort?: GetTrackSortByInput;
  }) => void;
  setQuery: (query?: GetTrackWhereInput) => void;
  setSort: (sort?: GetTrackSortByInput) => void;
  setQueryField: (field: QueryField) => void;

  openSearchComponent: boolean;
  setOpenSearchComponent: (open: boolean) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      openSearchComponent: false,
      setOpenSearchComponent: (open) => set({ openSearchComponent: open }),
      query: undefined,
      sort: undefined,
      queryField: "*",

      setQueryField: (queryField) => {
        set({ queryField });
      },

      setSort: (sort) => {
        if (sort?.field === TrackSortField.NONE) {
          set({ sort: undefined });
          return;
        }
        set({ sort });
      },
      setQuery: (query) => set({ query }),
      setFilter: (filter) => set(filter),
    }),
    {
      name: "filter",
      partialize(state) {
        return {
          sort: state.sort,
        };
      },
    },
  ),
);
