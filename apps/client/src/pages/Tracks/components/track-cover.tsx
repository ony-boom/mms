import { HTMLProps } from "react";
import { cn } from "@/lib/utils";
import { useApiClient } from "@/hooks";
import { Cover } from "@/components/cover";

export function TrackCover({
  trackId,
  trackTitle,
  className,
  ...rest
}: TrackCoverProps) {
  const api = useApiClient();
  const src = api.getTrackCoverSrc(trackId);

  return (
    <Cover
      {...rest}
      src={src}
      alt={trackTitle}
      className={cn("h-full w-full rounded", className)}
    />
  );
}

export type TrackCoverProps = HTMLProps<HTMLImageElement> & {
  trackId: string;
  trackTitle: string;
};
