import { existsSync, rmSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { clientDir, configDir, rootDir, serverDir } from "../constants.js";

const PM = "pnpm";
const clientOutputDir = path.join(clientDir, "dist");

async function runBuild(
  cwd: string,
  opts: {
    preBuild?: () => Promise<void>;
    postBuild?: () => Promise<void>;
  } = {},
) {
  if (opts.preBuild) await opts.preBuild();

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(PM, ["run", "build"], { cwd, stdio: "inherit" });
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Exit code ${code}`)),
    );
  });

  if (opts.postBuild) await opts.postBuild();
}

export async function build() {
  const buildDir = path.join(rootDir, "build");
  if (!existsSync(buildDir)) {
    await fs.mkdir(buildDir, { recursive: true });
  }

  await runBuild(configDir);
  await runBuild(clientDir);

  console.info("Copying client output to server public dir");
  const publicDir = path.join(serverDir, "server", "public");
  if (existsSync(publicDir)) {
    rmSync(publicDir, { recursive: true, force: true });
  }
  await fs.rename(clientOutputDir, publicDir);

  await runBuild(serverDir);
}
