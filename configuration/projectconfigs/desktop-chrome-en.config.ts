import { defineConfig } from '@playwright/test';

export default defineConfig({
  name: 'desktop-chrome-en',
  use: {
    baseURL: 'https://www.autotrader.ca',
    browserName: 'chromium',
    viewport: { width: 1920, height: 1080 }    
  },
  // Project-specific settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // Test directory patterns inherited from main config
  // testDir: '../../scenarios/specs',
  // testMatch: '**/*.spec.ts',
});














