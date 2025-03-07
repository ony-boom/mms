import { AudioPreviewContext } from "@/context/audio-preview-context";
import { useContext } from "react";

export function useAudioPreviewRef() {
  const context = useContext(AudioPreviewContext);
  if (!context)
    throw new Error(
      "useAudioPreviewRef must be used within an AudioPreviewProvider",
    );
  return context;
}
