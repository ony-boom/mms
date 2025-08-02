import { useEffect } from "react";
import { useApiClient } from "./use-api-client";
import { usePlayerStore } from "@/stores/player/store";

export function useAppTitle() {
  const { useTracks } = useApiClient();
  const { currentTrackId } = usePlayerStore();
  const { data } = useTracks({ id: currentTrackId });

  useEffect(() => {
    if (currentTrackId && data?.length) {
      const { title, artists } = data[0]!;
      document.title = `${title} - ${artists.map((artist) => artist.name).join(", ")}`;
    }
  }, [currentTrackId, data]);
}
