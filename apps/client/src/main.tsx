import { scan } from "react-scan";
import { StrictMode } from "react";
import Layout from "./layout";
import { createRoot } from "react-dom/client";
import { Tracks } from "@/pages/Tracks/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

if (import.meta.env.DEV) {
  scan({
    log: false,
    enabled: false,
  });
}

const queryClient = new QueryClient();

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Tracks />
        </Layout>
      </QueryClientProvider>
    </StrictMode>,
  );
}
