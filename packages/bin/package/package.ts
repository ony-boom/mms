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

  const prismaDestDir = path.join(rootDir, "build");
  fs.mkdirSync(prismaDestDir, { recursive: true });
  await fs.promises.copyFile(
    path.join(serverDir, "prisma", "schema.prisma"),
    path.join(prismaDestDir, "schema.prisma")
  );}

packageApp().catch(console.error);
