import { usePlayerStore } from "@/stores/player/store";
import { useApiClient } from "@/hooks/use-api-client.ts";
import { useEffect, useState } from "react";
import materialDynamicColors from "material-dynamic-colors";

type MDC = Awaited<ReturnType<typeof materialDynamicColors>>;

export const useColorFlow = () => {
  const [theme, setTheme] = useState<MDC | null>();
  const currentTrackId = usePlayerStore((state) => state.currentTrackId);
  const { getTrackCoverSrc } = useApiClient();

  useEffect(() => {
    if (!currentTrackId) return;
    const src = getTrackCoverSrc(currentTrackId);

    (async () => {
      const file = await fetch(src, {
        credentials: "include",
      }).then((res) => res.blob());
      const mdc = await  materialDynamicColors(file);
      setTheme(mdc)
    })();
  }, [currentTrackId, getTrackCoverSrc]);

  return theme;
};
