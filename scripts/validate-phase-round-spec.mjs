#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const SPEC_DIR = "docs/07-delivery/development-phases";
const SPEC_RE = /^FLOW_P(\d{2})_R(\d{2})_IMPLEMENTATION_SPEC\.md$/;
const STATUS_ALLOWED = new Set(["READY"]);

function fail(message) {
  const error = new Error(message);
  error.name = "PhaseRoundValidationError";
  throw error;
}

export function parseCanonicalPrMetadata(body = "") {
  const fields = {};
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^(Specification|Phase|Round|Previous):\s*(.+?)\s*$/i);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim().replace(/^`|`$/g, "");
    if (fields[key] && fields[key] !== value) {
      fail(`ERROR: Conflicting ${match[1]} fields are not allowed.`);
    }
    fields[key] = value;
  }
  return fields;
}

export function parseSpecMetadata(content) {
  const wanted = new Map([
    ["phase", "Phase"],
    ["round", "Round"],
    ["status", "Status"],
    ["target branch", "Target branch"],
    ["previous", "Previous"],
    ["next", "Next"],
  ]);
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const match = rawLine.trim().match(/^-\s+([^:]+):\s*`?([^`]+?)`?\s*$/);
    if (!match) continue;
    const normalized = match[1].trim().toLowerCase();
    const canonical = wanted.get(normalized);
    if (canonical) out[canonical] = match[2].trim();
  }
  for (const canonical of wanted.values()) {
    if (!out[canonical]) fail(`ERROR: Referenced specification is missing required metadata: ${canonical}.`);
  }
  return out;
}

export function validateSpecFilename(filename) {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..") || /^https?:/i.test(filename) || /^[A-Za-z]:/.test(filename)) {
    fail("ERROR: Specification must be a bare canonical filename in the controlled specification directory.");
  }
  const match = filename.match(SPEC_RE);
  if (!match) {
    fail("ERROR: Invalid specification filename. Expected FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md with zero-padded phase and round.");
  }
  const phase = Number(match[1]);
  const round = Number(match[2]);
  if (phase < 1) fail("ERROR: Phase must be >= 01.");
  if (round < 1 || round > 6) fail("ERROR: Round must be between 01 and 06.");
  return { phase: match[1], round: match[2] };
}

export function classifyChangedFiles(changedFiles) {
  if (!changedFiles.length) fail("ERROR: Unable to classify PR because no changed files were supplied.");
  const specOnly = changedFiles.every((path) => path.startsWith(`${SPEC_DIR}/`));
  return specOnly ? "SPECIFICATION_PR" : "IMPLEMENTATION_PR";
}

function validateContinuation(value, { allowNone }) {
  if (value === "NONE" && allowNone) return;
  validateSpecFilename(value);
}

export function evaluateAuthorization({ prBody, targetBranch, changedFiles, readBaseSpec }) {
  const classification = classifyChangedFiles(changedFiles);
  if (classification === "SPECIFICATION_PR") {
    return { classification, authorized: true, specification: null };
  }

  const pr = parseCanonicalPrMetadata(prBody);
  if (!pr.specification) {
    fail("ERROR: Implementation PR must include exactly one Specification field.\nExpected format:\nSpecification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md");
  }
  if (!pr.phase || !/^\d{2}$/.test(pr.phase)) fail("ERROR: Implementation PR must include Phase: XX.");
  if (!pr.round || !/^\d{2}$/.test(pr.round)) fail("ERROR: Implementation PR must include Round: XX.");

  const fileParts = validateSpecFilename(pr.specification);
  const path = `${SPEC_DIR}/${pr.specification}`;
  let specContent;
  try {
    specContent = readBaseSpec(path);
  } catch {
    fail(`ERROR: ${pr.specification} is not present on the PR base branch.\nMerge the specification PR to main before implementation.`);
  }
  if (!specContent) fail(`ERROR: ${pr.specification} is not present on the PR base branch.`);

  const spec = parseSpecMetadata(specContent);
  if (!STATUS_ALLOWED.has(spec.Status)) fail(`ERROR: Referenced specification status is ${spec.Status}.\nImplementation is not authorized.`);
  if (spec["Target branch"] !== targetBranch) fail(`ERROR: Specification target branch ${spec["Target branch"]} does not match PR target ${targetBranch}.`);
  if (fileParts.phase !== spec.Phase || fileParts.round !== spec.Round) fail("ERROR: Filename Phase/Round does not match specification metadata.");
  if (pr.phase !== spec.Phase || pr.round !== spec.Round) fail("ERROR: PR Phase/Round does not match referenced specification metadata.");
  validateContinuation(spec.Previous, { allowNone: true });
  validateContinuation(spec.Next, { allowNone: true });
  if (pr.previous && pr.previous !== spec.Previous) fail("ERROR: PR Previous field does not match specification Previous metadata.");

  return { classification, authorized: true, specification: pr.specification, phase: spec.Phase, round: spec.Round };
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function runCli() {
  const eventJson = process.env.GITHUB_EVENT_PATH;
  if (!eventJson) fail("ERROR: GITHUB_EVENT_PATH is required in workflow execution.");
  const event = JSON.parse(execFileSync(process.execPath, ["-e", `const fs=require('fs');process.stdout.write(fs.readFileSync(${JSON.stringify(eventJson)},'utf8'))`], { encoding: "utf8" }));
  const pr = event.pull_request;
  if (!pr) fail("ERROR: pull_request event payload is required.");
  const baseSha = pr.base.sha;
  const headSha = pr.head.sha;
  if (!/^[0-9a-f]{40}$/.test(baseSha) || !/^[0-9a-f]{40}$/.test(headSha)) fail("ERROR: Invalid base/head SHA in event payload.");
  const changed = git(["diff", "--name-only", `${baseSha}...${headSha}`]).split(/\r?\n/).filter(Boolean);
  const result = evaluateAuthorization({
    prBody: pr.body ?? "",
    targetBranch: pr.base.ref,
    changedFiles: changed,
    readBaseSpec: (path) => git(["show", `${baseSha}:${path}`]),
  });
  console.log(`Phase/Round classification: ${result.classification}`);
  if (result.specification) console.log(`Authorized specification: ${result.specification}`);
  console.log("Phase/Round authorization: PASS");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    runCli();
  } catch (error) {
    console.error(error?.message ?? String(error));
    process.exit(1);
  }
}
