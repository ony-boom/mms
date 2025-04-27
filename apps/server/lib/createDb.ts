import fs from "node:fs";
import { config } from "@repo/config";
import { execSync } from "node:child_process";

export async function createDb() {
  console.log("Checking if database exists...");

  if (fs.existsSync(config.databasePath)) {
    console.log("Database already exists, skipping creation");
    return;
  }

  console.log("Creating database...");

  try {
    const env = {
      ...process.env,
      DEBUG: "prisma:engine",
      DATABASE_URL: `file:${config.databasePath}`,
    };

    const prismaArgs = ["db", "push", "--skip-generate", "--accept-data-loss"];

    if (process.env.NODE_ENV !== "development") {
      prismaArgs.push("--schema", process.env.PRISMA_SCHEMA_PATH ?? "");
    }

    execSync(`prisma ${prismaArgs.join(" ")}`, {
      stdio: "inherit",
      env,
    });

    console.log("Database created successfully");
  } catch (error) {
    console.error("Failed to create database:", error);
    throw error;
  }
}
