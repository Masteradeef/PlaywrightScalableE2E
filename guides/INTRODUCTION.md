# 🎭 Scheduled Playwright Tests

## 🕒 Automated Test Schedule

Tests run **8 times daily** at these EST times:

| EST Time | UTC Time | 
|----------|----------|
| 12:00 AM | 5:00 AM  |
| 3:00 AM  | 8:00 AM  |
| 6:00 AM  | 11:00 AM |
| 9:00 AM  | 2:00 PM  |
| 12:00 PM | 5:00 PM  |
| 3:00 PM  | 8:00 PM  |
| 6:00 PM  | 11:00 PM |
| 9:00 PM  | 2:00 AM (+1)|

## 🎯 Test Coverage

- **EN-Desktop-Chrome** - English AutoTrader Desktop
- **EN-iPhone-Safari** - English AutoTrader Mobile

## ⚙️ Setup Required

Add these GitHub Secrets:

```
BASE_URL_EN=https://www.autotrader.ca
TEST_USERNAME=your-test-username
TEST_PASSWORD=your-test-password
```

## 📊 Features

- ✅ **Enhanced HTML Reports** with video recordings
- ✅ **Parallel Execution** across all projects
- ✅ **Video Recording** for failed tests
- ✅ **Screenshot Modals** for detailed analysis
- ✅ **30-day Artifact Retention**
- ✅ **Manual Trigger Option** via GitHub Actions UI

## 🚀 Activation

1. Push this file to your repository
2. Add GitHub Secrets (Settings → Secrets and variables → Actions)  
3. Tests will start running automatically at scheduled times
4. Monitor results in GitHub Actions tab
5. Download reports from Artifacts section

## 🔀 Skipping tests per project

Some specs only apply to a particular project (Desktop vs. Mobile). Use `test.beforeAll` or `testInfo` to skip them explicitly so the HTML report records the skip.

### Skip an entire suite
```ts
test.describe('Desktop only', () => {
  test.beforeAll(({}, workerInfo) => {
    if (!workerInfo.project.name.includes('Desktop')) {
      test.info().annotations.push({ type: 'explicit-skip' });
      test.skip(true, 'Desktop-only suite');
    }
  });

  test('desktop scenario', async () => {
    // ...
  });
});
```

### Skip a single test
```ts
test('Mobile-only test', async ({}, testInfo) => {
  if (!testInfo.project.name?.includes('iPhone')) {
    testInfo.annotations.push({ type: 'explicit-skip' });
    test.skip(true, 'Mobile-only test');
  }
  // mobile assertions...
});
```

The `explicit-skip` annotation ensures the custom HTML reporter keeps the skipped test visible under the correct project instead of filtering it out.















