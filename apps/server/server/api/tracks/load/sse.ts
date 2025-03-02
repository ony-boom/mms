import { LoadedMetadata, musicLibrary } from "~~/lib/music-manager";

export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event);
  const onMetadataLoaded = async (metadata: LoadedMetadata) => {
    await eventStream.push(
      JSON.stringify({ type: "track", ...metadata.state }),
    );
  };

  const timeout = setTimeout(async () => {
    await eventStream.push(
      JSON.stringify({ type: "status", current: 0, total: 0 }),
    );
  }, 0);

  musicLibrary.on("trackLoaded", onMetadataLoaded);

  eventStream.onClosed(() => {
    eventStream.close();
    clearInterval(timeout);
    musicLibrary.off("trackLoaded", onMetadataLoaded);
  });

  return eventStream.send();
});
