import { DownloaderTrackItem } from "./downloader-track-item";

export const DownloaderGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 md:gap-3 md:p-3 lg:grid-cols-3 lg:gap-4 lg:p-4 xl:grid-cols-4">
      {Array.from({ length: 24 }, (_, index) => (
        <DownloaderTrackItem key={index} index={index} />
      ))}
    </div>
  );
};
