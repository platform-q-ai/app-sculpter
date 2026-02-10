import { Given, When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

Given<TestWorld>('I navigate to {string}', async function (path: string) {
  await this.browser.goto(this.interpolate(path))
})

Given<TestWorld>('I am on {string}', async function (path: string) {
  await this.browser.goto(this.interpolate(path))
})

When<TestWorld>('I reload the page', async function () {
  await this.browser.reload()
})

When<TestWorld>('I go back', async function () {
  await this.browser.goBack()
})

When<TestWorld>('I wait for navigation', async function () {
  await this.browser.waitForNavigation()
})
