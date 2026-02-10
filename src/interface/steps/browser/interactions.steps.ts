import { When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

When<TestWorld>('I click on {string}', async function (selector: string) {
  await this.browser.click(this.interpolate(selector))
})

When<TestWorld>('I fill {string} with {string}', async function (selector: string, value: string) {
  await this.browser.fill(this.interpolate(selector), this.interpolate(value))
})

When<TestWorld>('I select {string} from {string}', async function (value: string, selector: string) {
  await this.browser.selectOption(this.interpolate(selector), this.interpolate(value))
})

When<TestWorld>('I check {string}', async function (selector: string) {
  await this.browser.check(this.interpolate(selector))
})

When<TestWorld>('I wait for {string}', async function (selector: string) {
  await this.browser.waitForSelector(this.interpolate(selector))
})

When<TestWorld>('I wait for {string} to be visible', async function (selector: string) {
  await this.browser.waitForSelector(this.interpolate(selector), { state: 'visible' })
})

When<TestWorld>('I wait for {string} to be hidden', async function (selector: string) {
  await this.browser.waitForSelector(this.interpolate(selector), { state: 'hidden' })
})

When<TestWorld>('I take a screenshot', async function () {
  const screenshot = await this.browser.screenshot()
  this.attach(screenshot, 'image/png')
})
