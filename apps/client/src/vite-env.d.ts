/// <reference types="vite/client" />
import { Config } from "@repo/config/types";
declare global {
  const __APP_CONFIG__: Pick<Config, "enableTagEditor" | "lastFmApiKey">;
}
