import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  name: 'en-mobile-safari',
  use: {
    baseURL: 'https://www.autotrader.ca',
    ...devices['iPhone 13'],
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
  // Use the same testDir as main config - relative to project root
  // testDir is inherited from main config
});