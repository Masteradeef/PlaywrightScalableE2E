import { defineConfig } from '@playwright/test';

export default defineConfig({
  name: 'fr-desktop-chrome',
  use: {
    baseURL: 'https://www.autohebdo.net',
    browserName: 'chromium',
    viewport: { width: 1920, height: 1080 },
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