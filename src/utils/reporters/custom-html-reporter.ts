import type { FullConfig } from '@playwright/test';
import type { FullResult, Reporter, Suite, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Helper function to strip ANSI escape codes
function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

interface TestResultWithSteps extends TestResult {
  steps: TestStep[];
}

interface EnhancedTestResult {
  name: string;
  status: string;
  duration: number;
  group: string;
  testFile: string;
  testSuite: string;
  browser: string;
  error?: string;
  steps?: TestStep[];
  assertions?: number;
  screenshots?: string[];
  video?: string;
  visualTestFailure?: {
    expected: string;
    actual: string;
    diff: string;
    testName: string;
  };
}

type ReporterAttachment = TestResult['attachments'][number];

class CustomHTMLReporter implements Reporter {
  private testResults = new Map<string, EnhancedTestResult>();
  private reportPath: string;
  private outputFile: string;
  private totalTests = 0;
  private config: any;
  private assetCache = new Map<string, string>();

  constructor(options: { outputFile?: string; outputDir?: string } = {}) {
    this.outputFile = options.outputFile || 'enhanced-report.html';
    this.reportPath = options.outputDir || path.join(process.cwd(), 'test-results');
  }

  async onBegin(config: FullConfig) {
    this.config = config;
    // Ensure output directory exists
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }
  }

  async onTestEnd(test: TestCase, result: TestResultWithSteps) {
    this.totalTests++;
    console.log(`Processing test ${this.totalTests}: ${test.title} - Status: ${result.status}`);
    
    const testPath = test.title.split(' › ');
    const testFile = test.location?.file ? path.basename(test.location.file, '.spec.ts') : 'Unknown';
    const browser = test.parent?.project()?.name || 'unknown';
    
    // Extract describe block from test parent suite
    let describeBlock = '';
    let actualTestName = test.title;
    
    // Check if test has a parent suite (describe block)
    if (test.parent && test.parent.title !== test.location?.file) {
      describeBlock = test.parent.title;
      actualTestName = test.title;
    } else if (testPath.length > 1) {
      describeBlock = testPath[0];
      actualTestName = testPath.slice(1).join(' › ');
    }
    
    // Extract test suite information from file name
    let testSuite = 'Other';
    
    // Use the actual test file name as the suite name with proper formatting
    if (testFile) {
      // Convert camelCase and kebab-case to readable format
      testSuite = testFile
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
        .trim();
      
      // Handle special cases
      if (testFile.toLowerCase().includes('demo')) {
        testSuite = 'Demo Tests';
      } else if (testFile.toLowerCase().includes('health')) {
        testSuite = 'Health Check';
      } else if (testFile.toLowerCase().includes('nightly')) {
        testSuite = 'Nightly Tests';
      }
    }

    // Determine group based on test file location/name
    const mainTestGroup = this.determineTestGroup(testFile, test.location?.file);
    const assertions = this.countAssertions(result.steps || []);
    
    // Extract screenshots and video from attachments
    const screenshots: string[] = [];
    let video: string | undefined;
    let visualTestFailure: any = undefined;
    
    if (result.attachments) {
      for (const attachment of result.attachments) {
        if (attachment.name === 'screenshot' || attachment.contentType?.includes('image/')) {
          const storedScreenshot = this.storeAttachmentAsset(attachment, 'screenshots', '.png');
          if (storedScreenshot) {
            screenshots.push(storedScreenshot);
          }
        } else if (attachment.name === 'video' || attachment.contentType?.startsWith('video/')) {
          const storedVideo = this.storeAttachmentAsset(attachment, 'videos', '.webm');
          if (storedVideo) {
            video = storedVideo;
            console.log(`Found video attachment for ${test.title}: ${storedVideo}`);
          }
        }
      }
    }

    // For failed tests, also try to find video in test results directory
    if (result.status === 'failed' && !video) {
      const testFileName = test.location?.file ? path.basename(test.location.file, '.spec.ts') : 'unknown';
      const browser = test.parent?.project()?.name || 'chromium';
      const videoFileName = `${testFileName}-${test.title.replace(/[^a-zA-Z0-9]/g, '-')}-${browser}`;
      
      // Common video file extensions and paths
      const possibleVideoPaths = [
        path.join(this.reportPath, `${videoFileName}.webm`),
        path.join(this.reportPath, 'videos', `${videoFileName}.webm`),
        path.join(this.reportPath, `video.webm`),
        path.join(process.cwd(), 'test-results', `${videoFileName}.webm`),
        path.join(process.cwd(), 'test-results', 'videos', `${videoFileName}.webm`)
      ];
      
      for (const videoPath of possibleVideoPaths) {
        if (fs.existsSync(videoPath)) {
          const storedVideo = this.persistAssetToReport(videoPath, 'videos');
          if (storedVideo) {
            video = storedVideo;
            console.log(`Found video file for failed test ${test.title}: ${videoPath}`);
            break;
          }
        }
      }
    }

    // Check for visual test failures and find comparison images
    if (result.status === 'failed' && result.error?.message?.includes('Screenshot comparison failed')) {
      visualTestFailure = this.findVisualComparisonImages(test, result);
    }

    const normalizedStatus = result.status === 'timedOut' ? 'failed' : result.status;

    // Skip tests that were skipped on their final attempt (e.g., platform-specific tests)
    const hasExplicitSkip =
      test.annotations?.some(annotation => annotation.type === 'explicit-skip') ?? false;

    if (result.status === 'skipped' && !hasExplicitSkip) {
      return;
    }

    const testResult: EnhancedTestResult = {
      name: describeBlock ? `${describeBlock} >> ${actualTestName}` : test.title,
      status: normalizedStatus,
      duration: result.duration,
      group: mainTestGroup,
      testFile,
      testSuite,
      browser,
      error: result.error?.message ? stripAnsiCodes(result.error.message) : undefined,
      steps: result.steps,
      assertions,
      screenshots,
      video,
      visualTestFailure
    };

    // Note: Test counting already done at the beginning of this method

    const testKey = this.buildTestKey(test, browser);
    this.testResults.set(testKey, testResult);
  }

  private determineTestGroup(testFile: string, filePath?: string): string {
    if (!filePath) return testFile;
    if (filePath.includes('/accessibility/')) return 'Accessibility Tests';
    if (filePath.includes('/brand-pages/')) return 'Brand Pages Tests';
    if (filePath.includes('/content-pages/')) return 'Content Pages Tests';
    if (filePath.includes('/filters/')) return 'Filter Tests';
    if (filePath.includes('/interactions/')) return 'Interaction Tests';
    if (filePath.includes('/leasing-types/')) return 'Leasing Type Tests';
    if (filePath.includes('/responsive/')) return 'Responsive Tests';
    if (filePath.includes('/vehicle-types/')) return 'Vehicle Type Tests';
    if (filePath.includes('/critical-flows/')) return 'Critical Flow Tests';
    if (filePath.includes('/core-pages/')) return 'Core Pages Tests';
    if (filePath.includes('/smoke-tests/')) return 'Smoke Tests';
    return testFile;
  }

  private buildTestKey(test: TestCase, browser: string): string {
    return `${test.id}-${browser}`;
  }

  private persistAssetToReport(originalPath: string, category: string): string | undefined {
    if (!originalPath) return undefined;
    const absolutePath = path.resolve(originalPath);
    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️ Asset not found: ${absolutePath}`);
      return undefined;
    }
    const cacheKey = `file:${absolutePath}`;
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey);
    }
    const ext = path.extname(absolutePath);
    const baseName = path.basename(absolutePath, ext);
    const hash = crypto.createHash('md5').update(absolutePath).digest('hex').slice(0, 8);
    const assetsDir = path.join(this.reportPath, 'assets', category);
    fs.mkdirSync(assetsDir, { recursive: true });
    const destinationFile = `${baseName}-${hash}${ext}`;
    const destinationPath = path.join(assetsDir, destinationFile);
    if (!fs.existsSync(destinationPath)) {
      fs.copyFileSync(absolutePath, destinationPath);
    }
    const relativePath = path.relative(this.reportPath, destinationPath).split(path.sep).join('/');
    this.assetCache.set(cacheKey, relativePath);
    return relativePath;
  }

  private persistInlineAsset(data: Buffer, category: string, extension: string, hint: string): string {
    const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;
    const safeHint = this.sanitizeFileNameSegment(hint);
    const hash = crypto.createHash('md5').update(data).digest('hex').slice(0, 8);
    const cacheKey = `inline:${safeHint}:${hash}:${category}:${normalizedExt}`;
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!;
    }
    const assetsDir = path.join(this.reportPath, 'assets', category);
    fs.mkdirSync(assetsDir, { recursive: true });
    const destinationFile = `${safeHint}-${hash}${normalizedExt}`;
    const destinationPath = path.join(assetsDir, destinationFile);
    if (!fs.existsSync(destinationPath)) {
      fs.writeFileSync(destinationPath, data);
    }
    const relativePath = path.relative(this.reportPath, destinationPath).split(path.sep).join('/');
    this.assetCache.set(cacheKey, relativePath);
    return relativePath;
  }

  private getAttachmentExtension(attachment: ReporterAttachment, fallbackExt: string): string {
    const normalizedFallback = fallbackExt.startsWith('.') ? fallbackExt : `.${fallbackExt}`;
    if (attachment.path) {
      const ext = path.extname(attachment.path);
      if (ext) return ext;
    }
    const type = attachment.contentType?.toLowerCase() || '';
    if (type.includes('png')) return '.png';
    if (type.includes('jpeg') || type.includes('jpg')) return '.jpg';
    if (type.includes('webm')) return '.webm';
    if (type.includes('mp4')) return '.mp4';
    const name = attachment.name?.toLowerCase() || '';
    if (name.includes('screenshot')) return '.png';
    if (name.includes('video')) return '.webm';
    return normalizedFallback;
  }

  private sanitizeFileNameSegment(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-') || 'asset';
  }

  private storeAttachmentAsset(attachment: ReporterAttachment, category: string, fallbackExt: string): string | undefined {
    if (attachment.path) {
      return this.persistAssetToReport(attachment.path, category);
    }
    if (attachment.body) {
      const buffer = Buffer.isBuffer(attachment.body) ? attachment.body : Buffer.from(attachment.body);
      const ext = this.getAttachmentExtension(attachment, fallbackExt);
      const hint = attachment.name || category;
      return this.persistInlineAsset(buffer, category, ext, hint);
    }
    return undefined;
  }

  public countAssertions(steps: TestStep[]): number {
    let count = 0;
    for (const step of steps) {
      if (step.category === 'expect') count++;
      if (step.steps) count += this.countAssertions(step.steps);
    }
    return count;
  }

  private findVisualComparisonImages(test: TestCase, result: TestResult): any {
    const testDir = path.dirname(test.location?.file || '');
    const testFileName = path.basename(test.location?.file || '', '.spec.ts');
    const browser = test.parent?.project()?.name || 'chromium';
    // Extract screenshot name from error message or test title
    const errorMessage = result.error?.message || '';
    let screenshotName = '';
    // Try to extract screenshot name from error message
    const screenshotMatch = errorMessage.match(/"([^"]+\.png)"/); 
    if (screenshotMatch) {
      screenshotName = screenshotMatch[1];
    } else {
      // Fallback: generate from test name
      const cleanTestName = test.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      screenshotName = `${cleanTestName}.png`;
    }
    // Construct paths
    const snapshotsDir = path.join(testDir, `${testFileName}.spec.ts-snapshots`);
    const expectedPath = path.join(snapshotsDir, `${screenshotName.replace('.png', '')}-${browser}-darwin.png`);
    const testResultsDir = this.reportPath;
    const actualPath = path.join(testResultsDir, `${testFileName}-${screenshotName.replace('.png', '')}-actual.png`);
    const diffPath = path.join(testResultsDir, `${testFileName}-${screenshotName.replace('.png', '')}-diff.png`);
    // Check if files exist
    const expectedExists = fs.existsSync(expectedPath);
    const actualExists = fs.existsSync(actualPath);
    const diffExists = fs.existsSync(diffPath);
    if (expectedExists || actualExists || diffExists) {
      const expectedAsset = expectedExists ? this.persistAssetToReport(expectedPath, 'visual-comparisons') : '';
      const actualAsset = actualExists ? this.persistAssetToReport(actualPath, 'visual-comparisons') : '';
      const diffAsset = diffExists ? this.persistAssetToReport(diffPath, 'visual-comparisons') : '';
      if (expectedAsset || actualAsset || diffAsset) {
        return {
          expected: expectedAsset || '',
          actual: actualAsset || '',
          diff: diffAsset || '',
          testName: screenshotName
        };
      }
    }
    return undefined;
  }

  private generateTestGroupHTML(group: string, tests: EnhancedTestResult[]): string {
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const totalDuration = tests.reduce((acc, curr) => acc + curr.duration, 0);

    // Group tests by test file and browser
    const fileGroups = new Map<string, EnhancedTestResult[]>();
    tests.forEach(test => {
      const fileKey = `${test.testFile} (${test.browser})`;
      if (!fileGroups.has(fileKey)) {
        fileGroups.set(fileKey, []);
      }
      fileGroups.get(fileKey)?.push(test);
    });

    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4 bg-gray-800 p-6 rounded-lg cursor-pointer group-header" onclick="toggleGroup('${group.replace(/'/g, "\\'")}')">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">${group}</h2>
            <div class="flex space-x-6 text-gray-400">
              <p>Duration: ${(totalDuration / 1000).toFixed(2)}s</p>
              <p>Tests: ${tests.length}</p>
              <p>Files: ${fileGroups.size}</p>
            </div>
          </div>
          <div class="flex items-center space-x-8">
            <div class="flex flex-col items-end">
              <span class="text-lg text-green-400 font-semibold">${passedTests} passed</span>
              <span class="text-lg text-red-400 font-semibold">${failedTests} failed</span>
            </div>
            <span class="transform transition-transform duration-200 text-2xl" id="arrow-${group.replace(/[^a-zA-Z0-9]/g, '-')}">▼</span>
          </div>
        </div>
        <div class="space-y-4 group-content" id="group-${group.replace(/[^a-zA-Z0-9]/g, '-')}">
          ${Array.from(fileGroups.entries()).map(([fileKey, fileTests]) => `
            <div class="bg-gray-900 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4 cursor-pointer" onclick="toggleFileGroup('${fileKey.replace(/[^a-zA-Z0-9]/g, '-')}")">
                <h3 class="text-xl font-semibold text-white">${fileKey}</h3>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-green-400">${fileTests.filter(t => t.status === 'passed').length} passed</span>
                  <span class="text-sm text-red-400">${fileTests.filter(t => t.status === 'failed').length} failed</span>
                  <span class="transform transition-transform duration-200 text-lg" id="file-arrow-${fileKey.replace(/[^a-zA-Z0-9]/g, '-')}">▼</span>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-3 file-content" id="file-${fileKey.replace(/[^a-zA-Z0-9]/g, '-')}">
                ${fileTests.map(test => `
                  <div class="test-card bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="test-name text-md font-semibold text-white">
                        ${test.name}
                      </h4>
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 rounded text-xs font-medium ${
                          test.status === 'passed' ? 'bg-green-600 text-white' : 
                          test.status === 'failed' ? 'bg-red-600 text-white' : 
                          'bg-yellow-600 text-white'
                        }">${test.status}</span>
                        <span class="text-xs text-gray-400">${(test.duration / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                    
                    <div class="text-gray-300 space-y-2 text-sm">
                      <div class="flex space-x-4 text-xs text-gray-400">
                        <span>Browser: ${test.browser}</span>
                        <span>Assertions: ${test.assertions}</span>
                      </div>
                      
                      ${test.error ? `
                        <div class="mt-3 p-3 bg-red-900/50 rounded-lg">
                          <div class="flex items-start space-x-2 mb-2">
                            <span class="text-red-400 text-sm">❌</span>
                            <p class="text-red-400 font-semibold text-sm">Test Failed</p>
                            ${test.video ? `<span class="text-red-300 text-xs">(📹 Recording available below)</span>` : ''}
                          </div>
                          <p class="text-red-400 font-mono text-xs break-words">${stripAnsiCodes(test.error)}</p>
                        </div>
                      ` : ''}
                      
                      ${test.visualTestFailure ? `
                        <div class="mt-4 p-4 bg-blue-900/30 rounded-lg">
                          <p class="text-blue-400 font-semibold text-sm mb-3">📸 Visual Comparison Failure</p>
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${test.visualTestFailure.expected ? `
                              <div class="text-center">
                                <p class="text-green-400 text-xs font-semibold mb-2">✅ Expected (Baseline)</p>
                                <img src="${test.visualTestFailure.expected}" 
                                     alt="Expected screenshot" 
                                     class="w-full rounded border border-green-500 cursor-pointer hover:scale-105 transition-transform modal-trigger" />
                              </div>
                            ` : ''}
                            ${test.visualTestFailure.actual ? `
                              <div class="text-center">
                                <p class="text-red-400 text-xs font-semibold mb-2">❌ Actual (Current)</p>
                                <img src="${test.visualTestFailure.actual}" 
                                     alt="Actual screenshot" 
                                     class="w-full rounded border border-red-500 cursor-pointer hover:scale-105 transition-transform modal-trigger" />
                              </div>
                            ` : ''}
                            ${test.visualTestFailure.diff ? `
                              <div class="text-center">
                                <p class="text-yellow-400 text-xs font-semibold mb-2">🔍 Difference</p>
                                <img src="${test.visualTestFailure.diff}" 
                                     alt="Diff screenshot" 
                                     class="w-full rounded border border-yellow-500 cursor-pointer hover:scale-105 transition-transform modal-trigger" />
                              </div>
                            ` : ''}
                          </div>
                          <div class="mt-3 text-center">
                            <p class="text-gray-400 text-xs">💡 Click any image to view full size</p>
                          </div>
                        </div>
                      ` : ''}
                      
                      ${test.screenshots && test.screenshots.length > 0 ? `
                        <div class="mt-3">
                          <p class="text-gray-400 font-semibold text-xs mb-2">Screenshots:</p>
                          <div class="flex flex-wrap gap-2">
                            ${test.screenshots.map((screenshot, index) => `
                              <div class="relative group" onclick="openModal('${screenshot}'); return false;">
                                <img src="${screenshot}" 
                                     alt="Screenshot ${index + 1}" 
                                     class="w-20 h-20 object-cover rounded cursor-pointer hover:scale-110 transition-transform modal-trigger"
                                     data-src="${screenshot}" 
                                     onclick="openModal('${screenshot}'); return false;" />
                                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity pointer-events-none">
                                  <span class="text-white text-xs">Click to expand</span>
                                </div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                      
                      ${test.video ? `
                        <div class="mt-4 p-4 ${test.status === 'failed' ? 'bg-red-900/30' : 'bg-gray-700/30'} rounded-lg">
                          <p class="${test.status === 'failed' ? 'text-red-400' : 'text-gray-400'} font-semibold text-sm mb-3">
                            🎬 ${test.status === 'failed' ? 'Test Failure Recording' : 'Test Recording'}
                          </p>
                          <video controls class="w-full max-w-2xl rounded shadow-lg" preload="metadata">
                            <source src="${test.video}" type="video/webm">
                            <source src="${test.video}" type="video/mp4">
                            Your browser does not support the video tag.
                          </video>
                          ${test.status === 'failed' ? `
                            <div class="mt-2 text-center">
                              <p class="text-red-300 text-xs">🔍 This recording shows the test execution that led to the failure</p>
                            </div>
                          ` : ''}
                        </div>
                      ` : ''}
                      
                      ${test.steps?.length ? `
                        <details class="mt-3">
                          <summary class="text-gray-400 font-semibold text-xs cursor-pointer hover:text-white">
                            Test Steps (${test.steps.length})
                          </summary>
                          <ul class="space-y-1 text-xs text-gray-400 mt-2 ml-4">
                            ${test.steps.map(step => `
                              <li class="flex items-start">
                                <span class="w-3 h-3 mr-2 mt-1 ${
                                  step.error ? 'text-red-400' : 'text-green-400'
                                }">•</span>
                                <span class="${step.error ? 'text-red-400' : ''}">${stripAnsiCodes(step.title)}</span>
                              </li>
                            `).join('')}
                          </ul>
                        </details>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

      private getToggleGroupScript(): string {
      // Return as a string literal so TypeScript does not parse the embedded JS
      return [
        'function toggleGroup(groupName) {',
        '  const sanitizedGroupName = groupName.replace(/[^a-zA-Z0-9]/g, "-");',
        '  const groupContent = document.getElementById(`group-${sanitizedGroupName}`);',
        '  const arrow = document.getElementById(`arrow-${sanitizedGroupName}`);',
        '  if (groupContent.style.display === "none") {',
        '    groupContent.style.display = "block";',
        '    arrow.textContent = "▼";',
        '    arrow.classList.remove("rotate-180");',
        '  } else {',
        '    groupContent.style.display = "none";',
        '    arrow.textContent = "►";',
        '    arrow.classList.add("rotate-180");',
        '  }',
        '}',
        'function toggleFileGroup(fileKey) {',
        '  const sanitizedFileKey = fileKey.replace(/[^a-zA-Z0-9]/g, "-");',
        '  const fileContent = document.getElementById(`file-${sanitizedFileKey}`);',
        '  const arrow = document.getElementById(`file-arrow-${sanitizedFileKey}`);',
        '  if (fileContent.style.display === "none") {',
        '    fileContent.style.display = "block";',
        '    arrow.textContent = "▼";',
        '    arrow.classList.remove("rotate-180");',
        '  } else {',
        '    fileContent.style.display = "none";',
        '    arrow.textContent = "►";',
        '    arrow.classList.add("rotate-180");',
        '  }',
        '}',
        '// Modal functionality for screenshot expansion',
        'function openModal(imageSrc) {',
        '  const modal = document.getElementById("screenshot-modal");',
        '  const modalImg = document.getElementById("modal-image");',
        '  if (!modal || !modalImg) { return false; }',
        '  modalImg.src = imageSrc;',
        '  modal.style.display = "flex";',
        '  modal.style.alignItems = "center";',
        '  modal.style.justifyContent = "center";',
        '  document.body.style.overflow = "hidden";',
        '  return false;',
        '}',
        'function closeModal() {',
        '  const modal = document.getElementById("screenshot-modal");',
        '  if (modal) {',
        '    modal.style.display = "none";',
        '    document.body.style.overflow = "auto";',
        '  }',
        '}',
        'function initModal() {',
        '  const clickableImages = document.querySelectorAll("img.modal-trigger, img.cursor-pointer");',
        '  clickableImages.forEach((img) => {',
        '    const parentContainer = img.closest(".relative.group");',
        '    [img, parentContainer].forEach(element => {',
        '      if (element) {',
        '        element.addEventListener("click", function(e) {',
        '          e.preventDefault();',
        '          e.stopPropagation();',
        '          const targetImg = element.tagName === "IMG" ? element : element.querySelector("img");',
        '          if (targetImg) {',
        '            const imageSrc = targetImg.getAttribute("data-src") || targetImg.src;',
        '            openModal(imageSrc);',
        '          }',
        '        });',
        '        element.style.cursor = "pointer";',
        '      }',
        '    });',
        '  });',
        '  const modal = document.getElementById("screenshot-modal");',
        '  if (modal) {',
        '    modal.addEventListener("click", function(e) {',
        '      if (e.target === this) { closeModal(); }',
        '    });',
        '  }',
        '  const closeButton = document.querySelector(".close");',
        '  if (closeButton) {',
        '    closeButton.addEventListener("click", function(e) {',
        '      e.preventDefault();',
        '      e.stopPropagation();',
        '      closeModal();',
        '    });',
        '  }',
        '  document.addEventListener("keydown", function(e) {',
        '    if (e.key === "Escape") { closeModal(); }',
        '  });',
        '}',
        'if (document.readyState === "loading") {',
        '  document.addEventListener("DOMContentLoaded", initModal);',
        '} else {',
        '  initModal();',
        '}',
      ].join('\n');
      }

  async onEnd(result?: FullResult) {
    const tests = Array.from(this.testResults.values());
    const stats = this.computeStats(tests, result);
    this.generateReport(stats, tests);
  }

  private computeStats(tests: EnhancedTestResult[], runResult?: FullResult) {
    return {
      total: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
      skipped: tests.filter(t => t.status === 'skipped').length,
      duration: runResult?.duration ?? tests.reduce((acc, curr) => acc + curr.duration, 0)
    };
  }

  private buildTestGroups(tests: EnhancedTestResult[]): Map<string, EnhancedTestResult[]> {
    const groups = new Map<string, EnhancedTestResult[]>();
    for (const test of tests) {
      const groupKey = `${test.testSuite} - ${test.group}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(test);
    }
    return groups;
  }

        generateReport(stats: any, tests: EnhancedTestResult[]) {
        // Calculate test coverage percentage
        const coveragePercentage = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
        const totalPlannedTests = parseInt(process.env.DD_TOTAL_PLANNED_TESTS || '1000', 10);
        const plannedCoveragePercentage = (stats.total / totalPlannedTests) * 100;
        const uniqueSuites = [...new Set(tests.map(t => t.testSuite))].sort();
        const uniqueBrowsers = [...new Set(tests.map(t => t.browser))].sort();
        const groupedTests = this.buildTestGroups(tests);
        // Build filter dropdowns as HTML strings
        const suiteOptions = uniqueSuites.map(suite => `<option value="${suite}">${suite}</option>`).join('');
        const browserOptions = uniqueBrowsers.map(browser => `<option value="${browser}">${browser}</option>`).join('');
        // Build test groups HTML
        const testGroupsHtml = Array.from(groupedTests.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([group, tests]) => this.generateTestGroupHTML(group, tests))
          .join('');
        // The embedded JS for the filter functionality as a string
        const filterScript = [
          '<script>',
          this.getToggleGroupScript(),
          'function filterTests() {',
          '  const searchTerm = document.getElementById(\'search-input\').value.toLowerCase();',
          '  const statusFilter = document.getElementById(\'status-filter\').value;',
          '  const suiteFilter = document.getElementById(\'suite-filter\').value;',
          '  const browserFilter = document.getElementById(\'browser-filter\').value;',
          '  const testCards = document.querySelectorAll(\'.test-card\');',
          '  let visibleCount = 0;',
          '  testCards.forEach(function(card) {',
          '    const testName = card.querySelector(\'.test-name\').textContent.toLowerCase();',
          '    const statusBadge = card.querySelector(\'.px-2.py-1.rounded\').textContent.toLowerCase();',
          '    const fileGroupHeader = card.closest(\'.bg-gray-900\').querySelector(\'h3\').textContent;',
          '    const browser = (fileGroupHeader.match(/\\(([^)]+)\\)/) || [])[1] ? fileGroupHeader.match(/\\(([^)]+)\\)/)[1].toLowerCase() : \'\';',
          '    const outerGroup = card.closest(\'#test-results .mb-8\');',
          '    const suite = outerGroup && outerGroup.querySelector(\'h2\') ? outerGroup.querySelector(\'h2\').textContent.toLowerCase() : \'\';',
          '    const matchesSearch = testName.includes(searchTerm);',
          '    const matchesStatus = statusFilter === "all" || statusBadge === statusFilter;',
          '    const matchesSuite = suiteFilter === "all" || suite.includes(suiteFilter.toLowerCase());',
          '    const matchesBrowser = browserFilter === "all" || browser === browserFilter.toLowerCase();',
          '    if (matchesSearch && matchesStatus && matchesSuite && matchesBrowser) {',
          '      card.style.display = "block";',
          '      visibleCount++;',
          '    } else {',
          '      card.style.display = "none";',
          '    }',
          '  });',
          '  document.querySelectorAll(\'#test-results .bg-gray-900\').forEach(function(fileGroup) {',
          '    const visibleTests = fileGroup.querySelectorAll(\'.test-card[style=\\\'display: block;\\\']\');',
          '    if (visibleTests.length > 0) {',
          '      fileGroup.style.display = "block";',
          '    } else {',
          '      fileGroup.style.display = "none";',
          '    }',
          '  });',
          '  document.querySelectorAll(\'#test-results > .mb-8\').forEach(function(outerGroup) {',
          '    const visibleFileGroups = outerGroup.querySelectorAll(\'.bg-gray-900[style=\\\'display: block;\\\']\');',
          '    if (visibleFileGroups.length > 0) {',
          '      outerGroup.style.display = "block";',
          '    } else {',
          '      outerGroup.style.display = "none";',
          '    }',
          '  });',
          '  console.log(\'Filter applied: \' + visibleCount + \' tests visible\');',
          '}',
          '</script>'
        ].join('\n');
        // Compose the HTML content
        const htmlContent = [
          '<!DOCTYPE html>',
          '<html lang="en">',
          '<head>',
          '    <meta charset="UTF-8">',
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
          '    <title>One-Marketplace Regression Test Suite Results</title>',
          '    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">',
          '    <style>',
          '        body { background-color: #111827; }',
          '        .test-card { transition: all 0.2s ease-in-out; }',
          '        .test-card:hover { transform: translateY(-2px); }',
          '        .stats-card { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); }',
          '        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #4B5563 #1F2937; }',
          '        .custom-scrollbar::-webkit-scrollbar { width: 8px; }',
          '        .custom-scrollbar::-webkit-scrollbar-track { background: #1F2937; }',
          '        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 4px; }',
          '        .modal { display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); align-items: center; justify-content: center; }',
          '        .modal-content { max-width: 95%; max-height: 95%; object-fit: contain; border-radius: 8px; }',
          '        .close { position: absolute; top: 15px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer; }',
          '        .close:hover { color: #bbb; }',
          '    </style>',
          '</head>',
          '<body class="min-h-screen text-gray-100 custom-scrollbar">',
          '    <div class="container mx-auto px-4 py-8">',
          '        <header class="text-center mb-8">',
          '            <h1 class="text-4xl font-bold text-white mb-2">One-Marketplace Regression Test Suite Results</h1>',
          `            <p class="text-gray-400">P1 & P2 Test Suites - Generated on ${new Date().toLocaleString()}</p>`,
          '        </header>',
          '        <!-- Filter Controls -->',
          '        <div class="bg-gray-800 rounded-lg p-6 mb-8">',
          '            <h3 class="text-xl font-semibold text-white mb-4">Filter & Search</h3>',
          '            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">',
          '                <div>',
          '                    <label class="block text-sm font-medium text-gray-300 mb-2">Search Tests</label>',
          '                    <input type="text" id="search-input" placeholder="Search by test name..." class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500" oninput="filterTests()">',
          '                </div>',
          '                <div>',
          '                    <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>',
          '                    <select id="status-filter" class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600" onchange="filterTests()">',
          '                        <option value="all">All Status</option>',
          '                        <option value="passed">Passed</option>',
          '                        <option value="failed">Failed</option>',
          '                        <option value="skipped">Skipped</option>',
          '                    </select>',
          '                </div>',
          '                <div>',
          '                    <label class="block text-sm font-medium text-gray-300 mb-2">Test Suite</label>',
          `                    <select id="suite-filter" class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600" onchange="filterTests()">`,
          '                        <option value="all">All Suites</option>',
          `                        ${suiteOptions}`,
          '                    </select>',
          '                </div>',
          '                <div>',
          '                    <label class="block text-sm font-medium text-gray-300 mb-2">Browser</label>',
          `                    <select id="browser-filter" class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600" onchange="filterTests()">`,
          '                        <option value="all">All Browsers</option>',
          `                        ${browserOptions}`,
          '                    </select>',
          '                </div>',
          '            </div>',
          '        </div>',
          '        <!-- Statistics Dashboard -->',
          '        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">',
          '            <div class="stats-card rounded-lg p-4">',
          '                <h3 class="text-lg font-semibold mb-2">Total</h3>',
          `                <p class="text-3xl font-bold">${stats.total}</p>`,
          '            </div>',
          '            <div class="stats-card rounded-lg p-4">',
          '                <h3 class="text-lg font-semibold mb-2">Passed</h3>',
          `                <p class="text-3xl font-bold text-green-400">${stats.passed}</p>`,
          '            </div>',
          '            <div class="stats-card rounded-lg p-4">',
          '                <h3 class="text-lg font-semibold mb-2">Failed</h3>',
          `                <p class="text-3xl font-bold text-red-400">${stats.failed}</p>`,
          '            </div>',
          '            <div class="stats-card rounded-lg p-4">',
          '                <h3 class="text-lg font-semibold mb-2">Skipped</h3>',
          `                <p class="text-3xl font-bold text-yellow-400">${stats.skipped}</p>`,
          '            </div>',
          '            <div class="stats-card rounded-lg p-4">',
          '                <h3 class="text-lg font-semibold mb-2">Success Rate</h3>',
          `                <p class="text-3xl font-bold text-blue-400">${coveragePercentage.toFixed(1)}%</p>`,
          '            </div>',
          '            <div class="stats-card rounded-lg p-4">',
          '                <h3 class="text-lg font-semibold mb-2">Duration</h3>',
          `                <p class="text-3xl font-bold text-purple-400">${(stats.duration / 1000 / 60).toFixed(1)}m</p>`,
          '            </div>',
          '        </div>',
          '        <!-- Test Results -->',
          '        <div class="mb-8">',
          '            <h2 class="text-2xl font-bold mb-6">Test Results by Suite & Category</h2>',
          '            <div class="space-y-6" id="test-results">',
          `                ${testGroupsHtml}`,
          '            </div>',
          '        </div>',
          '    </div>',
          '    <!-- Screenshot Modal -->',
          '    <div id="screenshot-modal" class="modal" onclick="closeModal()">',
          '        <span class="close" onclick="closeModal()">&times;</span>',
          '        <img class="modal-content" id="modal-image" onclick="event.stopPropagation()">',
          '    </div>',
          filterScript,
          '</body>',
          '</html>'
        ].join('\n');
        // Write to configured output file
        const outputPath = path.resolve(this.reportPath, path.basename(this.outputFile));
        fs.writeFileSync(outputPath, htmlContent);
        console.log(`✅ Enhanced HTML report generated at ${outputPath}`);
        console.log(`📊 Test Summary: Total: ${stats.total}, Passed: ${stats.passed}, Failed: ${stats.failed}`);
        console.log(`📈 Coverage Percentage: ${coveragePercentage.toFixed(2)}%`);
        // Also write to default location for compatibility
        const defaultPath = path.join(this.reportPath, 'index.html');
        if (outputPath !== defaultPath) {
          fs.writeFileSync(defaultPath, htmlContent);
          console.log(`📄 Backup report created at ${defaultPath}`);
        }
        }
}

export default CustomHTMLReporter;
