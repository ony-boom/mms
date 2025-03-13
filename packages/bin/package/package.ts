import * as fs from "fs";
import { build } from "./build";
import * as path from "path";
import { rootDir, serverDir } from "../constants";
import { rimraf } from "rimraf";

async function packageApp() {
  await build();
  rimraf.sync(path.join(rootDir, "build"));
  await fs.promises.rename(
    path.join(serverDir, ".output"),
    path.join(rootDir, "build"),
  );
}

packageApp().catch(console.error);
