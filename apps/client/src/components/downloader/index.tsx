import { forwardRef, memo } from "react";
import { DrawerContent, DrawerHeader } from "../ui/drawer";
import { Input } from "../ui/input";
import { DownloaderTrackItem } from "./downloader-track-item";
import { VirtuosoGrid } from "react-virtuoso";

export const Downloader = memo(() => {
  return (
    <DrawerContent>
      <div className="flex h-[60vh] w-full flex-col">
        <DrawerHeader>
          <Input
            placeholder="Search track to download..."
            className="border-b-foreground/10 focus-visible:border-b-foreground/30 min-w-xl h-12 max-w-sm rounded-none focus-visible:ring-0"
            onClick={(e) => e.stopPropagation()}
          />
        </DrawerHeader>

        <div className="flex-1">
          <VirtuosoGrid
            data={Array.from({ length: 100 }, (_, i) => i)}
            overscan={2}
            components={{
              List: forwardRef<
                HTMLDivElement,
                { style?: React.CSSProperties; children?: React.ReactNode }
              >(({ style, children, ...props }, ref) => {
                return (
                  <div
                    ref={ref}
                    {...props}
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
              }),
              Item: ({ children, ...props }) => (
                <div {...props} className="w-full">
                  {children}
                </div>
              ),
            }}
            itemContent={(index) => <DownloaderTrackItem index={index} />}
            style={{ height: "100%", willChange: "transform" }}
          />
        </div>
      </div>
    </DrawerContent>
  );
});
