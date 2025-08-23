import { Tracks } from "@/pages/Tracks/page.tsx";
import { AudioProvider } from "@/context/audio-ref-context.tsx";
import { WithColorFlow } from "@/components/with-color-flow.tsx";
import { Player } from "@/components/player/main-player.tsx";
import { Toaster } from "sonner";
import { useAppTitle } from "@/hooks/use-app-title.ts";

export function Index() {
  useAppTitle();
  return (
    <AudioProvider>
      <WithColorFlow>
        <Tracks />
        <Player />
        <Toaster />
      </WithColorFlow>
    </AudioProvider>
  );
}
