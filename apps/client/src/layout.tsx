import "./styles/main.css";
import "@fontsource/manrope/index.css";
import { Outlet } from "react-router";
import { apiClients } from "./api/clients";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/theme";
import { ApiContext } from "./context/api-context";
import { AppTitle } from "./components/app-title";
import { Player } from "./components/player/main-player";
import { AudioProvider } from "./context/audio-ref-context";
import { WithColorFlow } from "./components/with-color-flow";

const DEFAULT_API_CLIENT: keyof typeof apiClients =
  import.meta.env.VITE_DEFAULT_API_NAME_TO_USE ?? "rest";

function Layout() {
  return (
    <ApiContext.Provider value={{ apiClientName: DEFAULT_API_CLIENT }}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppTitle />
        <main className="mx-auto w-full antialiased">
          <AudioProvider>
            <WithColorFlow>
              <Outlet />

              <Player />
              <Toaster />
            </WithColorFlow>
          </AudioProvider>
        </main>
      </ThemeProvider>
    </ApiContext.Provider>
  );
}

export default Layout;
