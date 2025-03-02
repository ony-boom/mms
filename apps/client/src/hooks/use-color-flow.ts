import { usePlayerStore } from "@/stores";
import { useEffect, useState } from "react";
import { useApiClient } from "@/hooks/use-api-client.ts";
import { themeFromImage, type Theme } from "@material/material-color-utilities";

export const useColorFlow = () => {
  const currentTrackId = usePlayerStore((state) => state.currentTrackId);
  const { getTrackCoverSrc } = useApiClient();
  const [color, setColor] = useState<Theme | null>(null);

  useEffect(() => {
    if (!currentTrackId) return;
    const src = getTrackCoverSrc(currentTrackId);
    (async () => {
      const imageEl = new Image();
      imageEl.crossOrigin = "anonymous";
      imageEl.src = src;
      imageEl.onload = async () => {
        const colors = await themeFromImage(imageEl);
        setColor(colors);
      };
    })();
  }, [currentTrackId]);
  return color;
};
