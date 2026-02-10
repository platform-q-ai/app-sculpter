import type { SecurityPort } from '../../../application/ports/index.ts'
import type { SecurityAdapterConfig } from '../../../application/config/index.ts'
import type {
  SecurityAlert,
  ScanResult,
  SpiderResult,
  HeaderCheckResult,
  SslCheckResult,
} from '../../../domain/entities/index.ts'
import type { RiskLevel } from '../../../domain/value-objects/index.ts'

export class ZapSecurityAdapter implements SecurityPort {
  private _alerts: SecurityAlert[] = []
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(private readonly config: SecurityAdapterConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey ?? ''
  }

  private async zapRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.set('apikey', this.apiKey)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(this.config.timeout ?? 60000),
    })

    if (!response.ok) {
      throw new Error(`ZAP API request failed: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as T
  }

  async spider(url: string): Promise<SpiderResult> {
    // Start spider scan
    const startResult = await this.zapRequest<{ scan: string }>('/JSON/spider/action/scan/', {
      url,
    })

    const scanId = startResult.scan

    // Poll for completion
    let progress = 0
    while (progress < 100) {
      const statusResult = await this.zapRequest<{ status: string }>(
        '/JSON/spider/view/status/',
        { scanId },
      )
      progress = parseInt(statusResult.status, 10)
      if (progress < 100) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Get results
    const results = await this.zapRequest<{ results: string[] }>('/JSON/spider/view/results/', {
      scanId,
    })

    return {
      urlsFound: results.results.length,
      urls: results.results,
    }
  }

  async activeScan(url: string): Promise<ScanResult> {
    const startResult = await this.zapRequest<{ scan: string }>('/JSON/ascan/action/scan/', {
      url,
    })

    const scanId = startResult.scan

    let progress = 0
    while (progress < 100) {
      const statusResult = await this.zapRequest<{ status: string }>(
        '/JSON/ascan/view/status/',
        { scanId },
      )
      progress = parseInt(statusResult.status, 10)
      if (progress < 100) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    await this.refreshAlerts()

    return {
      alerts: this._alerts,
      progress: 100,
      status: 'complete',
    }
  }

  async passiveScan(url: string): Promise<ScanResult> {
    // Passive scan happens automatically when spidering/browsing
    // We just need to wait for the passive scanner to finish
    let recordsRemaining = 1
    while (recordsRemaining > 0) {
      const result = await this.zapRequest<{ recordsToScan: string }>(
        '/JSON/pscan/view/recordsToScan/',
      )
      recordsRemaining = parseInt(result.recordsToScan, 10)
      if (recordsRemaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    await this.refreshAlerts()

    return {
      alerts: this._alerts,
      progress: 100,
      status: 'complete',
    }
  }

  get alerts(): SecurityAlert[] {
    return this._alerts
  }

  getAlertsByRisk(risk: RiskLevel): SecurityAlert[] {
    return this._alerts.filter((alert) => alert.risk === risk)
  }

  async checkSecurityHeaders(url: string): Promise<HeaderCheckResult> {
    // Fetch the URL to trigger passive scan of headers
    await fetch(url)

    const expectedHeaders = [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Strict-Transport-Security',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Permissions-Policy',
    ]

    const response = await fetch(url)
    const headers: Record<string, { present: boolean; value?: string }> = {}
    const missingHeaders: string[] = []

    for (const header of expectedHeaders) {
      const value = response.headers.get(header)
      headers[header] = {
        present: value !== null,
        value: value ?? undefined,
      }
      if (value === null) {
        missingHeaders.push(header)
      }
    }

    return { headers, missingHeaders }
  }

  async checkSslCertificate(url: string): Promise<SslCheckResult> {
    try {
      const response = await fetch(url)
      // Basic SSL check - if fetch succeeds over HTTPS, certificate is valid
      const isHttps = new URL(url).protocol === 'https:'
      return {
        valid: isHttps && response.ok,
        errors: isHttps ? [] : ['URL does not use HTTPS'],
      }
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown SSL error'],
      }
    }
  }

  async generateHtmlReport(outputPath: string): Promise<void> {
    const report = await this.zapRequest<ArrayBuffer>('/OTHER/core/other/htmlreport/')
    const reportHtml =
      report instanceof ArrayBuffer
        ? new TextDecoder().decode(report)
        : String(report)
    await Bun.write(outputPath, reportHtml)
  }

  async newSession(): Promise<void> {
    await this.zapRequest('/JSON/core/action/newSession/')
    this._alerts = []
  }

  async dispose(): Promise<void> {
    // ZAP adapter doesn't hold persistent connections
  }

  private async refreshAlerts(): Promise<void> {
    interface ZapAlert {
      name: string
      risk: string
      confidence: string
      description: string
      url: string
      solution: string
      cweid: string
    }

    const result = await this.zapRequest<{ alerts: ZapAlert[] }>('/JSON/core/view/alerts/')

    this._alerts = result.alerts.map((alert) => ({
      name: alert.name,
      risk: alert.risk as RiskLevel,
      confidence: alert.confidence as SecurityAlert['confidence'],
      description: alert.description,
      url: alert.url,
      solution: alert.solution,
      cweid: alert.cweid,
    }))
  }
}
