import { useCallback, WheelEventHandler } from "react";
import { useAudioRef } from "./use-audio-ref";

export const useVolumeCompWheelEventHandler =
  (): WheelEventHandler<HTMLDivElement> => {
    const audioRef = useAudioRef();
    return useCallback(
      (e) => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const delta = e.deltaY > 0 ? -0.1 : 0.1;

        audio.volume = Math.min(
          1,
          Math.max(0, +(audio.volume + delta).toFixed(2)),
        );
      },
      [audioRef],
    );
  };

export const useVolumeCompClickEventHandler = (): (() => void) => {
  const audioRef = useAudioRef();
  return useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
  }, [audioRef]);
};
