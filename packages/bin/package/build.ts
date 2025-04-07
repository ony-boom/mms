import * as fs from "node:fs";
import * as rimraf from "rimraf";
import * as path from "node:path";
// import { spawn } from "node:child_process";
import { clientDir, rootDir, serverDir} from "../constants.js";

// const PM = "pnpm";

const clientOutputDir = path.join(clientDir, "dist");

/*const buildApp = (
  cwd: string,
  opts?: { preBuild?: () => Promise<void>; postBuild?: () => Promise<void> },
) => {
  return new Promise(async (resolve, reject) => {
    await opts?.preBuild?.();
    const proc = spawn(PM, ["run", "build"], {
      stdio: "inherit",
      cwd,
    });

    proc.on("error", (err) => {
      reject(err.message);
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        reject(code);
      }
      resolve(code);
      await opts?.postBuild?.();
    });
  });
}*/

const moveClientBuildToServerPublicDir = async () => {
  console.info("Copying client output to server public dir");
  const newPath = path.join(serverDir, "server", "public");

  if (fs.existsSync(newPath)) {
    console.info("Removing existing public dir");
    rimraf.sync(newPath);
  }

  await fs.promises.rename(clientOutputDir, newPath);
};

const createBuildDirIfNotExists = async () => {
  const buildDir = path.join(rootDir, "build");
  if (!fs.existsSync(buildDir)) {
    await fs.promises.mkdir(buildDir);
  }
};

export async function build() {
  await createBuildDirIfNotExists();
  // await buildApp(configDir);
  // await buildApp(clientDir);
  await moveClientBuildToServerPublicDir();
  // await buildApp(serverDir);
}
