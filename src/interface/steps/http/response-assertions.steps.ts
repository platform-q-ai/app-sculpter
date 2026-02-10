import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'

Then<TestWorld>(
  'the response status should be {int}',
  function (expectedStatus: number) {
    expect(this.http.status).toBe(expectedStatus)
  },
)

Then<TestWorld>(
  'the response status should not be {int}',
  function (unexpectedStatus: number) {
    expect(this.http.status).not.toBe(unexpectedStatus)
  },
)

Then<TestWorld>(
  'the response body path {string} should equal {string}',
  function (jsonPath: string, expectedValue: string) {
    const actual = this.http.getBodyPath(jsonPath)
    expect(actual).toBe(this.interpolate(expectedValue))
  },
)

Then<TestWorld>(
  'the response body path {string} should equal {int}',
  function (jsonPath: string, expectedValue: number) {
    const actual = this.http.getBodyPath(jsonPath)
    expect(actual).toBe(expectedValue)
  },
)

Then<TestWorld>(
  'the response body path {string} should exist',
  function (jsonPath: string) {
    const value = this.http.getBodyPath(jsonPath)
    expect(value).toBeDefined()
  },
)

Then<TestWorld>(
  'the response body path {string} should not exist',
  function (jsonPath: string) {
    const value = this.http.getBodyPath(jsonPath)
    expect(value).toBeUndefined()
  },
)

Then<TestWorld>(
  'the response body path {string} should contain {string}',
  function (jsonPath: string, expectedSubstring: string) {
    const actual = String(this.http.getBodyPath(jsonPath))
    expect(actual).toContain(this.interpolate(expectedSubstring))
  },
)

Then<TestWorld>(
  'the response body path {string} should match {string}',
  function (jsonPath: string, pattern: string) {
    const actual = String(this.http.getBodyPath(jsonPath))
    expect(actual).toMatch(new RegExp(pattern))
  },
)

Then<TestWorld>(
  'the response body path {string} should have {int} items',
  function (jsonPath: string, expectedCount: number) {
    const actual = this.http.getBodyPath(jsonPath) as unknown[]
    expect(actual).toHaveLength(expectedCount)
  },
)

Then<TestWorld>(
  'the response body should be valid JSON',
  function () {
    expect(typeof this.http.body).toBe('object')
  },
)

Then<TestWorld>(
  'the response header {string} should equal {string}',
  function (headerName: string, expectedValue: string) {
    const actual = this.http.response.headers[headerName.toLowerCase()]
    expect(actual).toBe(this.interpolate(expectedValue))
  },
)

Then<TestWorld>(
  'the response header {string} should contain {string}',
  function (headerName: string, expectedSubstring: string) {
    const actual = this.http.response.headers[headerName.toLowerCase()]
    expect(actual).toContain(this.interpolate(expectedSubstring))
  },
)

Then<TestWorld>(
  'the response time should be less than {int} ms',
  function (maxMs: number) {
    expect(this.http.response.responseTime).toBeLessThan(maxMs)
  },
)

Then<TestWorld>(
  'I store response body path {string} as {string}',
  function (jsonPath: string, variableName: string) {
    const value = this.http.getBodyPath(jsonPath)
    this.setVariable(variableName, value)
  },
)

Then<TestWorld>(
  'I store response header {string} as {string}',
  function (headerName: string, variableName: string) {
    const value = this.http.response.headers[headerName.toLowerCase()]
    this.setVariable(variableName, value)
  },
)

Then<TestWorld>(
  'I store response status as {string}',
  function (variableName: string) {
    this.setVariable(variableName, this.http.status)
  },
)
