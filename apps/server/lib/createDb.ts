import fs from "node:fs";
import { config } from "@repo/config";
import { spawn } from "node:child_process";

export async function createDb() {
  console.log("Checking if database exists...");
  const dbExist = fs.existsSync(config.databasePath);
  if (dbExist) {
    console.log("Database already exists, skipping creation");
    return;
  }

  return new Promise((resolve, reject) => {
    console.log("Creating database...");

    const env = {
      ...process.env,
      DEBUG: "prisma:engine",
      DATABASE_URL: `file:${config.databasePath}`,
    };

    const dbPushProcess = spawn(
      "npx",
      [
        "--yes",
        "prisma",
        "db",
        "push",
        "--skip-generate",
        "--accept-data-loss",
      ],
      {
        stdio: "inherit",
        env,
      },
    );

    dbPushProcess.on("error", (err) => {
      console.error("Failed to start database creation process:", err);
      reject(err);
    });

    dbPushProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Database created successfully");
        resolve(code);
      } else {
        console.error(`Failed to create database, exit code: ${code}`);
        reject(new Error(`Failed to create database with exit code ${code}`));
      }
    });
  });
}
