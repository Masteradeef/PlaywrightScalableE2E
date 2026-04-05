import { defineConfig, devices } from '@playwright/test';
import enDesktopChromeConfig from './configuration/projectconfigs/desktop-chrome-en.config';
import enMobileSafariConfig from './configuration/projectconfigs/mobile-safari-en.config';
import frDesktopChromeConfig from './configuration/projectconfigs/desktop-chrome-fr.config';
import frMobileSafariConfig from './configuration/projectconfigs/mobile-safari-fr.config';
import dotenv from 'dotenv'
import 'dotenv/config'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

dotenv.config({ path: `.//configuration/environment/.settings.env` })

process.env.DATADOG_API_HOST = 'api.datadoghq.eu'

/**
 * See https://playwright.dev/docs/test-configuration.
 */

//Enable to run for new framework structure
export default defineConfig({
  testDir: './scenarios/specifications',
  fullyParallel: process.env.CI ? false : true, // Sequential in CI for stability
  forbidOnly: !!process.env.CI, // Fail the build on CI if test.only is left in the code
  timeout: process.env.CI ? 60000 : 30000, // Longer timeout in CI
  expect: {
    timeout: process.env.CI ? 10000 : 5000 // Longer expect timeout in CI
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
  ['blob', { outputDir: 'blob-report' }],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['line'],
  ['json', { outputFile: 'utilities/outputs/results.json' }],
  ['./core/helpers/reportGenerators/custom-html-reporter.ts', {
    outputFile: 'enhanced-report.html',
    outputDir: 'utilities/outputs',
  }],
  ['./core/helpers/reportGenerators/datadog-reporter.ts', { debug: true }],
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
  outputDir: 'utilities/outputs/',
  globalSetup: require.resolve('./scenarios/support/globalSetup.ts'),
  globalTeardown: require.resolve('./scenarios/support/globalTeardown.ts')
});

