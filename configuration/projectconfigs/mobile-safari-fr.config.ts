import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  name: 'mobile-safari-fr',
  use: {
    baseURL: 'https://www.autohebdo.net',
    ...devices['iPhone 13'],
    locale: 'fr-CA',
  },
  // Project-specific settings
  timeout: 180000,
  expect: {
    timeout: 60000,
  },
  // Use the same testDir as main config - relative to project root
  // testDir is inherited from main config
});














