import "./styles/main.css";
import "@fontsource/manrope/index.css";
import { Outlet } from "react-router";
import { ApiContext } from "@/context/api-context";
import { AppTitle, Player, WithColorFlow } from "@/components";
import { Toaster } from "./components/ui/sonner";
import { AudioProvider } from "./context/audio-ref-context";
import { ThemeProvider } from "./context/theme";
import { apiClients } from "./api";
import { Drawer } from "./components/ui/drawer";
import { Downloader } from "./components/downloader";
import { FormProvider, useForm } from "react-hook-form";

const DEFAULT_API_CLIENT: keyof typeof apiClients =
  import.meta.env.VITE_DEFAULT_API_NAME_TO_USE ?? "default";

function Layout() {
  const methods = useForm();
  return (
    <ApiContext.Provider value={{ apiClientName: DEFAULT_API_CLIENT }}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppTitle />
        <WithColorFlow>
          <main className="w-full">
            <FormProvider {...methods}>
              <AudioProvider>
                <Drawer>
                  <Outlet />

                  <Player />
                  <Downloader />
                  <Toaster />
                </Drawer>
              </AudioProvider>
            </FormProvider>
          </main>
        </WithColorFlow>
      </ThemeProvider>
    </ApiContext.Provider>
  );
}

export default Layout;
