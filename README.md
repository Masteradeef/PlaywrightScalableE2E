# Playwright Test Automation Framework

![CI](https://github.com/Masteradeef/PlaywrightScalableE2E/actions/workflows/continuousIntegrationTests.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green)
![Playwright](https://img.shields.io/badge/Playwright-Framework-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16-brightgreen)

---

## Overview

This repository provides a scalable **Playwright automation framework built with TypeScript**, designed for robust end-to-end testing across multiple browsers, platforms, and multilingual applications.

---

## 🚀 Features

### Cross-Browser & End-to-End Testing
- Supports end-to-end testing across major browsers (Chromium, Firefox, WebKit)
- Compatible with multiple platforms (local, CI, cloud)
- Designed for multilingual application validation

### CI/CD Integration
- Integrated with **GitHub Actions**
  - Automated test execution on pull request merges
  - Scheduled test runs
  - (Worksflows on event is disabled for this sample project)
- Test reports published as workflow artifacts

### AI-Driven Test Automation
- Integrated with **Playwright MCP (Model Context Protocol)** and **GitHub Copilot**
- Capabilities include:
  - Test generation from prompts
  - Automated debugging
  - Self-healing tests
  - Execution from GitHub issues

### Test Management & Observability
- Generates Playwright test scripts from **Jira test scenarios**
- Creates defects via **Atlassian Jira MCP**
- Sends test metrics to **Datadog dashboards** for visualization

### Notifications & Communication
- Slack integration via **Slackbot**
- Real-time test execution and workflow status updates

### Security & Configuration
- Uses **AWS Secrets Manager** for secure handling of:
  - API keys
  - Credentials
- Supports both local and CI environments

### Email Validation
- Automated email verification using email client APIs

### Reporting
- Custom HTML test reports
- Reports available as downloadable artifacts in GitHub Actions

---

## 🛠 Tech Stack

- **Framework:** Playwright (TypeScript)
- **CI/CD:** GitHub Actions
- **AI Integration:** Playwright MCP, GitHub Copilot
- **Test Management:** Jira (Atlassian MCP)
- **Monitoring:** Datadog
- **Secrets Management:** AWS Secrets Manager
- **Notifications:** Slack

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Running Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/example.spec.ts
```

---

## 📊 Reports

- HTML reports are generated after each run
- Accessible locally or via GitHub Actions artifacts

```bash
npx playwright show-report
```

---

## 🔐 Environment Configuration

- Secrets are managed via **AWS Secrets Manager**
- Ensure required environment variables are configured before execution

---

## 🔔 Notifications

- Slack notifications are triggered via GitHub Actions workflows
- Provides instant updates on:
  - Test execution status
  - Failures
  - Pipeline results

---

## 🌟 Highlights

- Scalable and modular framework architecture
- AI-assisted test generation and maintenance
- Full CI/CD integration
- Secure and observable test infrastructure

---

## 📄 License

This project is licensed under the MIT License.
