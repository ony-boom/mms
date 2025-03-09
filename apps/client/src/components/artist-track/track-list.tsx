import { Track } from "@/api/types";
import { Virtuoso } from "react-virtuoso";
import { TrackListElement } from "@/components/track-list-element";

export function ArtistTrackList({ tracks, onTrackClick }: ArtistTrackListProps) {
  if (!tracks) return null;

  return (
    <Virtuoso
      data={tracks}
      totalCount={tracks.length}
      style={{
        height: 160,
        overflowX: "hidden",
        willChange: "transform",
      }}
      itemContent={(index, data) => (
        <TrackListElement
          showWaveBars
          index={index}
          track={data}
          onClick={onTrackClick}
          contextMenuItemProps={{
            addToQueue: {
              disabled: true,
            },
          }}
        />
      )}
    />
  );
}

type ArtistTrackListProps = {
  tracks: Track[] | undefined;
  onTrackClick: (index: number) => void;
};
