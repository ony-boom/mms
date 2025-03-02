import * as path from "node:path";
import { BASE_CONFIG_DIR } from "../config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasourceUrl: `file:${path.join(BASE_CONFIG_DIR, "database.db")}?connection_limit=1&socket_timeout=5`,
});

export enum StateKey {
  DirectoryHash = "MUSIC_DIRECTORY_HASH",
}
