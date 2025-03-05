import { memo } from "react";
import { DrawerContent, DrawerHeader } from "../ui/drawer";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { DialogTitle } from "../ui/dialog";
import { DownloaderGrid } from "./downloader-grid";

export const Downloader = memo(() => {
  return (
    <DrawerContent>
      <div className="flex h-[60vh] w-full flex-col">
        <DrawerHeader>
          <DialogTitle>
            <Input
              placeholder="Search track to download..."
              className="border-b-foreground/10 focus-visible:border-b-foreground/30 min-w-xl h-12 max-w-sm rounded-none focus-visible:ring-0"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTitle>
        </DrawerHeader>

        <Separator className="bg-foreground/[8%]" />

        <div className="flex-1">
          <DownloaderGrid />
        </div>
      </div>
    </DrawerContent>
  );
});
