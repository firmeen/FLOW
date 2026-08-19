import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const directUrl = process.env.DATABASE_DIRECT_URL?.trim();
if (!directUrl) {
  console.error("DATABASE_DIRECT_URL is required for database type generation.");
  process.exit(1);
}

const outFile = "src/server/db/generated/database.ts";
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = [
  "kysely-codegen",
  "--dialect",
  "postgres",
  "--url",
  directUrl,
  "--out-file",
  outFile,
  "--include-pattern",
  "{app,foodflow,payments,audit}.*",
];

const result = spawnSync(command, args, {
  stdio: "inherit",
  env: process.env,
  shell: false,
});

if (result.error || result.status !== 0) {
  console.error("Database type generation failed.");
  process.exit(result.status ?? 1);
}

const generated = readFileSync(outFile, "utf8");
if (!generated.includes("export interface DB {")) {
  console.error("Generated database type contract is missing the expected DB interface.");
  process.exit(1);
}

writeFileSync(outFile, generated.replace("export interface DB {", "export interface Database {"));
