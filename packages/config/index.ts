// config.ts
import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";
import { type Config, ConfigFile } from "./types.js";

export const BASE_CONFIG_DIR = (
  fs.existsSync(process.env.XDG_CONFIG_HOME as fs.PathLike)
    ? path.join(process.env.XDG_CONFIG_HOME!, "mms")
    : path.join(os.homedir(), ".config", "mms")
)!;

const sanitizePath = (pathStr: string) => {
  return pathStr.replace(/~|\$HOME/g, os.homedir());
};

const ensurePathExists = (p: string) => {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  return p;
};

const coverPath = ensurePathExists(path.join(BASE_CONFIG_DIR, "covers"));
const configFilePath = path.join(
  ensurePathExists(BASE_CONFIG_DIR),
  "config.json",
);

const DEFAULT_CONFIG: ConfigFile = {
  musicPath: "~/Music",
  lastFmApiKey: "",
};

if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(configFilePath, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

const buildConfig = (): Config => {
  const parsedConfig = JSON.parse(
    fs.readFileSync(configFilePath, "utf-8"),
  ) as ConfigFile;

  return {
    coverPath,
    musicPath: sanitizePath(parsedConfig.musicPath),
    defaultCoverExtension: "jpeg",
    databasePath: path.join(BASE_CONFIG_DIR, "database.db"),
    lastFmApiKey: parsedConfig.lastFmApiKey,
  };
};

let cachedConfig: Config | null = null;
let cachedMtimeMs = -1;

const readConfigIfStale = (): Config => {
  let mtimeMs = cachedMtimeMs;
  try {
    mtimeMs = fs.statSync(configFilePath).mtimeMs;
  } catch {
    // If stat fails (unlikely), rebuild to be safe
    cachedConfig = buildConfig();
    cachedMtimeMs = Date.now();
    return cachedConfig;
  }

  if (!cachedConfig || mtimeMs !== cachedMtimeMs) {
    cachedConfig = buildConfig();
    cachedMtimeMs = mtimeMs;
  }
  return cachedConfig;
};

export function getConfig(): Config {
  return readConfigIfStale();
}

export const config: Config = new Proxy({} as Config, {
  get(_target, prop, _receiver) {
    const current = getConfig();
    return (current as any)[prop];
  },
  ownKeys() {
    return Reflect.ownKeys(getConfig());
  },
  getOwnPropertyDescriptor(_target, prop) {
    const current = getConfig();
    const desc = Object.getOwnPropertyDescriptor(current, prop);
    if (desc) return desc;
    return {
      configurable: true,
      enumerable: true,
      value: (current as any)[prop],
      writable: false,
    };
  },
});
