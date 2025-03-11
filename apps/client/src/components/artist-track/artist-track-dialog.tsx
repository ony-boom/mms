import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApiClient } from "@/hooks/use-api-client";
import { useArtistBio } from "@/api/wiki/artist";
import { ArtistBio } from "./bio";
import { ArtistImage } from "./image";
import { ArtistTrackControls } from "./track-controlls";
import { ArtistTrackList } from "./track-list";
import { DialogProps } from "@radix-ui/react-dialog";
import { Artist } from "@/api/types";
import { Separator } from "../ui/separator";
import { usePlayerStore } from "@/stores/player/store";
import { useCallback } from "react";

export function ArtistTrackDialog({
  artist,
  ...dialogProps
}: ArtistTrackDialogProps) {
  const { setPlaylists, toggleShuffle, playTrackAtIndex } =
    usePlayerStore.getState();

  const { getTrackAudioSrc } = useApiClient();
  const { useArtistTracks, useArtistImage } = useApiClient();
  const { data: image, isLoading: imageIsLoading } = useArtistImage(
    artist.name,
    {
      enabled: dialogProps.open,
    },
  );
  const { data: bioData, isLoading: loadingBioData } = useArtistBio(artist.name, {
    enabled: dialogProps.open,
  });

  const { data: tracks } = useArtistTracks(artist.id, {
    enabled: Boolean(artist.id) && dialogProps.open,
  });

  const handleTrackClick = useCallback(
    (index = 0, isShuffle = false) => {
      if (!tracks) return;
      const newPlaylist = tracks.map((track) => ({
        src: getTrackAudioSrc([track.id])[0]!,
        id: track.id,
      }));

      setPlaylists(newPlaylist);
      toggleShuffle(isShuffle, isShuffle && true);
      playTrackAtIndex(index);
    },
    [getTrackAudioSrc, playTrackAtIndex, setPlaylists, toggleShuffle, tracks],
  );

  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <DialogTitle>{artist.name}</DialogTitle>

        <ArtistImage src={image} alt={artist.name} isLoading={imageIsLoading} />

        <DialogDescription asChild>
          <div>
            <ArtistBio loading={loadingBioData} description={bioData?.htmlSummary} />
          </div>
        </DialogDescription>

        <Separator />

        <ArtistTrackControls
          tracksCount={tracks?.length}
          onPlayClick={() => handleTrackClick()}
          onShuffleClick={() => handleTrackClick(0, true)}
        />
        <ArtistTrackList onTrackClick={handleTrackClick} tracks={tracks} />
      </DialogContent>
    </Dialog>
  );
}

export type ArtistTrackDialogProps = DialogProps & {
  artist: Artist;
};
