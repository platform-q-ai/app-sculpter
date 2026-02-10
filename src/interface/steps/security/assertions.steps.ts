import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'
import { RiskLevel } from '../../../domain/value-objects/index.ts'
import type { RiskLevel as RiskLevelType } from '../../../domain/value-objects/index.ts'
import type { HeaderCheckResult, SslCheckResult, SpiderResult } from '../../../domain/entities/index.ts'

Then<TestWorld>(
  'there should be no {string} risk alerts',
  function (risk: string) {
    const alerts = this.security.getAlertsByRisk(risk as RiskLevelType)
    expect(alerts).toHaveLength(0)
  },
)

Then<TestWorld>(
  'there should be no alerts with risk at least {string}',
  function (threshold: string) {
    const allAlerts = this.security.alerts
    const highRiskAlerts = allAlerts.filter((a) =>
      RiskLevel.isAtLeast(a.risk, threshold as RiskLevelType),
    )
    expect(highRiskAlerts).toHaveLength(0)
  },
)

Then<TestWorld>(
  'the total alert count should be less than {int}',
  function (maxAlerts: number) {
    expect(this.security.alerts.length).toBeLessThan(maxAlerts)
  },
)

Then<TestWorld>(
  'the {string} risk alert count should be {int}',
  function (risk: string, expectedCount: number) {
    const alerts = this.security.getAlertsByRisk(risk as RiskLevelType)
    expect(alerts).toHaveLength(expectedCount)
  },
)

Then<TestWorld>(
  'the {string} risk alert count should be less than {int}',
  function (risk: string, maxCount: number) {
    const alerts = this.security.getAlertsByRisk(risk as RiskLevelType)
    expect(alerts.length).toBeLessThan(maxCount)
  },
)

Then<TestWorld>(
  'the security header {string} should be present',
  function (headerName: string) {
    const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
    expect(result.headers[headerName]?.present).toBe(true)
  },
)

Then<TestWorld>(
  'the security header {string} should not be present',
  function (headerName: string) {
    const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
    expect(result.headers[headerName]?.present).toBe(false)
  },
)

Then<TestWorld>(
  'all required security headers should be present',
  function () {
    const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
    expect(result.missingHeaders).toHaveLength(0)
  },
)

Then<TestWorld>(
  'the SSL certificate should be valid',
  function () {
    const result = this.getVariable<SslCheckResult>('_sslCheckResult')
    expect(result.valid).toBe(true)
  },
)

Then<TestWorld>(
  'the SSL certificate should have no errors',
  function () {
    const result = this.getVariable<SslCheckResult>('_sslCheckResult')
    expect(result.errors).toHaveLength(0)
  },
)

Then<TestWorld>(
  'the spider should have found at least {int} URLs',
  function (minUrls: number) {
    const result = this.getVariable<SpiderResult>('_spiderResult')
    expect(result.urlsFound).toBeGreaterThanOrEqual(minUrls)
  },
)

Then<TestWorld>(
  'I store alert count as {string}',
  function (variableName: string) {
    this.setVariable(variableName, this.security.alerts.length)
  },
)
