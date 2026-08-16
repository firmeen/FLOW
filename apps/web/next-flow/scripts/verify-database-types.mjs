import { spawnSync } from "node:child_process";

const generate = spawnSync(process.execPath, ["scripts/generate-database-types.mjs"], {
  stdio: "inherit",
  env: process.env,
});

if (generate.status !== 0) {
  process.exit(generate.status ?? 1);
}

const git = process.platform === "win32" ? "git.exe" : "git";
const diff = spawnSync(
  git,
  ["diff", "--exit-code", "--", "src/server/db/generated/database.ts"],
  { stdio: "inherit" },
);

if (diff.status !== 0) {
  console.error("Database types are out of date.");
}

process.exit(diff.status ?? 1);
