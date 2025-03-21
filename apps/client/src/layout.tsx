import "./styles/main.css";
import "@fontsource/manrope/index.css";
import { Outlet } from "react-router";
import { apiClients } from "./api/clients";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/theme";
import { ApiContext } from "./context/api-context";
import { AppTitle } from "./components/app-title";
import { Player } from "./components/player/main-player";
import { PreviewAudio } from "./components/audio-preview";
import { AudioProvider } from "./context/audio-ref-context";
import { WithColorFlow } from "./components/with-color-flow";
import { AudioPreviewProvider } from "./context/audio-preview-context";
import { useConnect } from "@/api/downloader/auth";

const DEFAULT_API_CLIENT: keyof typeof apiClients =
  import.meta.env.VITE_DEFAULT_API_NAME_TO_USE ?? "rest";

function Layout() {
  useConnect({
    enabled: import.meta.env.DEV,
  });

  return (
    <ApiContext.Provider value={{ apiClientName: DEFAULT_API_CLIENT }}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppTitle />
        <main className="mx-auto w-full antialiased">
          <AudioProvider>
            <AudioPreviewProvider>
              <WithColorFlow>
                <Outlet />

                <Player />
                <PreviewAudio />
                <Toaster />
              </WithColorFlow>
            </AudioPreviewProvider>
          </AudioProvider>
        </main>
      </ThemeProvider>
    </ApiContext.Provider>
  );
}

export default Layout;
