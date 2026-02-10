import { Given } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

Given<TestWorld>(
  'I set env {string} to {string}',
  function (name: string, value: string) {
    this.cli.setEnv(name, this.interpolate(value))
  },
)

Given<TestWorld>(
  'I set the following environment variables:',
  function (dataTable) {
    const env = dataTable.rowsHash() as Record<string, string>
    for (const [name, value] of Object.entries(env)) {
      this.cli.setEnv(name, this.interpolate(value))
    }
  },
)

Given<TestWorld>(
  'I set working directory to {string}',
  function (dir: string) {
    this.cli.setWorkingDir(this.interpolate(dir))
  },
)
