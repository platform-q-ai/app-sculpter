import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'

Then<TestWorld>(
  'the exit code should be {int}',
  function (expectedCode: number) {
    expect(this.cli.exitCode).toBe(expectedCode)
  },
)

Then<TestWorld>(
  'the exit code should not be {int}',
  function (unexpectedCode: number) {
    expect(this.cli.exitCode).not.toBe(unexpectedCode)
  },
)

Then<TestWorld>(
  'the command should succeed',
  function () {
    expect(this.cli.exitCode).toBe(0)
  },
)

Then<TestWorld>(
  'the command should fail',
  function () {
    expect(this.cli.exitCode).not.toBe(0)
  },
)

Then<TestWorld>(
  'stdout should contain {string}',
  function (expected: string) {
    expect(this.cli.stdout).toContain(this.interpolate(expected))
  },
)

Then<TestWorld>(
  'stdout should not contain {string}',
  function (unexpected: string) {
    expect(this.cli.stdout).not.toContain(this.interpolate(unexpected))
  },
)

Then<TestWorld>(
  'stdout should match {string}',
  function (pattern: string) {
    expect(this.cli.stdout).toMatch(new RegExp(pattern))
  },
)

Then<TestWorld>(
  'stderr should contain {string}',
  function (expected: string) {
    expect(this.cli.stderr).toContain(this.interpolate(expected))
  },
)

Then<TestWorld>(
  'stderr should not contain {string}',
  function (unexpected: string) {
    expect(this.cli.stderr).not.toContain(this.interpolate(unexpected))
  },
)

Then<TestWorld>(
  'stderr should be empty',
  function () {
    expect(this.cli.stderr.trim()).toBe('')
  },
)

Then<TestWorld>(
  'stdout should equal:',
  function (docString: string) {
    expect(this.cli.stdout.trim()).toBe(this.interpolate(docString).trim())
  },
)

Then<TestWorld>(
  'I store stdout as {string}',
  function (variableName: string) {
    this.setVariable(variableName, this.cli.stdout.trim())
  },
)

Then<TestWorld>(
  'I store stderr as {string}',
  function (variableName: string) {
    this.setVariable(variableName, this.cli.stderr.trim())
  },
)

Then<TestWorld>(
  'I store exit code as {string}',
  function (variableName: string) {
    this.setVariable(variableName, this.cli.exitCode)
  },
)
