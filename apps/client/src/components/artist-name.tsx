import { useState } from "react";
import { cn } from "@/lib/utils";
import { Artist } from "@/api/types";
import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { ArtistTrackDialog } from "./artist-track/artist-track-dialog";

export function ArtistName({ artist, ...buttonProps }: ArtistNameProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialogChange = (value: boolean) => {
    if (!value) {
      setOpenDialog(value);
    }
  };

  const handleButtonClick = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Button
        {...buttonProps}
        variant="link"
        className={cn(
          "text-foreground/80 h-max p-0 text-xs",
          buttonProps.className,
        )}
        onClick={handleButtonClick}
      >
        {artist.name}
      </Button>
      <ArtistTrackDialog
        onOpenChange={handleOpenDialogChange}
        open={openDialog}
        artist={artist}
      />
    </>
  );
}

export type ArtistNameProps = ButtonProps & {
  artist: Artist;
};
