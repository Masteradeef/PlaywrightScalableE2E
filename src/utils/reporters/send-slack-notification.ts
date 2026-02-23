import { readFileSync, existsSync } from 'fs';

interface FailedTest {
  title: string;
  describe: string;
  project: string;
  file: string;
}

interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failedTestDetails: FailedTest[];
}

async function sendSlackNotification() {
  const workflowStatus = process.env.WORKFLOW_STATUS || 'unknown';
  const runNumber = process.env.RUN_NUMBER || '0';
  const githubUrl = process.env.GITHUB_URL || '';
  const slackToken = process.env.SLACK_BOT_TOKEN;

  if (!slackToken) {
    throw new Error('SLACK_BOT_TOKEN is required');
  }

  // Parse test results from JSON artifacts
  const testSummary = parseTestResults();

  // Determine status and message based on results availability
  const hasResults = testSummary.totalTests > 0;
  const hasFailed = testSummary.failedTests > 0;
  
  let statusEmoji: string;
  let statusText: string;
  
  if (!hasResults) {
    statusEmoji = '⚠️';
    statusText = 'CUI OM Tests Not Found';
  } else if (hasFailed) {
    statusEmoji = '❌';
    statusText = 'CUI OM Tests Failed';
  } else {
    statusEmoji = '✅';
    statusText = 'CUI OM Tests Passed';
  }

  // Create blocks array
  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${statusEmoji} ${statusText}`
      }
    }
  ];

  // Add test counts and details based on status
  if (!hasResults) {
    // No results case - just show the header
  } else if (hasFailed) {
    // Failed tests case
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*No. of Passed Tests:* ${testSummary.passedTests}\n*No. of Failed Tests:* ${testSummary.failedTests}`
      }
    });

    // Add list of failed tests with project names
    if (testSummary.failedTestDetails.length > 0) {
      const MAX_FAILED = 15;
      const failedTestsText = testSummary.failedTestDetails
        .slice(0, MAX_FAILED)
        .map(t => {
          // Extract page name from file path
          const fileName = t.file.split('/').pop() || 'Unknown';
          const pageName = fileName.replace('.spec.ts', '').replace(/([A-Z])/g, ' $1').trim();
          
          return `• ${pageName} | ${t.describe} | \`${t.title}\` — ${t.project}`;
        })
        .join('\n');

      const overflow = testSummary.failedTestDetails.length - MAX_FAILED;
      const failedBlockText =
        overflow > 0
          ? `${failedTestsText}\n… and ${overflow} more`
          : failedTestsText;

      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*❌ Failed Tests:*\n${failedBlockText}` }
      });
    }
  } else {
    // All passed case
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*No. of Passed Tests:* ${testSummary.passedTests}`
      }
    });
  }

  // Add action buttons
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "📋 View Test Run" },
        url: githubUrl
      },
      {
        type: "button",
        text: { type: "plain_text", text: "📊 HTML Report" },
        url: "https://scaling-adventure-yvwz2qw.pages.github.io/enhanced-report.html"
      },
      {
        type: "button",
        text: { type: "plain_text", text: "📈 Datadog Dashboard" },
        url: "https://app.datadoghq.eu/dashboard/66f-zxr-x7q/as24-quality-metrics-dashboard?tpl_var_team%5B0%5D=omp"
      }
    ]
  });

  // Create Slack message
  const payload = {
    text: `${statusEmoji} CUI OM Tests - Execution Complete`,
    blocks
  };

  // Send to Slack
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: 'C09SPESCM4H',
      ...payload
    })
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  console.log('✅ Slack notification sent successfully');
}

function parseTestResults(): TestSummary {
  const summary: TestSummary = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    failedTestDetails: [],
  };

  // Check for all 4 platform-specific JSON files
  const filesToTry = [
    { path: "test-results/en-desktop-chrome-results.json", label: "EN-Desktop-Chrome" },
    { path: "test-results/fr-desktop-chrome-results.json", label: "FR-Desktop-Chrome" },
    { path: "test-results/en-mobile-safari-results.json", label: "EN-iPhone-Safari" },
    { path: "test-results/fr-mobile-safari-results.json", label: "FR-iPhone-Safari" },
  ];

  for (const f of filesToTry) {
    try {
      if (!existsSync(f.path)) {
        console.warn(`⚠️ Missing JSON: ${f.path}`);
        continue;
      }
      const json = readFileSync(f.path, "utf-8");
      const data = JSON.parse(json);
      parsePlaywrightJson(data, summary, f.label);
      console.log(`✅ Parsed ${f.label} results from ${f.path}`);
    } catch (err) {
      console.warn(
        `⚠️ Could not parse ${f.label} JSON results:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  if (summary.totalTests === 0) {
    console.log('📋 No detailed results found - will show "Results Not Available" message');
  }

  return summary;
}

function parsePlaywrightJson(jsonData: any, summary: TestSummary, projectType: string) {
  if (!jsonData) return;

  // Playwright JSON usually has jsonData.suites: Suite[]
  const suites = jsonData.suites;
  if (!Array.isArray(suites)) return;

  const walkSuite = (suite: any, parentDescribe?: string) => {
    // Get the describe block title from suite title
    const currentDescribe = suite.title || parentDescribe || "Unknown describe";
    
    // specs at this suite level
    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) {
        if (!Array.isArray(spec.tests)) continue;

        for (const test of spec.tests) {
          summary.totalTests++;

          // IMPORTANT: last result = final outcome after retries
          const result =
            Array.isArray(test.results) && test.results.length > 0
              ? test.results[test.results.length - 1]
              : undefined;
          const status = result?.status;

          if (status === "passed") {
            summary.passedTests++;
          } else if (status === "failed" || status === "timedOut") {
            summary.failedTests++;
            // Try to get the actual project name from various locations in the JSON
            const actualProjectName = test.projectName || 
                                    test.projectId || 
                                    result?.projectName || 
                                    result?.projectId ||
                                    spec.projectName ||
                                    spec.projectId ||
                                    suite.projectName ||
                                    suite.projectId ||
                                    projectType;
              
            summary.failedTestDetails.push({
              title: spec.title || test.title || "Unknown test",
              describe: currentDescribe,
              project: actualProjectName,
              file: suite.file || spec.file || "Unknown file",
            });
          }
        }
      }
    }

    // nested suites
    if (Array.isArray(suite.suites)) {
      for (const child of suite.suites) walkSuite(child, currentDescribe);
    }
  };

  for (const suite of suites) walkSuite(suite);
}

// Run the function
sendSlackNotification().catch((error) => {
  console.error('❌ Failed to send Slack notification:', error);
  process.exit(1);
});