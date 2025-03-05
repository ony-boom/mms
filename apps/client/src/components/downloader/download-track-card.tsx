import { memo } from "react";

const DownloadTrackCard = ({ children, style }: DownloadTrackCardProps) => {
  return (
    <div
      style={{
        ...style,
        display: "grid",
        gap: "16px",
        padding: "16px",
      }}
      className="grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {children}
    </div>
  );
};

type DownloadTrackCardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const DownloaderTrackCard = memo(DownloadTrackCard);
