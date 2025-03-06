import "./styles/main.css";
import "@fontsource/manrope/index.css";
import { Outlet } from "react-router";
import { ApiContext } from "@/context/api-context";
import { AppTitle, Player, WithColorFlow } from "@/components";
import { Toaster } from "./components/ui/sonner";
import { AudioProvider } from "./context/audio-ref-context";
import { ThemeProvider } from "./context/theme";
import { apiClients } from "./api";
import { InitBinding } from "./components/init-binding";

const DEFAULT_API_CLIENT: keyof typeof apiClients =
  import.meta.env.VITE_DEFAULT_API_NAME_TO_USE ?? "default";

function Layout() {
  return (
    <ApiContext.Provider value={{ apiClientName: DEFAULT_API_CLIENT }}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <InitBinding>
          <AppTitle />
          <WithColorFlow>
            <main className="mx-auto w-full">
              <AudioProvider>
                <Outlet />

                <Player />
                <Toaster />
              </AudioProvider>
            </main>
          </WithColorFlow>
        </InitBinding>
      </ThemeProvider>
    </ApiContext.Provider>
  );
}

export default Layout;
