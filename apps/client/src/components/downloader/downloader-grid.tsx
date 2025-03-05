import { VirtuosoGrid, type GridComponents } from "react-virtuoso";
import { DownloaderTrackItem } from "./downloader-track-item";
import { forwardRef } from "react";

const components: GridComponents = {
  List: forwardRef(({ children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {children}
      </div>
    );
  }),
  Item: ({ children, ...props }) => (
    <div {...props} className="w-full">
      {children}
    </div>
  ),
};

export const DownloaderGrid = () => {
  return (
    <VirtuosoGrid
      data={Array.from({ length: 100 }, (_, i) => i)}
      overscan={2}
      components={components}
      itemContent={(index) => <DownloaderTrackItem index={index} />}
      style={{ height: "100%", willChange: "transform" }}
    />
  );
};
