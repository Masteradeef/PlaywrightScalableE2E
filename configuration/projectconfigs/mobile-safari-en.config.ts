import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  name: 'mobile-safari-en',
  use: {
    baseURL: 'https://www.autotrader.ca',
    ...devices['iPhone 13']    
  },
  // Project-specific settings
  timeout: 180000,
  expect: {
    timeout: 60000,
  },
  // Use the same testDir as main config - relative to project root
  // testDir is inherited from main config
});














