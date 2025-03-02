import { useContext } from "react";
import { AudioContext } from "@/context/audio-ref-context";

export function useAudioRef() {
  const context = useContext(AudioContext);
  if (!context)
    throw new Error("useAudioRef must be used within an AudioProvider");
  return context;
}
