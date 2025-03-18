import * as fs from "node:fs";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { clientDir, serverDir } from "./constants.js";

const copyExampleEnvFile = async (basePath: string) => {
  const exampleEnvPath = path.resolve(basePath, ".env.example");
  const envPath = path.resolve(basePath, ".env");
  if (fs.existsSync(envPath)) return;
  await fs.promises.copyFile(exampleEnvPath, envPath);
};

const run = async () => {
  await copyExampleEnvFile(clientDir);
  await copyExampleEnvFile(serverDir);

  // launch db:push script in server
  spawn("pnpm", ["db:push"], { cwd: serverDir, stdio: "inherit" });
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    console.log("Setup complete ✅");
  });
