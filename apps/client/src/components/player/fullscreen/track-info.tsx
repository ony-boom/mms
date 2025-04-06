import { cn } from "@/lib/utils";
import { Track } from "@/api/types";
import { ComponentProps } from "react";
import { TrackCover } from "@/components/track-cover";

export const TrackInfo = ({ track, className, hideCover, ...rest }: TrackInfoProps) => {
  const artist = track.artists.map((artist) => artist.name).join(", ");
  return (
    <div {...rest} className={cn("flex items-end gap-4 px-8 py-4", className)}>
      <TrackCover
        hidden={hideCover}
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

export type TrackInfoProps = ComponentProps<"div"> & {
  track: Track;
  hideCover?: boolean;
};
