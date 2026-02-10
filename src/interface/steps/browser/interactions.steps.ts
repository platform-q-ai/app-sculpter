import { When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

// Clicking
When<TestWorld>('I click {string}', async function (selector: string) {
  await this.browser.click(this.interpolate(selector))
})

When<TestWorld>('I click the {string} button', async function (text: string) {
  await this.browser.click(`button:has-text("${this.interpolate(text)}")`)
})

When<TestWorld>('I click the {string} link', async function (text: string) {
  await this.browser.click(`a:has-text("${this.interpolate(text)}")`)
})

When<TestWorld>('I click the {string} element', async function (selector: string) {
  await this.browser.click(this.interpolate(selector))
})

When<TestWorld>('I double-click {string}', async function (selector: string) {
  await this.browser.doubleClick(this.interpolate(selector))
})

// Form Inputs
When<TestWorld>('I fill {string} with {string}', async function (selector: string, value: string) {
  await this.browser.fill(this.interpolate(selector), this.interpolate(value))
})

When<TestWorld>('I clear {string}', async function (selector: string) {
  await this.browser.clear(this.interpolate(selector))
})

When<TestWorld>('I type {string} into {string}', async function (text: string, selector: string) {
  await this.browser.type(this.interpolate(selector), this.interpolate(text))
})

When<TestWorld>('I select {string} from {string}', async function (value: string, selector: string) {
  await this.browser.selectOption(this.interpolate(selector), this.interpolate(value))
})

When<TestWorld>('I check {string}', async function (selector: string) {
  await this.browser.check(this.interpolate(selector))
})

When<TestWorld>('I uncheck {string}', async function (selector: string) {
  await this.browser.uncheck(this.interpolate(selector))
})

When<TestWorld>('I press {string}', async function (key: string) {
  await this.browser.press(key)
})

When<TestWorld>('I upload {string} to {string}', async function (filePath: string, selector: string) {
  await this.browser.uploadFile(this.interpolate(selector), this.interpolate(filePath))
})

// Hovering/Focus
When<TestWorld>('I hover over {string}', async function (selector: string) {
  await this.browser.hover(this.interpolate(selector))
})

When<TestWorld>('I focus on {string}', async function (selector: string) {
  await this.browser.focus(this.interpolate(selector))
})

// Waiting
When<TestWorld>('I wait for {string} to be visible', async function (selector: string) {
  await this.browser.waitForSelector(this.interpolate(selector), { state: 'visible' })
})

When<TestWorld>('I wait for {string} to be hidden', async function (selector: string) {
  await this.browser.waitForSelector(this.interpolate(selector), { state: 'hidden' })
})

When<TestWorld>('I wait for {int} seconds', async function (seconds: number) {
  await this.browser.waitForTimeout(seconds * 1000)
})

When<TestWorld>('I wait for the page to load', async function () {
  await this.browser.waitForLoadState('load')
})

When<TestWorld>('I wait for network idle', async function () {
  await this.browser.waitForLoadState('networkidle')
})

// Screenshots
When<TestWorld>('I take a screenshot', async function () {
  const screenshot = await this.browser.screenshot()
  this.attach(screenshot, 'image/png')
})

When<TestWorld>('I take a screenshot of {string}', async function (selector: string) {
  const element = this.browser.page.locator(this.interpolate(selector))
  const screenshot = await element.screenshot()
  this.attach(screenshot, 'image/png')
})
