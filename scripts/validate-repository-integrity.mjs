#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const entries = git(["ls-files", "--stage"])
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^(\d{6})\s+[0-9a-f]{40}\s+\d+\t(.+)$/);
    return match ? { mode: match[1], path: match[2] } : null;
  })
  .filter(Boolean);

const gitlinks = entries.filter((entry) => entry.mode === "160000").map((entry) => entry.path);

if (gitlinks.length > 0) {
  fail(`Repository Integrity: FAIL\nUnmanaged or unsupported gitlink entries found:\n${gitlinks.map((path) => `- ${path}`).join("\n")}\nFLOW currently supports no submodules. Register an owner-approved submodule contract explicitly before adding a gitlink.`);
}

let gitmodulesTracked = true;
try {
  git(["ls-files", "--error-unmatch", ".gitmodules"]);
} catch {
  gitmodulesTracked = false;
}

if (gitmodulesTracked) {
  fail("Repository Integrity: FAIL\n.gitmodules is tracked but FLOW currently has no approved retained submodules.");
}

console.log("Repository Integrity: PASS");
console.log("Tracked gitlinks: 0");
console.log("Tracked .gitmodules: NO");
