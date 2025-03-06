import { Track } from "@/api/types";
import { Cover } from "./cover";
import { Button } from "./ui/button";
import { CloudDownloadIcon } from "lucide-react";

export const RemoteTrackListElement = ({
  track,
}: RemoteTrackListElementProps) => {
  return (
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
  );
};

type RemoteTrackListElementProps = {
  track: Track;
  index: number;
};
