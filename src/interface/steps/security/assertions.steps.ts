import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'
import { RiskLevel } from '../../../domain/value-objects/index.ts'
import type { RiskLevel as RiskLevelType } from '../../../domain/value-objects/index.ts'
import type { HeaderCheckResult, SslCheckResult, SpiderResult } from '../../../domain/entities/index.ts'

// Spider Assertions
Then<TestWorld>(
  'the spider should find at least {int} URLs',
  function (minUrls: number) {
    const result = this.getVariable<SpiderResult>('_spiderResult')
    expect(result.urlsFound).toBeGreaterThanOrEqual(minUrls)
  },
)

// Alert Assertions (by risk)
Then<TestWorld>('no high risk alerts should be found', function () {
  const alerts = this.security.getAlertsByRisk('High')
  expect(alerts).toHaveLength(0)
})

Then<TestWorld>('no medium or higher risk alerts should be found', function () {
  const allAlerts = this.security.alerts
  const mediumOrHigher = allAlerts.filter((a) =>
    RiskLevel.isAtLeast(a.risk, 'Medium'),
  )
  expect(mediumOrHigher).toHaveLength(0)
})

Then<TestWorld>('there should be no critical vulnerabilities', function () {
  const alerts = this.security.getAlertsByRisk('High')
  expect(alerts).toHaveLength(0)
})

Then<TestWorld>('alerts should not exceed risk level {string}', function (maxRisk: string) {
  const allAlerts = this.security.alerts
  const exceeding = allAlerts.filter((a) => {
    const riskOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1, Informational: 0 }
    return (riskOrder[a.risk] ?? 0) > (riskOrder[maxRisk] ?? 0)
  })
  expect(exceeding).toHaveLength(0)
})

// Alert Assertions (by count)
Then<TestWorld>('there should be {int} alerts', function (expectedCount: number) {
  expect(this.security.alertCount).toBe(expectedCount)
})

Then<TestWorld>('there should be less than {int} alerts', function (maxAlerts: number) {
  expect(this.security.alertCount).toBeLessThan(maxAlerts)
})

Then<TestWorld>('there should be no alerts of type {string}', function (alertType: string) {
  const alerts = this.security.getAlertsByType(this.interpolate(alertType))
  expect(alerts).toHaveLength(0)
})

// Security Header Assertions
Then<TestWorld>('the security headers should include {string}', function (headerName: string) {
  const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
  expect(result.headers[headerName]).toBeDefined()
})

Then<TestWorld>('Content-Security-Policy should be present', function () {
  const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
  expect(result.headers['Content-Security-Policy']).toBeDefined()
})

Then<TestWorld>('X-Frame-Options should be set to {string}', function (expectedValue: string) {
  const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
  expect(result.headers['X-Frame-Options']).toBe(this.interpolate(expectedValue))
})

Then<TestWorld>('Strict-Transport-Security should be present', function () {
  const result = this.getVariable<HeaderCheckResult>('_headerCheckResult')
  expect(result.headers['Strict-Transport-Security']).toBeDefined()
})

// SSL Certificate Assertions
Then<TestWorld>('the SSL certificate should be valid', function () {
  const result = this.getVariable<SslCheckResult>('_sslCheckResult')
  expect(result.valid).toBe(true)
})

Then<TestWorld>(
  'the SSL certificate should not expire within {int} days',
  function (days: number) {
    const result = this.getVariable<SslCheckResult>('_sslCheckResult')
    const expiresAt = new Date(result.expiresAt)
    const minDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    expect(expiresAt.getTime()).toBeGreaterThan(minDate.getTime())
  },
)

// Detailed Inspection
Then<TestWorld>('I should see the alert details', function () {
  const alerts = this.security.alerts
  for (const alert of alerts) {
    this.log(`[${alert.risk}] ${alert.name}: ${alert.description}`)
    this.log(`  URL: ${alert.url}`)
    this.log(`  Solution: ${alert.solution}`)
  }
})

// Variable Storage
Then<TestWorld>('I store the alerts as {string}', function (variableName: string) {
  this.setVariable(variableName, this.security.alerts)
})
