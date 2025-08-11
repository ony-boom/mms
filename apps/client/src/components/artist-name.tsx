import { useState } from "react";
import { cn } from "@/lib/utils";
import { Artist } from "@/api/types";
import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { ArtistTrackDialog } from "./artist-track/artist-track-dialog";

export function ArtistName({
  artist,
  onDialogOpenStateChange,
  className,
  ...props
}: ArtistNameProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const setDialogState = (state: boolean) => {
    setOpenDialog(state);
    onDialogOpenStateChange?.(state);
  };

  return (
    <>
      <Button
        {...props}
        variant="link"
        className={cn("text-foreground/80 h-max p-0 text-xs", className)}
        onClick={() => setDialogState(true)}
      >
        {artist.name}
      </Button>
      <ArtistTrackDialog
        open={openDialog}
        onOpenChange={setDialogState}
        artist={artist}
      />
    </>
  );
}

export type ArtistNameProps = ButtonProps & {
  artist: Artist;
  onDialogOpenStateChange?: (state: boolean) => void;
};
