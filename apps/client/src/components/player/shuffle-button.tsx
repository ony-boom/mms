import { cn } from "@/lib/utils.ts";
import { Shuffle } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { useShallow } from "zustand/react/shallow";
import { usePlayerStore } from "@/stores/player/store";

export function ShuffleButton(props: ShuffleButtonProps) {
  const { toggleShuffle, isShuffle, getCurrentPlaylist } = usePlayerStore(
    useShallow((state) => ({
      toggleShuffle: state.toggleShuffle,
      isShuffle: state.isShuffle,
      getCurrentPlaylist: state.getCurrentPlaylist,
    })),
  );

  const handleShuffle = () => {
    toggleShuffle();
  };
  return (
    <Button
      {...props}
      onClick={handleShuffle}
      size="icon"
      variant="ghost"
      disabled={getCurrentPlaylist().length === 0}
      className={cn(
        "relative",
        isShuffle ? "text-foreground" : "text-foreground/50",
        props.className,
      )}
    >
      <Shuffle />
      <span
        className={cn(
          "bg-primary left-5/12 absolute bottom-0 inline-block h-1 w-1 rounded-full opacity-0",
          {
            "opacity-100": isShuffle,
          },
        )}
      ></span>
    </Button>
  );
}

export type ShuffleButtonProps = ButtonProps;
