import { useAudioPreviewRef } from "@/hooks";
import { usePreviewStore } from "@/stores";

export const PreviewAudio = () => {
  const ref = useAudioPreviewRef();

  const { setLoading, setIsPlaying } = usePreviewStore();

  const handleLoadedMetadata = () => {
    setLoading(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <audio
      onEnded={handleEnded}
      onLoadedMetadata={handleLoadedMetadata}
      ref={ref}
    />
  );
};
