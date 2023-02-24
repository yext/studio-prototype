import { PlaywrightTestConfig, expect } from "@playwright/test";
import fs from 'fs';

expect.extend({
  async toHaveContents(filepath: string, expectedContents: string) {
    return expect.poll(() => {
      if (fs.existsSync(filepath)) {
        return fs.readFileSync(filepath, "utf-8").trim();
      }
    }).toBe(expectedContents)
  }
})

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: "./tests",
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallellism since tests may manipulate the filesystem. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    video: "on",
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npx studio",
    port: 5173,
  },
};

export default config;
