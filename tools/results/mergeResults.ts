import { PlaywrightResults, PlaywrightStats } from './types';

function mergeStats(a: PlaywrightStats = {}, b: PlaywrightStats = {}): PlaywrightStats {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const merged: PlaywrightStats = {};

  for (const key of keys) {
    merged[key as keyof PlaywrightStats] =
      (a[key as keyof PlaywrightStats] ?? 0) +
      (b[key as keyof PlaywrightStats] ?? 0);
  }

  return merged;
}

export function mergeResults(
  desktop: PlaywrightResults,
  mobile: PlaywrightResults
): PlaywrightResults {
  return {
    generatedAt: new Date().toISOString(),
    sources: ['desktop', 'mobile'],
    suites: [
      ...(desktop.suites ?? []),
      ...(mobile.suites ?? []),
    ],
    stats: mergeStats(desktop.stats, mobile.stats),
  };
}
