import type {
  SecurityAlert,
  ScanResult,
  SpiderResult,
  HeaderCheckResult,
  SslCheckResult,
} from '../../domain/entities/index.ts'
import type { RiskLevel } from '../../domain/value-objects/index.ts'

export interface SecurityPort {
  // Scanning
  spider(url: string): Promise<SpiderResult>
  activeScan(url: string): Promise<ScanResult>
  passiveScan(url: string): Promise<ScanResult>

  // Alerts
  readonly alerts: SecurityAlert[]
  getAlertsByRisk(risk: RiskLevel): SecurityAlert[]

  // Header/SSL checks
  checkSecurityHeaders(url: string): Promise<HeaderCheckResult>
  checkSslCertificate(url: string): Promise<SslCheckResult>

  // Reporting
  generateHtmlReport(outputPath: string): Promise<void>

  // Lifecycle
  newSession(): Promise<void>
  dispose(): Promise<void>
}
