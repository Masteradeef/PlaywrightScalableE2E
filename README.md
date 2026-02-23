# Modern Playwright Architecture
This test automation repository contains a scalable Playwright framework in Typescript. End-to-end tests contains cross browsers, platforms, and multi-language applications tests. Integrated with Github Actions CI to run workflows to execute tests on PR merge and run scheduled executions. This project has integrated Playwright MCP (Model Context Protocol) with GitHub Copilot to generate, debug, execute, and self-heal automated tests from prompts and GitHub issues. Generated Playwright test scripts from Jira test scenarios and created bugs using Atlassian Jira MCP along with sending test metrics to Datadog to display test information on Datadog dashboard. Also integrated Slackbot with Github Actions workflows for instant status updates via Slack communication. Project has integrated AWS Secrets Manager for secure API key and credential management in local and CI environments also contains tests for automated email verification with email client API's. Includes custom HTML reporters with test report displayed as artifacts in Github Actions workflow execution.

## 🛠 Automation tech stack
**Language/Tools:** Typescript, Playwright, JUnit

**CI/CD:** Github Actions

**Email Automation:** Email Client API automation (Mailinator, Mailtrap)

**Slackbot Integration:** Slackbot integration to Github Actions with playwright-slack-report

**AWS Secrets Manager Integration:** AWS Secres Manager integration with @aws-sdk/client-ssm and @aws-sdk/credential-providers

**Execution Platform:** local, Github Actions

**Viewports:** Desktop, Mobile web
