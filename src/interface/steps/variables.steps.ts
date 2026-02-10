import { Given, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../world/index.ts'

Given<TestWorld>(
  'I set variable {string} to {string}',
  function (name: string, value: string) {
    this.setVariable(name, this.interpolate(value))
  },
)

Given<TestWorld>(
  'I set variable {string} to {int}',
  function (name: string, value: number) {
    this.setVariable(name, value)
  },
)

Given<TestWorld>(
  'I set variable {string} to:',
  function (name: string, docString: string) {
    try {
      this.setVariable(name, JSON.parse(this.interpolate(docString)))
    } catch {
      this.setVariable(name, this.interpolate(docString))
    }
  },
)

Then<TestWorld>(
  'the variable {string} should equal {string}',
  function (name: string, expected: string) {
    const actual = this.getVariable(name)
    expect(actual).toBe(this.interpolate(expected))
  },
)

Then<TestWorld>(
  'the variable {string} should equal {int}',
  function (name: string, expected: number) {
    const actual = this.getVariable(name)
    expect(actual).toBe(expected)
  },
)

Then<TestWorld>(
  'the variable {string} should exist',
  function (name: string) {
    expect(this.hasVariable(name)).toBe(true)
  },
)

Then<TestWorld>(
  'the variable {string} should not exist',
  function (name: string) {
    expect(this.hasVariable(name)).toBe(false)
  },
)

Then<TestWorld>(
  'the variable {string} should contain {string}',
  function (name: string, expected: string) {
    const actual = String(this.getVariable(name))
    expect(actual).toContain(this.interpolate(expected))
  },
)

Then<TestWorld>(
  'the variable {string} should match {string}',
  function (name: string, pattern: string) {
    const actual = String(this.getVariable(name))
    expect(actual).toMatch(new RegExp(pattern))
  },
)
