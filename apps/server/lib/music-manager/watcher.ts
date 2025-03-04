import watch from "node-watch";
import { musicLibrary } from ".";
import { config } from "@repo/config";
import debounce from "lodash.debounce";

export const startWatcher = () => {
  const handleUpdate = debounce(async (path: string) => {
    musicLibrary.emit("update", path);
  }, 1000);

  const handleRemove = debounce(async (path: string) => {
    musicLibrary.emit("remove", path);
  }, 1000);

  const watcher = watch(
    config.musicPath,
    { recursive: true },
    async (event: WatchEvent, path: string) => {
      if (event === "update") {
        await handleUpdate(path);
      }
      if (event === "remove") {
        await handleRemove(path);
      }
    },
  );

  return () => {
    watcher.close();
    handleUpdate.cancel();
    handleRemove.cancel();
  };
};

type WatchEvent = "update" | "remove";
