import { CACHE_KEY } from "@/api/constant";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/hooks/use-api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export function DbReloadButton() {
  const { useTrackLoadEvent, useLoadTracks } = useApiClient();
  const { total, current } = useTrackLoadEvent();
  const loadTrackMutation = useLoadTracks();
  const queryClient = useQueryClient();

  const handleClick = () => {
    loadTrackMutation.mutate(null, {
      onSuccess: async (reloaded) => {
        toast.success("Database up to date");
        if (reloaded) {
          await queryClient.invalidateQueries({ queryKey: [CACHE_KEY.TRACKS] });
        }
      },
    });
  };
  return (
    <div className="flex flex-col items-start gap-4">
      <p>
        Manually reload the database to fetch the latest changes from the
        server.
      </p>

      <Button
        onClick={handleClick}
        size="sm"
        className="w-full"
        variant="outline"
        disabled={loadTrackMutation.isPending}
      >
        {loadTrackMutation.isPending ? (
          <span className="flex items-center gap-2">
            <Loader className="animate-spin" />
            {current}/{total}
          </span>
        ) : (
          "Reload Database"
        )}
      </Button>
    </div>
  );
}
