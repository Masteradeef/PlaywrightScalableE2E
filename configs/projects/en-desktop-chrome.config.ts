import { defineConfig } from '@playwright/test';

export default defineConfig({
  name: 'en-desktop-chrome',
  use: {
    baseURL: 'https://www.autotrader.ca',
    browserName: 'chromium',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    // Custom project context
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    },
  },
  // Project-specific settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // Test directory patterns inherited from main config
  // testDir: '../../tests/specs',
  // testMatch: '**/*.spec.ts',
});