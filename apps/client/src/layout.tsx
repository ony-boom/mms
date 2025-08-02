import "./styles/main.css";
import "@fontsource/manrope/index.css";
import { apiClients } from "./api/clients";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/theme";
import { ApiContext } from "./context/api-context";
import { useAppTitle } from "./hooks/use-app-title";
import { Player } from "./components/player/main-player";
import { AudioProvider } from "./context/audio-ref-context";
import { WithColorFlow } from "./components/with-color-flow";

const DEFAULT_API_CLIENT: keyof typeof apiClients =
  import.meta.env.VITE_DEFAULT_API_NAME_TO_USE ?? "rest";

function Layout({ children }: { children?: React.ReactNode }) {
  useAppTitle();

  return (
    <ApiContext.Provider value={{ apiClientName: DEFAULT_API_CLIENT }}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <main className="mx-auto w-full antialiased">
          <AudioProvider>
            <WithColorFlow>
              {children}
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
