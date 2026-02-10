import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'

Then<TestWorld>('the URL should be {string}', function (expectedUrl: string) {
  expect(this.browser.url()).toBe(this.interpolate(expectedUrl))
})

Then<TestWorld>('the URL should contain {string}', function (expectedPart: string) {
  expect(this.browser.url()).toContain(this.interpolate(expectedPart))
})

Then<TestWorld>('the page title should be {string}', async function (expectedTitle: string) {
  const title = await this.browser.title()
  expect(title).toBe(this.interpolate(expectedTitle))
})

Then<TestWorld>('the page title should contain {string}', async function (expectedPart: string) {
  const title = await this.browser.title()
  expect(title).toContain(this.interpolate(expectedPart))
})

Then<TestWorld>('I should see {string}', async function (selector: string) {
  const visible = await this.browser.isVisible(this.interpolate(selector))
  expect(visible).toBe(true)
})

Then<TestWorld>('I should not see {string}', async function (selector: string) {
  const visible = await this.browser.isVisible(this.interpolate(selector))
  expect(visible).toBe(false)
})

Then<TestWorld>(
  'the element {string} should contain text {string}',
  async function (selector: string, expectedText: string) {
    const text = await this.browser.textContent(this.interpolate(selector))
    expect(text).toContain(this.interpolate(expectedText))
  },
)

Then<TestWorld>(
  'the element {string} should have text {string}',
  async function (selector: string, expectedText: string) {
    const text = await this.browser.textContent(this.interpolate(selector))
    expect(text?.trim()).toBe(this.interpolate(expectedText))
  },
)

Then<TestWorld>(
  'the element {string} should be visible',
  async function (selector: string) {
    const visible = await this.browser.isVisible(this.interpolate(selector))
    expect(visible).toBe(true)
  },
)

Then<TestWorld>(
  'the element {string} should not be visible',
  async function (selector: string) {
    const visible = await this.browser.isVisible(this.interpolate(selector))
    expect(visible).toBe(false)
  },
)

Then<TestWorld>(
  'I store text of {string} as {string}',
  async function (selector: string, variableName: string) {
    const text = await this.browser.textContent(this.interpolate(selector))
    this.setVariable(variableName, text)
  },
)

Then<TestWorld>(
  'I store the URL as {string}',
  function (variableName: string) {
    this.setVariable(variableName, this.browser.url())
  },
)
