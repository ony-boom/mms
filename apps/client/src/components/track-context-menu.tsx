import { Track } from "@/api/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { usePlayerStore } from "@/stores/player/store";
import { ListEnd, Redo2, Edit2, HeartPlus, HeartMinus } from "lucide-react";
import { memo, MouseEventHandler, ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { TagEditor } from "./tag-editor";
import { useApiClient } from "@/hooks/use-api-client";
import { ContextMenuItemProps } from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils.ts";
import { useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY } from "@/api/constant";

export const TrackContextMenu = memo(
  ({ track, children, itemProps, disabled }: TrackContextMenuProps) => {
    const { playAfter, currentTrackId, addToQueue } = usePlayerStore(
      useShallow((state) => ({
        currentTrackId: state.currentTrackId,
        playAfter: state.playAfter,
        addToQueue: state.addToQueue,
      })),
    );

    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
    const { getTrackAudioSrc, useFavoriteTrackMutation } = useApiClient();

    const queryClient = useQueryClient();

    const { mutate } = useFavoriteTrackMutation();

    const handlePlayNextClick: MouseEventHandler<HTMLDivElement> = (event) => {
      event.stopPropagation();
      const src = getTrackAudioSrc([track.id])[0]!;
      playAfter({
        src,
        id: track.id,
      });
    };

    const handleAddToQueueClick: MouseEventHandler<HTMLDivElement> = (
      event,
    ) => {
      event.stopPropagation();
      const trackSrc = getTrackAudioSrc([track.id])[0]!;
      addToQueue({ id: track.id, src: trackSrc });
    };

    const openTagEditor = () => setIsTagEditorOpen(true);

    const handleAddToFavoritesClick = () => {
      mutate(
        { trackId: track.id, value: !track.isFavorite },
        {
          onSuccess: async () => {
            await queryClient.refetchQueries({
              queryKey: [CACHE_KEY.TRACKS, track.id],
            });
          },
        },
      );
    };

    return (
      <>
        <ContextMenu modal>
          <ContextMenuTrigger
            disabled={disabled || isTagEditorOpen}
            className="select-none"
          >
            {children}
          </ContextMenuTrigger>
          <ContextMenuContent className="bg-background popup-border z-[60] w-max min-w-42 space-y-1 p-0 transition-all">
            <ContextMenuItem
              {...itemProps?.playNext}
              onClick={handlePlayNextClick}
              disabled={
                !currentTrackId ||
                currentTrackId === track.id ||
                itemProps?.playNext?.disabled
              }
              className={cn("w-full gap-4", itemProps?.playNext?.className)}
            >
              Play next
              <Redo2 size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem
              {...itemProps?.addToQueue}
              onClick={handleAddToQueueClick}
              className={cn("w-full gap-4", itemProps?.addToQueue?.className)}
            >
              Add to queue
              <ListEnd size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem
              {...itemProps?.editTags}
              onClick={openTagEditor}
              className={cn("w-full gap-4", itemProps?.editTags?.className)}
            >
              Edit tags
              <Edit2 size={16} className="ml-auto" />
            </ContextMenuItem>

            <ContextMenuItem
              {...itemProps?.addToFavorites}
              onClick={handleAddToFavoritesClick}
              className={cn(
                "w-full gap-4",
                itemProps?.addToFavorites?.className,
              )}
            >
              {track.isFavorite ? (
                <>
                  Remove from favorites
                  <HeartMinus size={16} className="ml-auto" />
                </>
              ) : (
                <>
                  Add to favorites
                  <HeartPlus size={16} className="ml-auto" />
                </>
              )}
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
  disabled?: boolean;
  children: ReactNode;
  itemProps?: {
    playNext?: ContextMenuItemProps;
    addToQueue?: ContextMenuItemProps;
    editTags?: ContextMenuItemProps;
    addToFavorites?: ContextMenuItemProps;
  };
};
