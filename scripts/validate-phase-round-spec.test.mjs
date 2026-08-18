import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateAuthorization,
  parseCanonicalPrMetadata,
  validateSpecFilename,
} from "./validate-phase-round-spec.mjs";

const READY_SPEC = `# FLOW P01 R01 — Implementation Specification

## Metadata

- Phase: \`01\`
- Round: \`01\`
- Status: \`READY\`
- Target branch: \`main\`
- Previous: \`NONE\`
- Next: \`FLOW_P01_R02_IMPLEMENTATION_SPEC.md\`
`;

function run(overrides = {}) {
  return evaluateAuthorization({
    prBody: "Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md\nPhase: 01\nRound: 01\nPrevious: NONE",
    targetBranch: "main",
    changedFiles: ["scripts/example.mjs"],
    readBaseSpec: () => READY_SPEC,
    ...overrides,
  });
}

function rejects(fn, pattern) {
  assert.throws(fn, pattern);
}

test("valid implementation references exact READY base spec", () => {
  const result = run();
  assert.equal(result.authorized, true);
  assert.equal(result.specification, "FLOW_P01_R01_IMPLEMENTATION_SPEC.md");
});

test("true specification-only PR is allowed to bootstrap", () => {
  const result = run({
    prBody: "",
    changedFiles: ["docs/07-delivery/development-phases/FLOW_P01_R02_IMPLEMENTATION_SPEC.md"],
  });
  assert.equal(result.classification, "SPECIFICATION_PR");
});

test("mixed spec and implementation is classified as implementation and requires base authority", () => {
  rejects(
    () => run({
      prBody: "Specification: FLOW_P01_R02_IMPLEMENTATION_SPEC.md\nPhase: 01\nRound: 02",
      changedFiles: [
        "docs/07-delivery/development-phases/FLOW_P01_R02_IMPLEMENTATION_SPEC.md",
        "apps/web/next-flow/src/example.ts",
      ],
      readBaseSpec: () => { throw new Error("missing"); },
    }),
    /not present on the PR base branch/,
  );
});

test("missing canonical specification field fails closed", () => {
  rejects(() => run({ prBody: "Phase: 01\nRound: 01" }), /exactly one Specification field/);
});

test("conflicting duplicate fields are rejected", () => {
  rejects(
    () => parseCanonicalPrMetadata("Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md\nSpecification: FLOW_P01_R02_IMPLEMENTATION_SPEC.md"),
    /Conflicting Specification/,
  );
});

test("malformed and unsafe filenames are rejected", () => {
  for (const value of [
    "FLOW_P1_R1_IMPLEMENTATION_SPEC.md",
    "FLOW_P01_R00_IMPLEMENTATION_SPEC.md",
    "FLOW_P01_R07_IMPLEMENTATION_SPEC.md",
    "../FLOW_P01_R01_IMPLEMENTATION_SPEC.md",
    "/docs/FLOW_P01_R01_IMPLEMENTATION_SPEC.md",
    "https://example.com/FLOW_P01_R01_IMPLEMENTATION_SPEC.md",
    "C:\\FLOW_P01_R01_IMPLEMENTATION_SPEC.md",
  ]) {
    assert.throws(() => validateSpecFilename(value));
  }
});

test("non-READY base status cannot authorize implementation", () => {
  for (const status of ["DRAFT", "BLOCKED", "COMPLETE"]) {
    rejects(
      () => run({ readBaseSpec: () => READY_SPEC.replace("READY", status) }),
      new RegExp(`status is ${status}`),
    );
  }
});

test("head-only specification cannot self-authorize", () => {
  rejects(() => run({ readBaseSpec: () => { throw new Error("head only"); } }), /not present on the PR base branch/);
});

test("filename/spec metadata mismatch is rejected", () => {
  rejects(() => run({ readBaseSpec: () => READY_SPEC.replace("Phase: `01`", "Phase: `02`") }), /Filename Phase\/Round/);
});

test("PR/spec metadata mismatch is rejected", () => {
  rejects(() => run({ prBody: "Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md\nPhase: 01\nRound: 02" }), /PR Phase\/Round/);
});

test("target branch mismatch is rejected", () => {
  rejects(() => run({ targetBranch: "dev" }), /does not match PR target/);
});

test("Previous metadata mismatch is rejected", () => {
  rejects(
    () => run({ prBody: "Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md\nPhase: 01\nRound: 01\nPrevious: FLOW_P00_R06_IMPLEMENTATION_SPEC.md" }),
    /Previous field does not match/,
  );
});
