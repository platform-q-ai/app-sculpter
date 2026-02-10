import { When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

When<TestWorld>('I run {string}', async function (command: string) {
  await this.cli.run(this.interpolate(command))
})

When<TestWorld>(
  'I run {string} with stdin:',
  async function (command: string, docString: string) {
    await this.cli.runWithStdin(this.interpolate(command), this.interpolate(docString))
  },
)

When<TestWorld>(
  'I run {string} with stdin {string}',
  async function (command: string, stdin: string) {
    await this.cli.runWithStdin(this.interpolate(command), this.interpolate(stdin))
  },
)

When<TestWorld>(
  'I run {string} with timeout {int} seconds',
  async function (command: string, timeout: number) {
    await this.cli.runWithTimeout(this.interpolate(command), timeout * 1000)
  },
)
