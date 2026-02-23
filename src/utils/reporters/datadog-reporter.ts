import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter'
import { SsmDdApiTokenType } from '../infrastructure/metrics/tagTypes'
import { fetchSSMTokenCached } from '../ssm/fetchSSMToken'

interface DataDogMetric {
  metric: string
  points: [number, number][]
  tags: string[]
}

interface TestStats {
  passes: number
  fails: number
  skipped: number
  total: number
}

export default class DataDogReporter implements Reporter {
  private apiKey!: string
  private testResults: Record<string, TestStats> = {}
  private runId!: string
  private teamName!: string
  private allTestTags: Set<string> = new Set()
  private statusNumber: number | undefined
  private timeStamp = Math.floor(Date.now() / 1000)
  private testTagsById: Record<string, string> = {}
  private individualTestDurations: number[] = []
  private initPromise: Promise<void>
  private datadogHost: string

  constructor() {
    this.datadogHost =
      process.env.DATADOG_API_HOST || process.env.DATADOG_SITE || 'api.datadoghq.eu'
    this.initPromise = this.initializeReporter()
  }

  private async initializeReporter(): Promise<void> {
    try {
      await this.fetchAndSetupConfiguration()
    } catch (error) {
      console.error('Failed to initialize DataDog reporter:', error)
    }
  }

  private async fetchAndSetupConfiguration(): Promise<void> {
    console.log('🔧 Initializing Datadog reporter...')
    const envApiKey =
      process.env.DD_API_KEY ||
      process.env.DATADOG_API_KEY ||
      process.env.DATADOG_API_TOKEN

    console.log('🔑 DD_API_KEY from env:', envApiKey ? 'Found' : 'Not found')

    const apiKey =
      envApiKey ||
      (await fetchSSMTokenCached(
        '/as24-home/DD_API_KEY',
        SsmDdApiTokenType.FetchDdApiToken,
      ))

    if (!apiKey) {
      console.error('❌ DD_API_KEY is missing!')
      throw new Error(
        'DD_API_KEY is required for DataDog reporter but was not provided via environment variables or SSM',
      )
    }

    this.apiKey = apiKey
    this.runId = process.env.PLAYWRIGHT_RUN_ID || `run_${Date.now()}`
    this.teamName = 'om-cui-tests'
    
    console.log(`✅ Datadog reporter initialized:`)
    console.log(`   Host: ${this.datadogHost}`)
    console.log(`   Run ID: ${this.runId}`)
    console.log(`   Team: ${this.teamName}`)
    console.log(`   🏷️  Metrics will be tagged with: team:${this.teamName}`)
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    await this.initPromise
    if (!this.apiKey) return
    const testId = this.getTestId(test)
    const tag =
      (test.tags || []).map((t) => t.match(/@(\w+)/)?.[1]).find(Boolean) ||
      'untagged'
    const testTags = [`test_tag:${tag}`]
    this.testTagsById[testId] = tag
    this.allTestTags.add(`test_tag:${tag}`)

    if (!this.testResults[testId]) {
      this.testResults[testId] = { passes: 0, fails: 0, skipped: 0, total: 0 }
    }

    this.testResults[testId].total++
    if (result.status === 'passed') {
      this.testResults[testId].passes++
    } else if (result.status === 'skipped') {
      this.testResults[testId].skipped++
    } else {
      this.testResults[testId].fails++
    }
    if (result.status !== 'skipped') {
      this.statusNumber = result.status === 'passed' ? 1 : 0
      // Store individual test duration for average calculation
      this.individualTestDurations.push(result.duration / 1000)
    }

    const metrics: DataDogMetric[] = [
      {
        metric: 'quality_metrics.test.duration',
        points: [[this.timeStamp, result.duration / 1000]],
        tags: [
          `test_name:${test.title}`,
          `status:${result.status}`,
          `file:${test.location.file}`,
          `project:${test.parent?.project?.()?.name ?? 'unknown_project'}`,
          `team:${this.teamName}`,
          ...testTags,
        ],
      },
      {
        metric: 'quality_metrics.test.status',
        points: [[this.timeStamp, this.statusNumber ?? 0]],
        tags: [
          `test_name:${test.title}`,
          `file:${test.location.file}`,
          `project:${test.parent?.project?.()?.name ?? 'unknown_project'}`,
          `status:${result.status}`,
          `run_id:${this.runId}`,
          `team:${this.teamName}`,
          ...testTags,
        ],
      },
    ]
    await this.sendToDataDog(metrics)
  }

