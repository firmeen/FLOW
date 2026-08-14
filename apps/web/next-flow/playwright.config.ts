import { defineConfig } from "@playwright/test";

import { E2E_AUTH } from "./tests/e2e/test-auth";

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    launchOptions: executablePath ? { executablePath } : undefined,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build:next && npm run start:next -- --port 3100",
    url: "http://localhost:3100",
    env: {
      FOODFLOW_INTERNAL_EMAIL: E2E_AUTH.email,
      FOODFLOW_INTERNAL_PASSWORD: E2E_AUTH.password,
      FOODFLOW_SESSION_SECRET: E2E_AUTH.secret,
    },
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
    timeout: 120_000,
  },
});
