import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { scan } from "react-scan";
import { AuthProvider } from "@/context/auth/auth-provider.tsx";
import { Router } from "@/routes.tsx";

if (import.meta.env.DEV) {
	scan({
		log: false,
		enabled: true,
	});
}

const queryClient = new QueryClient();

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<HashRouter>
						<Router />
					</HashRouter>
				</AuthProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
