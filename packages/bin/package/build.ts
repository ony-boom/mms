import * as fs from "node:fs";
import * as path from "node:path";
import { rootDir, serverDir } from "../constants";
import { spawn } from "node:child_process";

const serverOutputDir = path.join(serverDir, ".output");
const clientOutputDir = path.join(serverDir, "dist");

const createBuildDirIfNotExists = async () => {
  const buildDir = path.join(rootDir, "build");
  if (!fs.existsSync(buildDir)) {
    await fs.promises.mkdir(buildDir);
  }
};

export function build() {
  const childProcess = spawn("pnpm", ["run", "build"], {
    stdio: "inherit",
    cwd: rootDir,
  });

  childProcess.on("close", (code) => {
    if (code === 1) {
      console.error(
        "Build failed, please check the output, fix any errors and try again.",
      );
      process.exit(code);
    }
  });
}
