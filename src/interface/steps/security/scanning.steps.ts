import { When, Given } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

Given<TestWorld>('I start a new security session', async function () {
  await this.security.newSession()
})

When<TestWorld>('I spider {string}', async function (url: string) {
  const result = await this.security.spider(this.interpolate(url))
  this.setVariable('_spiderResult', result)
})

When<TestWorld>('I run an active scan on {string}', async function (url: string) {
  const result = await this.security.activeScan(this.interpolate(url))
  this.setVariable('_scanResult', result)
})

When<TestWorld>('I run a passive scan on {string}', async function (url: string) {
  const result = await this.security.passiveScan(this.interpolate(url))
  this.setVariable('_scanResult', result)
})

When<TestWorld>('I check security headers on {string}', async function (url: string) {
  const result = await this.security.checkSecurityHeaders(this.interpolate(url))
  this.setVariable('_headerCheckResult', result)
})

When<TestWorld>('I check SSL certificate on {string}', async function (url: string) {
  const result = await this.security.checkSslCertificate(this.interpolate(url))
  this.setVariable('_sslCheckResult', result)
})

When<TestWorld>(
  'I generate security report to {string}',
  async function (outputPath: string) {
    await this.security.generateHtmlReport(this.interpolate(outputPath))
  },
)
