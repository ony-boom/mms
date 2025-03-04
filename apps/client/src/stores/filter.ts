import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { TrackSortField } from "@/api";
import { GetTrackSortByInput, GetTrackWhereInput } from "@/api/Api";

// Types
export type QueryField = "artistName" | "albumTitle" | "*";

// Store interface
interface FilterStore {
  query?: GetTrackWhereInput;
  sort?: GetTrackSortByInput;
  queryField: QueryField;
  openSearchComponent: boolean;
  searchValue: string;

  // Actions
  setQueryField: (field: QueryField) => void;
  setSort: (sort?: GetTrackSortByInput) => void;
  setQuery: (query?: GetTrackWhereInput) => void;
  setSearchValue: (value: string) => void;
  setFilter: (filter: {
    query?: GetTrackWhereInput;
    sort?: GetTrackSortByInput;
  }) => void;
  setOpenSearchComponent: (open: boolean) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      query: undefined,
      sort: undefined,
      queryField: "*",
      openSearchComponent: false,
      searchValue: "",

      setQueryField: (queryField) => {
        const { searchValue } = get();
        let newQuery: GetTrackWhereInput = {};

        if (searchValue) {
          if (queryField === "*") {
            newQuery = { title: searchValue };
          } else {
            newQuery = { [queryField]: searchValue };
          }
        }

        set({
          queryField,
          query: newQuery,
        });
      },

      setSearchValue: (value) => {
        const { queryField } = get();
        let newQuery: GetTrackWhereInput = {};

        if (value) {
          if (queryField === "*") {
            newQuery = { title: value };
          } else {
            newQuery = { [queryField]: value };
          }
        }

        set({
          searchValue: value,
          query: value ? newQuery : undefined,
        });
      },

      setSort: (sort) =>
        set({
          sort: sort?.field === TrackSortField.NONE ? undefined : sort,
        }),

      setQuery: (query) => {
        const { queryField } = get();
        let value = "";

        if (query) {
          if (queryField === "*") {
            value = query.title || "";
          } else if (query[queryField]) {
            value = query[queryField] || "";
          }
        }

        set({
          query,
          searchValue: value,
        });
      },

      setFilter: (filter) => set(filter),
      setOpenSearchComponent: (open) => set({ openSearchComponent: open }),
    }),
    {
      name: "filter",
      partialize: (state) => ({
        sort: state.sort,
        queryField: state.queryField,
      }),
    },
  ),
);
