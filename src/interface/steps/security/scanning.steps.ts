import { When, Given } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

// Session Management
Given<TestWorld>('a new ZAP session', async function () {
  await this.security.newSession()
})

// Spidering
When<TestWorld>('I spider {string}', async function (url: string) {
  const result = await this.security.spider(this.interpolate(url))
  this.setVariable('_spiderResult', result)
})

When<TestWorld>('I ajax spider {string}', async function (url: string) {
  const result = await this.security.ajaxSpider(this.interpolate(url))
  this.setVariable('_spiderResult', result)
})

// Scanning
When<TestWorld>('I run a passive scan on {string}', async function (url: string) {
  const result = await this.security.passiveScan(this.interpolate(url))
  this.setVariable('_scanResult', result)
})

When<TestWorld>('I run an active scan on {string}', async function (url: string) {
  const result = await this.security.activeScan(this.interpolate(url))
  this.setVariable('_scanResult', result)
})

When<TestWorld>('I run a baseline scan on {string}', async function (url: string) {
  // A baseline scan is spider + passive scan
  await this.security.spider(this.interpolate(url))
  const result = await this.security.passiveScan(this.interpolate(url))
  this.setVariable('_scanResult', result)
})

// Security Headers
When<TestWorld>('I check {string} for security headers', async function (url: string) {
  const result = await this.security.checkSecurityHeaders(this.interpolate(url))
  this.setVariable('_headerCheckResult', result)
})

// SSL Certificate
When<TestWorld>('I check SSL certificate for {string}', async function (url: string) {
  const result = await this.security.checkSslCertificate(this.interpolate(url))
  this.setVariable('_sslCheckResult', result)
})

// Reporting
When<TestWorld>('I save the security report to {string}', async function (outputPath: string) {
  await this.security.generateHtmlReport(this.interpolate(outputPath))
})

When<TestWorld>('I save the security report as JSON to {string}', async function (outputPath: string) {
  await this.security.generateJsonReport(this.interpolate(outputPath))
})
