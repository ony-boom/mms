import { ArrowDownToLine } from "lucide-react";
import { Button } from "../ui/button";
import { memo } from "react";

export const DownloaderTrackItem = memo(
  ({ index }: DownloaderTrackItemProps) => {
    return (
      <div
        key={index}
        className={`col-start-${(index % 4) + 1} row-start-${Math.floor(index / 4) + 1} flex p-4`}
      >
        <img
          src={`https://picsum.photos/id/237/200/300`}
          alt={`Image ${index + 1}`}
          className="mr-4 h-32 w-32 object-cover"
        />
        <div className="flex flex-1 flex-col">
          <h3 className="text-lg font-semibold">Title {index + 1}</h3>
          <p className="text-sm text-gray-600">
            Description for item {index + 1}
          </p>

          <div className="flex flex-1 items-end justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="relative hover:cursor-pointer"
              onClick={() => {}}
            >
              <ArrowDownToLine />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

type DownloaderTrackItemProps = {
  index: number;
};
