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
//dotenv.config({ path: `.//playwright/env/.config.env` })  //Enable to run for legacy framework structure
dotenv.config({ path: `.//configs/env/.config.env` })  //Enable to run for new framework structure
// if (process.env.ENV) {
//   dotenv.config({ path: `.//configs/env/.${process.env.ENV}.env` })
// }
process.env.DATADOG_API_HOST = 'api.datadoghq.eu'

/**
 * See https://playwright.dev/docs/test-configuration.
 */

//Enable to run for new framework structure
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

// const config = defineConfig({
//   testDir: './playwright/e2e',
//   /* Run tests in files in parallel */
//   fullyParallel: process.env.CI ? false : true, // Sequential in CI for stability
//   /* Fail the build on CI if you accidentally left test.only in the source code. */
//   forbidOnly: !!process.env.CI,
//   /* Retry on CI only */
//   retries: process.env.CI ? 1 : 2, // Fewer retries in CI to avoid timeout
//   /* Opt out of parallel tests on CI. */
//   workers: process.env.CI ? 1 : undefined, // Single worker in CI
//   /* Test timeout */
//   timeout: process.env.CI ? 60000 : 30000, // Longer timeout in CI
//   /* Expect timeout */
//   expect: { timeout: process.env.CI ? 10000 : 5000 },
//   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
//   reporter: [
//   ['blob', { outputDir: 'blob-report' }],
//   ['html', { outputFolder: 'playwright-report', open: 'never' }],
//   ['line'],
//   ['json', { outputFile: 'test-results/results.json' }],
//   ['./playwright/utils/custom-html-reporter.ts', {
//     outputFile: 'enhanced-report.html',
//     outputDir: 'test-results',
//   }],
//   ['./playwright/utils/datadog-reporter.ts', { debug: true }],
// ],

//   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//   use: {
//     /* Base URL to use in actions like `await page.goto('/')`. */
//     //baseURL: 'http://127.0.0.1:3000',

//     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//     trace: 'on-first-retry',
    
//     /* Record video for all tests but retain only on failure */
//     video: {
//       mode: 'retain-on-failure',
//       size: { width: 1280, height: 720 }
//     },
    
//     /* Take screenshot on failure */
//     screenshot: 'only-on-failure',
    
//     launchOptions: {
//       headless: process.env.CI ? true : false, // Headless in CI, headed locally
//       slowMo: Number(process.env.SLOWMO) || 0, // No slowMo in CI for faster execution
//     },
//   },

//   /* Configure projects for major browsers */
//   projects: [
//     {
//       name: 'EN-Desktop-Chrome',
//       use: {
//         baseURL: process.env.base_url_en,
//         ...devices['Desktop Chrome'],
//         launchOptions: {
//           args: process.env.CI ? 
//             ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] : 
//             ['--start-fullscreen'],
//           headless: process.env.CI ? true : false,
//         },
//         channel: 'chromium',
//         video: {
//           mode: 'retain-on-failure',
//           size: { width: 1280, height: 720 }
//         },
//         screenshot: 'only-on-failure',
//       },
//     },
//     {
//       name: 'EN-iPhone-Safari',
//       use: {
//         baseURL: process.env.base_url_en,
//         ...devices['iPhone 14'],
//         video: {
//           mode: 'retain-on-failure',
//           size: { width: 390, height: 844 } // iPhone 14 dimensions
//         },
//         screenshot: 'only-on-failure',
//         // Note: 'headless' launch option is intentionally omitted for Safari on iPhone,
//         // as it is not applicable and has no effect for non-Chromium browsers.
//       },
//     },    
//   ],
// })

// export default config