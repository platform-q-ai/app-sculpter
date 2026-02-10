import type { RiskLevel } from '../value-objects/RiskLevel.ts'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'False Positive'

export interface SecurityAlert {
  readonly name: string
  readonly risk: RiskLevel
  readonly confidence: ConfidenceLevel
  readonly description: string
  readonly url: string
  readonly solution: string
  readonly cweid: string
}

export interface ScanResult {
  readonly alerts: SecurityAlert[]
  readonly progress: number
  readonly status: string
}

export interface SpiderResult {
  readonly urlsFound: number
  readonly urls: string[]
}

export interface HeaderCheckResult {
  readonly headers: Record<string, { present: boolean; value?: string }>
  readonly missingHeaders: string[]
}

export interface SslCheckResult {
  readonly valid: boolean
  readonly expiresAt?: Date
  readonly issuer?: string
  readonly errors: string[]
}
