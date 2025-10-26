import "./styles/main.css";
import "@fontsource/manrope/index.css";
import { Outlet } from "react-router";
import type { apiClients } from "./api/clients";
import { ApiContext } from "./context/api-context";
import { ThemeProvider } from "./context/theme";

const DEFAULT_API_CLIENT: keyof typeof apiClients =
	import.meta.env.VITE_DEFAULT_API_NAME_TO_USE ?? "rest";

function Layout() {
	return (
		<ApiContext.Provider value={{ apiClientName: DEFAULT_API_CLIENT }}>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<main className="mx-auto w-full antialiased">
					<Outlet />
				</main>
			</ThemeProvider>
		</ApiContext.Provider>
	);
}

export default Layout;
