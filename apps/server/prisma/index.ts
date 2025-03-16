import { config } from "@repo/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasourceUrl: `file:${config.databasePath}?connection_limit=1&socket_timeout=5`,
});

export enum StateKey {
  DirectoryHash = "MUSIC_DIRECTORY_HASH",
}
