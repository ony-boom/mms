import { create } from "zustand/react";

export const useResultFocusStore = create<{
  current: number | null;

  setCurrent: (index: number | null) => void;
  reset: () => void;
  setToFirst: () => void;
  shouldFocusResult: boolean;
  setShouldFocusResult: (shouldFocus: boolean) => void;
}>((set) => {
  return {
    current: null,
    old: null,
    shouldFocusResult: false,

    setShouldFocusResult: (shouldFocusResult) => set({ shouldFocusResult }),
    setCurrent: (index) => set({ current: index }),
    reset: () => set({ current: null }),
    setToFirst: () => {
      set((state) => ({
        current: state.current === null ? 0 : state.current
      }));
    }
  };
});
