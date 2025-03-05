import { Track } from "@/api";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useApiClient } from "@/hooks";
import { memo, MouseEventHandler, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { SongEdition } from "./song-edition";
import { ListEnd, Pencil, Redo2 } from "lucide-react";
import { usePlayerStore } from "@/stores";
import { useSongMetadataStore } from "@/stores/song";

export const TrackContextMenu = memo(
  ({ track, children }: TrackContextMenuProps) => {
    const { playAfter, currentTrackId, addToQueue } = usePlayerStore(
      useShallow((state) => ({
        currentTrackId: state.currentTrackId,
        playAfter: state.playAfter,
        addToQueue: state.addToQueue,
      })),
    );
    const { getTrackAudioSrc } = useApiClient();
    const { showSongEdition } = useSongMetadataStore();

    const onPlayNextClick: MouseEventHandler<HTMLDivElement> = (event) => {
      event.stopPropagation();
      const src = getTrackAudioSrc([track.id])[0]!;
      playAfter({
        src,
        id: track.id,
      });
    };

    const onAddToQueueClick: MouseEventHandler<HTMLDivElement> = (event) => {
      event.stopPropagation();
      const trackSrc = getTrackAudioSrc([track.id])[0]!;
      addToQueue({ id: track.id, src: trackSrc });
    };

    const onEditClick = () => {
      showSongEdition(track.id);
    };

    return (
      <>
        <ContextMenu>
          <ContextMenuTrigger>{children}</ContextMenuTrigger>
          <ContextMenuContent className="with-blur w-36 space-y-1 p-0 transition-all">
            <ContextMenuItem
              className="w-full"
              onClick={onPlayNextClick}
              disabled={!currentTrackId || currentTrackId === track.id}
            >
              Play next
              <Redo2 size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem className="w-full" onClick={onAddToQueueClick}>
              Add to queue
              <ListEnd size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem className="w-full" onClick={onEditClick}>
              Edit
              <Pencil size={16} className="ml-auto" />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <SongEdition />
      </>
    );
  },
);

export type TrackContextMenuProps = {
  track: Track;
  children: ReactNode;
};
