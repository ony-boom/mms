import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";
import {type Config, ConfigFile} from "./types";

export const BASE_CONFIG_DIR = (
    fs.existsSync(process.env.XDG_CONFIG_HOME as fs.PathLike)
        ? path.join(process.env.XDG_CONFIG_HOME!, "mms")
        : path.join(os.homedir(), ".config", "mms")
)!;

const sanitizePath = (path: string) => {
    return path.replace(/~|\$HOME/g, os.homedir());
};

const ensurePathExists = (path: string) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
    return path;
};

const coverPath = ensurePathExists(path.join(BASE_CONFIG_DIR, "covers"));
const configFilePath = path.join(
    ensurePathExists(BASE_CONFIG_DIR),
    "config.json",
);

const DEFAULT_CONFIG: ConfigFile = {
    musicPath: "~/Music",
};

const buildConfig = () => {
    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }

    const parsedConfig = JSON.parse(
        fs.readFileSync(configFilePath, "utf-8"),
    ) as ConfigFile;

    return {
        coverPath,
        musicPath: sanitizePath(parsedConfig.musicPath),
    } satisfies Config;
};

export const config = buildConfig();
