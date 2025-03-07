import { useAudioPreviewRef } from "@/hooks";
import { usePreviewStore } from "@/stores";

export const PreviewAudio = () => {
  const ref = useAudioPreviewRef();

  const { setLoading } = usePreviewStore();

  const handleLoadedMetadata = () => {
    setLoading(false);
  };

  return <audio onLoadedMetadata={handleLoadedMetadata} ref={ref} />;
};
