import { readFileSync, writeFileSync, existsSync } from 'fs';
import { mergeResults } from './mergeResults';
import { PlaywrightResults } from './types';

const desktopPath = process.argv[2];
const mobilePath = process.argv[3];
const outputPath = process.argv[4];

if (!desktopPath || !mobilePath || !outputPath) {
  console.error('Usage: mergeResults <desktop.json> <mobile.json> <out.json>');
  process.exit(1);
}

try {
  // Read and parse JSON files with fallback for missing files
  let desktop: PlaywrightResults = { suites: [], stats: { expected: 0, failed: 0 } };
  let mobile: PlaywrightResults = { suites: [], stats: { expected: 0, failed: 0 } };

  if (existsSync(desktopPath)) {
    desktop = JSON.parse(readFileSync(desktopPath, 'utf8'));
    console.log('✅ Desktop results loaded');
  } else {
    console.log('⚠️ Desktop results not found, using empty fallback');
  }

  if (existsSync(mobilePath)) {
    mobile = JSON.parse(readFileSync(mobilePath, 'utf8'));
    console.log('✅ Mobile results loaded');
  } else {
    console.log('⚠️ Mobile results not found, using empty fallback');
  }

  const merged = mergeResults(desktop, mobile);
  writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log('✅ Results merged successfully to', outputPath);
} catch (error) {
  console.error('❌ Error merging results:', error);
  process.exit(1);
}
