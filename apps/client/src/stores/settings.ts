import { persist } from "zustand/middleware";
import { create } from "zustand/react";

interface SettingsStore {
  useBlurForPlayerBackground: boolean;

  setUseBlurForPlayerBackground: (useBlur: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      useBlurForPlayerBackground: false,

      setUseBlurForPlayerBackground: (useBlur: boolean) => {
        set({ useBlurForPlayerBackground: useBlur });
      },
    }),
    {
      name: "settings-store",
    },
  ),
);
