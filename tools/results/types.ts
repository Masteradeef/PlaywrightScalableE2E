export interface PlaywrightStats {
  expected?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  flaky?: number;
}

export interface PlaywrightResults {
  suites?: unknown[];
  stats?: PlaywrightStats;
  generatedAt?: string;
  sources?: string[];
}
