import { musicLibrary } from "~~/lib/music-manager";

export default defineNitroPlugin(() => {
  musicLibrary.initWatcher();
});
