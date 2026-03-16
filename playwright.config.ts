import { defineConfig, devices } from '@playwright/test';
import enDesktopChromeConfig from './configs/projects/en-desktop-chrome.config';
import enMobileSafariConfig from './configs/projects/en-mobile-safari.config';
import frDesktopChromeConfig from './configs/projects/fr-desktop-chrome.config';
import frMobileSafariConfig from './configs/projects/fr-mobile-safari.config';
import dotenv from 'dotenv'
import 'dotenv/config'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: `.//configs/env/.config.env` })
// if (process.env.ENV) {
//   dotenv.config({ path: `.//configs/env/.${process.env.ENV}.env` })
// }
process.env.DATADOG_API_HOST = 'api.datadoghq.eu'

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: process.env.CI ? false : true, // Sequential in CI for stability
  forbidOnly: !!process.env.CI, // Fail the build on CI if test.only is left in the code
  timeout: process.env.CI ? 60000 : 30000, // Longer timeout in CI
  expect: {
    timeout: process.env.CI ? 10000 : 5000 // Longer expect timeout in CI
  },
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
  ['blob', { outputDir: 'blob-report' }],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['line'],
  ['json', { outputFile: 'test-results/results.json' }],
  ['./src/utils/reporters/custom-html-reporter.ts', {
    outputFile: 'enhanced-report.html',
    outputDir: 'test-results',
  }],
  ['./src/utils/reporters/datadog-reporter.ts', { debug: true }],
],
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    enDesktopChromeConfig,
    enMobileSafariConfig,
    frDesktopChromeConfig,
    frMobileSafariConfig
  ],
  outputDir: 'test-results/',
  globalSetup: require.resolve('./tests/helpers/global-setup.ts'),
  globalTeardown: require.resolve('./tests/helpers/global-teardown.ts')
});
