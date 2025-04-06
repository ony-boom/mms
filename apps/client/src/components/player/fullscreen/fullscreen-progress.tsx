import { useShallow } from "zustand/react/shallow";
import { usePlayerStore } from "@/stores/player/store.ts";
import { TrackProgress } from "@/components/player/track-progress.tsx";

export const FullscreenProgress = () => {
  const { duration, position } = usePlayerStore(
    useShallow((state) => ({
      duration: state.duration,
      position: state.position,
    })),
  );

  return (
    <>
      <div className="mb-2 flex justify-between text-xs">
        <span>{formatPosition(position)}</span>
        <span>{formatPosition(duration)}</span>
      </div>
      <TrackProgress className="mb-4 overflow-hidden rounded-full" />
    </>
  );
};

function formatPosition(ms: number) {
  const minutes = Math.floor(ms / 60);
  const seconds = Math.round(ms % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
