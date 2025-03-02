import { toast } from "sonner";
import { useApiClient } from "@/hooks";
import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { CACHE_KEY } from "@/api/constant.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Button, type ButtonProps } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export const TrackLoadToast = (props: ButtonProps) => {
  const { useTrackLoadEvent, useLoadTracks } = useApiClient();
  const { total, current } = useTrackLoadEvent();
  const loadTrackMutation = useLoadTracks();
  const [toastId, setToastId] = useState<string | number | null>(null);
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

  useEffect(() => {
    if (!loadTrackMutation.isPending) {
      if (toastId) toast.dismiss(toastId);
      return;
    }
    if (toastId) {
      toast.loading(`Loading tracks ${current}/${total}`, {
        id: toastId,
        dismissible: loadTrackMutation.isSuccess,
      });
      return;
    }
    const id = toast.loading(`Loading tracks ${current}/${total}`);
    setToastId(id);
  }, [
    current,
    total,
    loadTrackMutation.isSuccess,
    loadTrackMutation.isPending,
    toastId,
  ]);

  return (
    <Button
      {...props}
      onClick={handleClick}
      size="icon"
      className={cn(props.className)}
    >
      <RefreshCcw />
    </Button>
  );
};
