import {
  createContext,
  useRef,
  ReactNode,
  ElementRef,
  RefObject,
} from "react";

export const AudioContext = createContext<RefObject<ElementRef<"audio">> | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<ElementRef<"audio">>(null);
  return (
    <AudioContext.Provider value={audioRef}>{children}</AudioContext.Provider>
  );
}
