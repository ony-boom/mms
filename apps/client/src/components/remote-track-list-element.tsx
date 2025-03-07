import { Track } from "@/api/types";
import { Cover } from "./cover";
import { Button } from "./ui/button";
import { CloudDownloadIcon, PlayIcon } from "lucide-react";
import { useAudioPreviewRef } from "@/hooks";

export const RemoteTrackListElement = ({
  track,
}: RemoteTrackListElementProps) => {
  const ref = useAudioPreviewRef();
  const handleClickPlay = () => {
    if (!ref.current || !track.remoteTrackPreview) return;

    ref.current.src = track.remoteTrackPreview;

    ref.current.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    console.log(`Playing track: ${track.remoteTrackTitle}`);
  };
  return (
    <div className="group relative">
      <li className="hover:bg-foreground/[5%] mt-2 flex items-center justify-between p-2 opacity-50">
        <div className="flex items-end gap-3">
          <Cover
            src={track.remoteAlbumCover ?? ""}
            alt={track.remoteTrackTitle}
            className="h-full w-12 rounded"
          />

          <div className="flex flex-col">
            <small className="font-bold">{track.remoteTrackTitle}</small>
            <small>{track.remoteArtistName}</small>
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="relative hover:cursor-pointer"
        >
          <CloudDownloadIcon />
        </Button>
      </li>

      <Button
        size="icon"
        variant={"ghost"}
        onClick={handleClickPlay}
        className="absolute inset-3.5 z-20 opacity-0 hover:cursor-pointer group-hover:opacity-100"
      >
        <PlayIcon />
      </Button>
    </div>
  );
};

type RemoteTrackListElementProps = {
  track: Track;
  index: number;
};
