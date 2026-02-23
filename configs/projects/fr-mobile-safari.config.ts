import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  name: 'fr-mobile-safari',
  use: {
    baseURL: 'https://www.autohebdo.net',
    ...devices['iPhone 13'],
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    // Custom project context
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
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