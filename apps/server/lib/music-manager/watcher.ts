import watch from "node-watch";
import { musicLibrary } from ".";
import { config } from "@repo/config";
import debounce from "lodash.debounce";

const DEBOUNCE_DELAY = 500;

export const startWatcher = () => {
  const handleUpdate = debounce(async (path: string) => {
    musicLibrary.emit("update", path);
  }, DEBOUNCE_DELAY);

  const handleRemove = debounce(async (path: string) => {
    musicLibrary.emit("remove", path);
  }, DEBOUNCE_DELAY);

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
