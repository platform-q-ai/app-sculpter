import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'

// Visibility Assertions
Then<TestWorld>('I should see {string}', async function (text: string) {
  const page = this.browser.page
  const locator = page.getByText(this.interpolate(text))
  await expect(locator.first()).toBeVisible()
})

Then<TestWorld>('I should not see {string}', async function (text: string) {
  const page = this.browser.page
  const locator = page.getByText(this.interpolate(text))
  await expect(locator.first()).not.toBeVisible()
})

Then<TestWorld>('{string} should be visible', async function (selector: string) {
  const visible = await this.browser.isVisible(this.interpolate(selector))
  expect(visible).toBe(true)
})

Then<TestWorld>('{string} should be hidden', async function (selector: string) {
  const visible = await this.browser.isVisible(this.interpolate(selector))
  expect(visible).toBe(false)
})

Then<TestWorld>('{string} should exist', async function (selector: string) {
  const count = await this.browser.page.locator(this.interpolate(selector)).count()
  expect(count).toBeGreaterThan(0)
})

Then<TestWorld>('{string} should not exist', async function (selector: string) {
  const count = await this.browser.page.locator(this.interpolate(selector)).count()
  expect(count).toBe(0)
})

// State Assertions
Then<TestWorld>('{string} should be enabled', async function (selector: string) {
  const enabled = await this.browser.isEnabled(this.interpolate(selector))
  expect(enabled).toBe(true)
})

Then<TestWorld>('{string} should be disabled', async function (selector: string) {
  const enabled = await this.browser.isEnabled(this.interpolate(selector))
  expect(enabled).toBe(false)
})

Then<TestWorld>('{string} should be checked', async function (selector: string) {
  const checked = await this.browser.isChecked(this.interpolate(selector))
  expect(checked).toBe(true)
})

Then<TestWorld>('{string} should not be checked', async function (selector: string) {
  const checked = await this.browser.isChecked(this.interpolate(selector))
  expect(checked).toBe(false)
})

// Content Assertions
Then<TestWorld>('{string} should have text {string}', async function (selector: string, expectedText: string) {
  const text = await this.browser.textContent(this.interpolate(selector))
  expect(text?.trim()).toBe(this.interpolate(expectedText))
})

Then<TestWorld>('{string} should contain text {string}', async function (selector: string, expectedText: string) {
  const text = await this.browser.textContent(this.interpolate(selector))
  expect(text).toContain(this.interpolate(expectedText))
})

Then<TestWorld>('{string} should have value {string}', async function (selector: string, expectedValue: string) {
  const value = await this.browser.page.inputValue(this.interpolate(selector))
  expect(value).toBe(this.interpolate(expectedValue))
})

Then<TestWorld>(
  '{string} should have attribute {string} with value {string}',
  async function (selector: string, attrName: string, expectedValue: string) {
    const value = await this.browser.getAttribute(this.interpolate(selector), attrName)
    expect(value).toBe(this.interpolate(expectedValue))
  },
)

Then<TestWorld>('{string} should have class {string}', async function (selector: string, className: string) {
  const classAttr = await this.browser.getAttribute(this.interpolate(selector), 'class')
  expect(classAttr).toContain(this.interpolate(className))
})

// Page Assertions
Then<TestWorld>('the page title should be {string}', async function (expectedTitle: string) {
  const title = await this.browser.title()
  expect(title).toBe(this.interpolate(expectedTitle))
})

Then<TestWorld>('the page title should contain {string}', async function (expectedPart: string) {
  const title = await this.browser.title()
  expect(title).toContain(this.interpolate(expectedPart))
})

Then<TestWorld>('the URL should be {string}', function (expectedUrl: string) {
  expect(this.browser.url()).toBe(this.interpolate(expectedUrl))
})

Then<TestWorld>('the URL should contain {string}', function (expectedPart: string) {
  expect(this.browser.url()).toContain(this.interpolate(expectedPart))
})

// Count Assertions
Then<TestWorld>('there should be {int} {string} elements', async function (count: number, selector: string) {
  const actual = await this.browser.page.locator(this.interpolate(selector)).count()
  expect(actual).toBe(count)
})

// Variable Storage
Then<TestWorld>('I store the text of {string} as {string}', async function (selector: string, variableName: string) {
  const text = await this.browser.textContent(this.interpolate(selector))
  this.setVariable(variableName, text)
})

Then<TestWorld>('I store the value of {string} as {string}', async function (selector: string, variableName: string) {
  const value = await this.browser.page.inputValue(this.interpolate(selector))
  this.setVariable(variableName, value)
})

Then<TestWorld>('I store the URL as {string}', function (variableName: string) {
  this.setVariable(variableName, this.browser.url())
})
