import { useApiClient } from "@/hooks";
import { usePlayerStore } from "@/stores";
import { useEffect } from "react";

export function AppTitle() {
  const { useTracks } = useApiClient();
  const { currentTrackId } = usePlayerStore();
  const { data } = useTracks({ id: currentTrackId });

  useEffect(() => {
    if (currentTrackId && data?.length) {
      const { title, artists } = data[0];
      document.title = `${title} - ${artists.map((artist) => artist.name).join(", ")}`;
    }
  }, [currentTrackId, data]);

  return null;
}
