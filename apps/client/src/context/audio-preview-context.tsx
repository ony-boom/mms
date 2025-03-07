import { createContext, useRef, ReactNode, ElementRef, RefObject } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AudioPreviewContext = createContext<RefObject<
  ElementRef<"audio">
> | null>(null);

export function AudioPreviewProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<ElementRef<"audio">>(null);
  return (
    <AudioPreviewContext.Provider value={audioRef}>
      {children}
    </AudioPreviewContext.Provider>
  );
}
