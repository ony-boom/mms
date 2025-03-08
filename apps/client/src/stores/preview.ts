import { create } from "zustand";

interface PreviewState {
  src: string | null;
  isPlaying: boolean;
  loading: boolean;
  currentTrackId: string | null;

  // setters
  setSrc: (src: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentTrackId: (id: string | null) => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  src: null,
  isPlaying: false,
  loading: false,
  currentTrackId: null,
  setSrc: (src) => set({ src }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setLoading: (loading) => set({ loading }),
  setCurrentTrackId: (currentTrackId) => set({ currentTrackId }),
}));
