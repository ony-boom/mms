import { Track } from "@/api/types";
import { TrackCover } from "@/components/track-cover";
import { Skeleton } from "@/components/ui/skeleton";

export const TrackInfo = ({ track }: { track: Track }) => {
  const artist = track.artists.map((artist) => artist.name).join(", ");
  return (
    <div className="flex items-end gap-4 px-8 py-4">
      <TrackCover
        trackId={track.id}
        trackTitle={track.title}
        className="h-36 w-36"
      />
      <div className="space-y-1">
        <p className="text-2xl font-black">{track.title}</p>
        <p className="text-foreground/80">{artist}</p>
      </div>
    </div>
  );
};

export const LoadingTrackInfo = () => (
  <div className="mt-8 flex items-end gap-4 px-8">
    <Skeleton className="h-36 w-36" />
    <div className="space-y-1">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-[70%]" />
    </div>
  </div>
);
