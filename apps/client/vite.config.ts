import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { config } from "@repo/config";

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_CONFIG__: JSON.stringify(config),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
