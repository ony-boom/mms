import * as path from "node:path";

export const rootDir = path.resolve(
  process.cwd(),
  "../../",
);
export const clientDir = path.resolve(rootDir, "apps/client");
export const serverDir = path.resolve(rootDir, "apps/server");
