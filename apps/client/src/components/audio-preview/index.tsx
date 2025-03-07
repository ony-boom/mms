import { useAudioPreviewRef } from "@/hooks";

export const PreviewAudio = () => {
  const ref = useAudioPreviewRef();

  return <audio ref={ref} />;
};
