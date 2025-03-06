import { cn } from "@/lib/utils.ts";
import { Shuffle } from "lucide-react";
import { usePlayerStore } from "@/stores";
import { Button, ButtonProps } from "@/components/ui/button.tsx";

export function ShuffleButton(props: ShuffleButtonProps) {
  const { toggleShuffle, isShuffle, getCurrentPlaylist } =
    usePlayerStore.getState();
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
        isShuffle ? "text-foreground" : "text-foreground/50",
        props.className,
      )}
    >
      <Shuffle />
    </Button>
  );
}

export type ShuffleButtonProps = ButtonProps;
