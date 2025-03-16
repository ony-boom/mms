import * as fs from "fs";
import { build } from "./build.js";
import * as path from "path";
import { rootDir, serverDir } from "../constants.js";
import { rimraf } from "rimraf";

async function packageApp() {
  await build();
  rimraf.sync(path.join(rootDir, "build"));
  await fs.promises.rename(
    path.join(serverDir, ".output"),
    path.join(rootDir, "build"),
  );

  // Copy prisma directory instead of moving it
  const prismaDestDir = path.join(rootDir, "build", "server", "prisma");
  fs.mkdirSync(prismaDestDir, { recursive: true });
  await fs.promises.cp(path.join(serverDir, "prisma"), prismaDestDir, {
    recursive: true,
  });
}

packageApp().catch(console.error);
