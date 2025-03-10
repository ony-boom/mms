import { usePreviewStore } from "@/stores/preview";
import { useAudioPreviewRef } from "@/hooks/use-audio-preview-ref";

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
      onLoadStart={() => setLoading(true)}
      onCanPlay={() => setLoading(false)}
      onEnded={handleEnded}
      onLoadedMetadata={handleLoadedMetadata}
      ref={ref}
    />
  );
};
