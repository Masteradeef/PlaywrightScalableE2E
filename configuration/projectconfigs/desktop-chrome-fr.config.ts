import { defineConfig } from '@playwright/test';

export default defineConfig({
  name: 'desktop-chrome-fr',
  use: {
    baseURL: 'https://www.autohebdo.net',
    browserName: 'chromium',
    viewport: { width: 1920, height: 1080 },
    locale: 'fr-CA',
  },
  // Project-specific settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // Use the same testDir as main config - relative to project root
  // testDir is inherited from main config
});














