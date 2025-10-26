import {
  type SpawnOptions,
  type StdioOptions,
  spawn,
} from "node:child_process";
import { existsSync, promises } from "node:fs";
import * as path from "node:path";
import { clientDir, configDir, serverDir } from "./constants.js";

const copyExampleEnvFile = async (basePath: string) => {
  const exampleEnvPath = path.resolve(basePath, ".env.example");
  const envPath = path.resolve(basePath, ".env");
  if (existsSync(envPath)) return;
  await promises.copyFile(exampleEnvPath, envPath);
};

const runCommands = async () => {
  const skipDbPush = process.argv.includes("--skip-db-push");
  const commands: {
    cmd: string;
    args: string[];
    options: SpawnOptions;
  }[] = [{ cmd: "pnpm", args: ["build"], options: { cwd: configDir } }];

  if (!skipDbPush) {
    commands.push({
      cmd: "pnpm",
      args: ["db:push"],
      options: { cwd: serverDir, stdio: "inherit" as StdioOptions },
    });
  }

  await Promise.all(
    commands.map(
      ({ cmd, args, options }) =>
        new Promise<void>((resolve, reject) => {
          const childProcess = spawn(cmd, args, options);
          childProcess.on("close", (code) => {
            if (code !== 0) {
              reject(
                new Error(`${cmd} ${args.join(" ")} failed with code ${code}`),
              );
            } else {
              resolve();
            }
          });
        }),
    ),
  );
};

const run = async () => {
  await copyExampleEnvFile(clientDir);
  await copyExampleEnvFile(serverDir);

  await runCommands();
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    console.log("Setup complete ✅");
  });
