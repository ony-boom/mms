import fs from "fs";
import { BASE_CONFIG_DIR } from "@repo/config";

// delete base config dir
fs.rmSync(BASE_CONFIG_DIR, { recursive: true, force: true });
