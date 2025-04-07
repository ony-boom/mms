import { Track } from "@/api/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { usePlayerStore } from "@/stores/player/store";
import { ListEnd, Redo2, Edit2 } from "lucide-react";
import { memo, MouseEventHandler, ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { TagEditor } from "./tag-editor";
import { useApiClient } from "@/hooks/use-api-client";
import { ContextMenuItemProps } from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils.ts";

export const TrackContextMenu = memo(
  ({ track, children, itemProps }: TrackContextMenuProps) => {
    const { playAfter, currentTrackId, addToQueue } = usePlayerStore(
      useShallow((state) => ({
        currentTrackId: state.currentTrackId,
        playAfter: state.playAfter,
        addToQueue: state.addToQueue,
      })),
    );
    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
    const { getTrackAudioSrc } = useApiClient();

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

    const openTagEditor = () => setIsTagEditorOpen(true);

    return (
      <>
        <ContextMenu modal>
          <ContextMenuTrigger>{children}</ContextMenuTrigger>
          <ContextMenuContent className="bg-background popup-border z-[60] w-36 space-y-1 p-0 transition-all">
            <ContextMenuItem
              {...itemProps?.playNext}
              onClick={onPlayNextClick}
              disabled={
                !currentTrackId ||
                currentTrackId === track.id ||
                itemProps?.playNext?.disabled
              }
              className={cn("w-full", itemProps?.playNext?.className)}
            >
              Play next
              <Redo2 size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem
              {...itemProps?.addToQueue}
              onClick={onAddToQueueClick}
              className={cn("w-full", itemProps?.addToQueue?.className)}
            >
              Add to queue
              <ListEnd size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem
              {...itemProps?.editTags}
              onClick={openTagEditor}
              className={cn("w-full", itemProps?.editTags?.className)}
            >
              Edit tags
              <Edit2 size={16} className="ml-auto" />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <TagEditor
          trackId={track.id}
          open={isTagEditorOpen}
          onOpenChange={setIsTagEditorOpen}
        />
      </>
    );
  },
);

export type TrackContextMenuProps = {
  track: Track;
  children: ReactNode;
  itemProps?: {
    playNext?: ContextMenuItemProps;
    addToQueue?: ContextMenuItemProps;
    editTags?: ContextMenuItemProps;
  };
};
