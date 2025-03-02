import { Track } from "@/api";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { usePlayerStore } from "@/stores";
import { ListEnd, Redo2 } from "lucide-react";
import { useApiClient } from "@/hooks";
import { memo, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

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

    const onPlayNextClick = () => {
      const src = getTrackAudioSrc([track.id])[0];
      playAfter({
        src,
        id: track.id,
      });
    };

    const onAddToQueueClick = () => {
      const trackSrc = getTrackAudioSrc([track.id])[0];
      addToQueue({ id: track.id, src: trackSrc });
    };

    return (
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
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);

export type TrackContextMenuProps = {
  track: Track;
  children: ReactNode;
};
