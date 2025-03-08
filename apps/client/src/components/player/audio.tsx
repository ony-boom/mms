import { Track } from "@/api/types";
import { useApiClient } from "@/hooks/use-api-client";
import { ReactEventHandler, useCallback, useEffect, memo } from "react";
import { useAudioRef } from "@/hooks/use-audio-ref";
import { usePlayerStore } from "@/stores/player/store";
import { useShallow } from "zustand/react/shallow";

export const Audio = memo(({ currentTrack }: AudioProps) => {
  const { getTrackCoverSrc } = useApiClient();
  const {
    setDuration,
    setPosition,
    pause,
    play,
    playNext,
    playPrev,
    setVolume,
    setMuted,
  } = usePlayerStore.getState();

  const { src, currentTrackId, volume, position } = usePlayerStore(
    useShallow((state) => ({
      src: state.src,
      volume: state.volume,
      position: state.position,
      currentTrackId: state.currentTrackId,
    })),
  );

  const ref = useAudioRef();

  const updateNavigatorMetadata = useCallback(() => {
    if ("mediaSession" in navigator && currentTrackId) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack?.title || "",
          artist:
            currentTrack?.artists?.map((artist) => artist.name).join(", ") ||
            "",
          artwork: [
            {
              src: getTrackCoverSrc(currentTrackId),
              type: "image/jpeg",
            },
          ],
        });
      } catch (error) {
        console.error("Error updating media session metadata:", error);
      }
    }
  }, [
    currentTrack?.artists,
    currentTrack?.title,
    currentTrackId,
    getTrackCoverSrc,
  ]);

  const handleTimeUpdate: ReactEventHandler<HTMLAudioElement> = (event) => {
    const audioElement = event.target as HTMLAudioElement;
    setPosition(audioElement.currentTime);
  };

  const handleLoadedMetadata: ReactEventHandler<HTMLAudioElement> = (event) => {
    const audioElement = event.target as HTMLAudioElement;
    setDuration(audioElement.duration);
    audioElement.volume = volume;
    requestAnimationFrame(() => {
      try {
        audioElement.currentTime = position;
      } catch (err) {
        console.error("Error setting audio position:", err);
      }
    });

    updateNavigatorMetadata();
  };

  const handleError: ReactEventHandler<HTMLAudioElement> = (event) => {
    console.error("Audio error:", (event.target as HTMLAudioElement).error);
  };

  useEffect(() => {
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("previoustrack", playPrev);
        navigator.mediaSession.setActionHandler("nexttrack", playNext);
      } catch (error) {
        console.error("Error setting media session handlers:", error);
      }
    }

    const typedRef = ref as React.MutableRefObject<HTMLAudioElement>;

    if (!typedRef.current) return;

    const handleVolumeChange = (e: Event) => {
      const audioEl = e.target as HTMLAudioElement;
      setVolume(audioEl.volume);
      setMuted(audioEl.muted);
    };

    typedRef.current.addEventListener("volumechange", handleVolumeChange);

    return () => {
      if (typedRef.current) {
        typedRef.current.removeEventListener(
          "volumechange",
          handleVolumeChange,
        );
      }
    };
  }, [playNext, playPrev, ref, setMuted, setVolume]);

  return (
    <audio
      src={src}
      onPlay={play}
      ref={ref}
      onPause={pause}
      onEnded={playNext}
      onError={handleError}
      title={currentTrack?.title}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      preload="auto"
    />
  );
});

export type AudioProps = {
  currentTrack?: Track;
};