  async onEnd(result: FullResult): Promise<void> {
    await this.initPromise
    if (!this.apiKey) return
    this.calculateAndSendFlakiness()
    let totalPassed = 0
    let totalFailed = 0
    let totalFlaky = 0
    let totalDuration = 0
    let testCount = 0
    
    Object.values(this.testResults).forEach((stats) => {
      if (stats.passes > 0) {
        totalPassed++
      }
      if (stats.fails > 0 && stats.passes < 1) {
        totalFailed++
      }
      // A test is considered flaky if it has both passes and fails
      if (stats.passes > 0 && stats.fails > 0) {
        totalFlaky += 1
      }
    })
    
    // Calculate average test duration from individual test durations
    this.individualTestDurations.forEach((duration: number) => {
      totalDuration += duration
      testCount++
    })
    const averageTestDuration = testCount > 0 ? totalDuration / testCount : 0

    const runTags = [
      `run_id:${this.runId}`,
      `team:${this.teamName}`,
      ...Array.from(this.allTestTags),
    ]

    //Send overall run statistics
    const metrics: DataDogMetric[] = [
      {
        metric: 'quality_metrics.test.run.duration',
        points: [[this.timeStamp, result.duration / 1000]],
        tags: runTags,
      },
      {
        metric: 'quality_metrics.test.run.total',
        points: [[this.timeStamp, Object.keys(this.testResults).length]],
        tags: runTags,
      },
      {
        metric: 'quality_metrics.test.run.passed',
        points: [[this.timeStamp, totalPassed]],
        tags: runTags,
      },
      {
        metric: 'quality_metrics.test.run.failed',
        points: [[this.timeStamp, totalFailed]],
        tags: runTags,
      },
      {
        metric: 'quality_metrics.test.run.flaky',
        points: [[this.timeStamp, totalFlaky]],
        tags: runTags,
      },
      {
        metric: 'quality_metrics.test.run.completed',
        points: [[this.timeStamp, 1]],
        tags: runTags,
      },
      {
        metric: 'quality_metrics.test.run.average_duration',
        points: [[this.timeStamp, averageTestDuration]],
        tags: runTags,
      },
    ]
    await this.sendToDataDog(metrics)
  }

  private calculateAndSendFlakiness(): void {
    const flakinessMetrics: DataDogMetric[] = []

    Object.entries(this.testResults).forEach(([testId, stats]) => {
      if (stats.total > 1) {
        const passRate = stats.passes / stats.total
        // Flakiness formula: 0 = consistent (all pass or all fail), 1 = completely flaky (50/50)
        const flakiness = Math.min(passRate, 1 - passRate) * 2
        const [testName, filePath, projectName] = testId.split('::')
        const tag = this.testTagsById[testId] || 'untagged'
        flakinessMetrics.push({
          metric: 'quality_metrics.test.flakiness',
          points: [[this.timeStamp, flakiness]],
          tags: [
            `test_name:${testName}`,
            `file:${filePath}`,
            `project:${projectName}`,
            `run_id:${this.runId}`,
            `team:${this.teamName}`,
            `test_tag:${tag}`,
          ],
        })
      }
    })

    if (flakinessMetrics.length > 0) {
      this.sendToDataDog(flakinessMetrics)
    }
  }

  private async sendToDataDog(metrics: DataDogMetric[]): Promise<void> {
    try {
      console.log(`📊 Sending ${metrics.length} metrics to Datadog:`, metrics.map(m => m.metric))
      console.log(`🏷️ Team name being used: "${this.teamName}"`)
      metrics.forEach((metric, index) => {
        const teamTag = metric.tags.find(tag => tag.startsWith('team:'))
        console.log(`   Metric ${index + 1} (${metric.metric}): team tag = ${teamTag}`)
      })
      const response = await fetch(
        `https://${this.datadogHost}/api/v1/series`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'DD-API-KEY': this.apiKey,
          },
          body: JSON.stringify({ series: metrics }),
        },
      )
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to send metrics to DataDog (${response.status}):`, errorText)
        console.error('📝 Metrics that failed:', JSON.stringify(metrics, null, 2))
      } else {
        console.log('✅ Successfully sent metrics to Datadog')
      }
    } catch (error) {
      console.error('❌ Error sending metrics to DataDog:', error)
      console.error('📝 Attempted metrics:', JSON.stringify(metrics, null, 2))
    }
  }

  private getTestId(test: TestCase): string {
    const title = test.title ?? 'unknown_title'
    const file = test.location?.file ?? 'unknown_file'
    let projectName = 'unknown_project'
    if (test.parent && typeof test.parent.project === 'function') {
      const project = test.parent.project()
      if (project && typeof project.name === 'string') {
        projectName = project.name
      }
    }
    return `${title}::${file}::${projectName}`
  }

}
