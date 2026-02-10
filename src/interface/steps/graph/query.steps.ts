import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'

// Query Result Assertions
Then<TestWorld>('the result should be empty', function () {
  expect(this.graph.count).toBe(0)
})

Then<TestWorld>('the result should have {int} rows', function (expectedCount: number) {
  expect(this.graph.count).toBe(expectedCount)
})

Then<TestWorld>('the result should have at least {int} rows', function (minCount: number) {
  expect(this.graph.count).toBeGreaterThanOrEqual(minCount)
})

Then<TestWorld>(
  'the result path {string} should equal {string}',
  function (path: string, expectedValue: string) {
    const records = this.graph.records
    expect(records.length).toBeGreaterThan(0)
    const keys = path.split('.')
    let value: unknown = records[0]
    for (const key of keys) {
      value = (value as Record<string, unknown>)[key]
    }
    expect(String(value)).toBe(this.interpolate(expectedValue))
  },
)

Then<TestWorld>(
  'the result path {string} should contain {string}',
  function (path: string, expectedSubstring: string) {
    const records = this.graph.records
    expect(records.length).toBeGreaterThan(0)
    const keys = path.split('.')
    let value: unknown = records[0]
    for (const key of keys) {
      value = (value as Record<string, unknown>)[key]
    }
    expect(String(value)).toContain(this.interpolate(expectedSubstring))
  },
)

// Variable Storage
Then<TestWorld>('I store the result as {string}', function (variableName: string) {
  this.setVariable(variableName, this.graph.records)
})

Then<TestWorld>('I store the result count as {string}', function (variableName: string) {
  this.setVariable(variableName, this.graph.count)
})
