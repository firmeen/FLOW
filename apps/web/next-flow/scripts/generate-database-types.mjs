import { spawnSync } from "node:child_process";

const directUrl = process.env.DATABASE_DIRECT_URL?.trim();
if (!directUrl) {
  console.error("DATABASE_DIRECT_URL is required for database type generation.");
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = [
  "kysely-codegen",
  "--dialect",
  "postgres",
  "--url",
  directUrl,
  "--out-file",
  "src/server/db/generated/database.ts",
  "--schemas",
  "app,foodflow,payments,audit",
];

const result = spawnSync(command, args, {
  stdio: "inherit",
  env: process.env,
  shell: false,
});

if (result.error) {
  console.error("Database type generation failed to start.");
  process.exit(1);
}

process.exit(result.status ?? 1);
