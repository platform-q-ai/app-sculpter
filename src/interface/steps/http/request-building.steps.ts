import { Given } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

Given<TestWorld>(
  'I set header {string} to {string}',
  function (name: string, value: string) {
    this.http.setHeader(name, this.interpolate(value))
  },
)

Given<TestWorld>(
  'I set the following headers:',
  function (dataTable) {
    const headers = dataTable.rowsHash() as Record<string, string>
    for (const [name, value] of Object.entries(headers)) {
      this.http.setHeader(name, this.interpolate(value))
    }
  },
)

Given<TestWorld>(
  'I set bearer token to {string}',
  function (token: string) {
    this.http.setBearerToken(this.interpolate(token))
  },
)

Given<TestWorld>(
  'I set basic auth with username {string} and password {string}',
  function (username: string, password: string) {
    this.http.setBasicAuth(this.interpolate(username), this.interpolate(password))
  },
)

Given<TestWorld>(
  'I set query param {string} to {string}',
  function (name: string, value: string) {
    this.http.setQueryParam(name, this.interpolate(value))
  },
)

Given<TestWorld>(
  'I set the following query params:',
  function (dataTable) {
    const params = dataTable.rowsHash() as Record<string, string>
    for (const [name, value] of Object.entries(params)) {
      this.http.setQueryParam(name, this.interpolate(value))
    }
  },
)
