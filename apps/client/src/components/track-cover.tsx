import { HTMLProps } from "react";
import { cn } from "@/lib/utils.ts";
import { Cover } from "@/components/cover.tsx";
import { useApiClient } from "@/hooks/use-api-client";
import { ImageSize } from "@/api/types";

export function TrackCover({
  trackId,
  trackTitle,
  className,
  coverSize: size,
  ...rest
}: TrackCoverProps) {
  const api = useApiClient();
  const src = api.getTrackCoverSrc(trackId, size);

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
  coverSize?: ImageSize;
};
