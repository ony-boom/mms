import { scan } from "react-scan";
import { StrictMode } from "react";
import Layout from "./layout";
import { createRoot } from "react-dom/client";
import { Tracks } from "@/pages/Tracks/page";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

if (import.meta.env.DEV) {
  scan({
    log: false,
  });
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Tracks />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
