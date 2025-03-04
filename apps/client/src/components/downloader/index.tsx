import { memo } from "react";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

export const Downloader = memo(() => {
  return (
    <DrawerContent>
      <div className="h-[60vh] w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Downloader</DrawerTitle>
          <DrawerDescription>
            Please select your files to download.
          </DrawerDescription>
        </DrawerHeader>
      </div>
    </DrawerContent>
  );
});
