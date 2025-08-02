import { Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { CACHE_KEY } from "@/api/constant";
import { cn } from "@/lib/utils.ts";
import { useCallback } from "react";
import { motion } from "motion/react";
import { useApiClient } from "@/hooks/use-api-client";
import { usePlayerStore } from "@/stores/player/store";

export function FavouriteButton(props: ButtonProps) {
  const currentTrackId = usePlayerStore((state) => state.currentTrackId);
  const { useFavoriteTrackMutation: useFavoriteTrack, useTracks } =
    useApiClient();
  const queryClient = useQueryClient();
  const { data, isLoading } = useTracks({ id: currentTrackId });
  const track = data?.length === 1 ? data[0] : undefined;

  const { mutate } = useFavoriteTrack();

  const handleFavoriteClick = useCallback(() => {
    if (!currentTrackId) return;
    mutate(
      { trackId: currentTrackId, value: !track?.isFavorite },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({
            queryKey: [CACHE_KEY.TRACKS],
          });
        },
      },
    );
  }, [currentTrackId, mutate, queryClient, track?.isFavorite]);

  if (!currentTrackId) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      className="w-max"
    >
      <Button {...props} size={"icon"} onClick={handleFavoriteClick}>
        <Heart
          className={cn("transition-all", {
            "fill-destructive stroke-destructive": track?.isFavorite,
          })}
        />
      </Button>
    </motion.div>
  );
}
