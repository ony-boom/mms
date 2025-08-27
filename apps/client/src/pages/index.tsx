import { Tracks } from "@/pages/Tracks/page.tsx";
import { AudioProvider } from "@/context/audio-ref-context.tsx";
import { WithColorFlow } from "@/components/with-color-flow.tsx";
import { Player } from "@/components/player/main-player.tsx";
import { Toaster } from "sonner";
import { useAppTitle } from "@/hooks/use-app-title.ts";
import { memo, useEffect } from "react";
import { useApiClient } from "@/hooks/use-api-client";
import { useAuth } from "@/hooks/use-auth";

export const Index = memo(() => {
  const { setUser } = useAuth();
  const { usePing } = useApiClient();

  const { data } = usePing();

  useAppTitle();

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  return (
    <>
      <AudioProvider>
        <WithColorFlow>
          <Tracks />
          <Player />
        </WithColorFlow>
      </AudioProvider>

      <Toaster />
    </>
  );
});
