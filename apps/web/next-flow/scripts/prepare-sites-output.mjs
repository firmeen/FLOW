import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const workerEntrypoint = resolve("dist/server/index.js");
const hostingSource = resolve(".openai/hosting.json");
const hostingTarget = resolve("dist/.openai/hosting.json");

if (!existsSync(workerEntrypoint)) {
  throw new Error("vinext did not create dist/server/index.js");
}

if (!existsSync(hostingSource)) {
  throw new Error("Sites project metadata is missing from .openai/hosting.json");
}

mkdirSync(dirname(hostingTarget), { recursive: true });
copyFileSync(hostingSource, hostingTarget);

console.log("Sites artifact ready: dist/server/index.js");
