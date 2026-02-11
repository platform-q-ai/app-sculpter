import { test, expect, describe, beforeEach, mock } from 'bun:test'
import { VariableService } from '../../../src/application/services/VariableService.ts'
import { InterpolationService } from '../../../src/application/services/InterpolationService.ts'
import type { HttpResponse } from '../../../src/domain/entities/HttpResponse.ts'

/**
 * Tests for HTTP step definition logic (request-building, http-methods, response-assertions).
 *
 * We do NOT import the step definition files (they register with Cucumber).
 * Instead, we create mock HttpPort + mock world objects and replicate the
 * handler logic inline per test.
 */

interface MockHttpPort {
  setHeader: ReturnType<typeof mock>
  setHeaders: ReturnType<typeof mock>
  setQueryParam: ReturnType<typeof mock>
  setQueryParams: ReturnType<typeof mock>
  setBearerToken: ReturnType<typeof mock>
  setBasicAuth: ReturnType<typeof mock>
  get: ReturnType<typeof mock>
  post: ReturnType<typeof mock>
  put: ReturnType<typeof mock>
  patch: ReturnType<typeof mock>
  delete: ReturnType<typeof mock>
  request: ReturnType<typeof mock>
  getBodyPath: ReturnType<typeof mock>
  status: number
  statusText: string
  headers: Record<string, string>
  body: unknown
  text: string
  responseTime: number
  response: HttpResponse
  config: { baseUrl: string }
  dispose: ReturnType<typeof mock>
}

interface MockWorld {
  http: MockHttpPort
  setVariable(name: string, value: unknown): void
  getVariable(name: string): unknown
  hasVariable(name: string): boolean
  interpolate(text: string): string
}

function createMockHttpPort(overrides: Partial<MockHttpPort> = {}): MockHttpPort {
  const defaultResponse: HttpResponse = {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    body: {},
    text: '{}',
    responseTime: 50,
  }

  return {
    setHeader: mock(() => {}),
    setHeaders: mock(() => {}),
    setQueryParam: mock(() => {}),
    setQueryParams: mock(() => {}),
    setBearerToken: mock(() => {}),
    setBasicAuth: mock(() => {}),
    get: mock(async () => {}),
    post: mock(async () => {}),
    put: mock(async () => {}),
    patch: mock(async () => {}),
    delete: mock(async () => {}),
    request: mock(async () => {}),
    getBodyPath: mock(() => undefined),
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    body: {},
    text: '{}',
    responseTime: 50,
    response: defaultResponse,
    config: { baseUrl: 'http://localhost:3000' },
    dispose: mock(async () => {}),
    ...overrides,
  }
}

function createMockWorld(httpOverrides: Partial<MockHttpPort> = {}): MockWorld {
  const variableService = new VariableService()
  const interpolationService = new InterpolationService(variableService)
  return {
    http: createMockHttpPort(httpOverrides),
    setVariable: (name, value) => variableService.set(name, value),
    getVariable: (name) => variableService.get(name),
    hasVariable: (name) => variableService.has(name),
    interpolate: (text) => interpolationService.interpolate(text),
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Request Building Steps (request-building.steps.ts)
// ═════════════════════════════════════════════════════════════════════════════

describe('Request Building Steps', () => {
  let world: MockWorld

  beforeEach(() => {
    world = createMockWorld()
  })

  // ─── I set header {string} to {string} ─────────────────────────────────

  describe('I set header {string} to {string}', () => {
    test('calls http.setHeader with name and value', () => {
      // Step logic: this.http.setHeader(name, this.interpolate(value))
      const name = 'Content-Type'
      const value = 'application/json'
      world.http.setHeader(name, world.interpolate(value))

      expect(world.http.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
    })

    test('interpolates the header value', () => {
      world.setVariable('token', 'abc123')

      const name = 'X-Custom'
      const value = 'Bearer ${token}'
      world.http.setHeader(name, world.interpolate(value))

      expect(world.http.setHeader).toHaveBeenCalledWith('X-Custom', 'Bearer abc123')
    })
  })

  // ─── I set the following headers: ──────────────────────────────────────

  describe('I set the following headers:', () => {
    test('sets multiple headers from data table', () => {
      // Step logic:
      // const headers = dataTable.rowsHash()
      // for (const [name, value] of Object.entries(headers)) {
      //   this.http.setHeader(name, this.interpolate(value))
      // }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/html',
        'X-Request-Id': '12345',
      }

      for (const [name, value] of Object.entries(headers)) {
        world.http.setHeader(name, world.interpolate(value))
      }

      expect(world.http.setHeader).toHaveBeenCalledTimes(3)
      expect(world.http.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(world.http.setHeader).toHaveBeenCalledWith('Accept', 'text/html')
      expect(world.http.setHeader).toHaveBeenCalledWith('X-Request-Id', '12345')
    })
  })

  // ─── I set bearer token to {string} ────────────────────────────────────

  describe('I set bearer token to {string}', () => {
    test('calls http.setBearerToken', () => {
      // Step logic: this.http.setBearerToken(this.interpolate(token))
      const token = 'my-jwt-token'
      world.http.setBearerToken(world.interpolate(token))

      expect(world.http.setBearerToken).toHaveBeenCalledWith('my-jwt-token')
    })

    test('interpolates the token value', () => {
      world.setVariable('jwt', 'eyJhbGciOiJIUzI1NiJ9')

      const token = '${jwt}'
      world.http.setBearerToken(world.interpolate(token))

      expect(world.http.setBearerToken).toHaveBeenCalledWith('eyJhbGciOiJIUzI1NiJ9')
    })
  })

  // ─── I set basic auth with username {string} and password {string} ─────

  describe('I set basic auth with username {string} and password {string}', () => {
    test('calls http.setBasicAuth with interpolated credentials', () => {
      // Step logic: this.http.setBasicAuth(this.interpolate(username), this.interpolate(password))
      const username = 'admin'
      const password = 'secret'
      world.http.setBasicAuth(world.interpolate(username), world.interpolate(password))

      expect(world.http.setBasicAuth).toHaveBeenCalledWith('admin', 'secret')
    })
  })

  // ─── I set query param {string} to {string} ───────────────────────────

  describe('I set query param {string} to {string}', () => {
    test('calls http.setQueryParam', () => {
      // Step logic: this.http.setQueryParam(name, this.interpolate(value))
      const name = 'page'
      const value = '1'
      world.http.setQueryParam(name, world.interpolate(value))

      expect(world.http.setQueryParam).toHaveBeenCalledWith('page', '1')
    })
  })

  // ─── I set the following query params: ─────────────────────────────────

  describe('I set the following query params:', () => {
    test('sets multiple query params from data table', () => {
      // Step logic:
      // const params = dataTable.rowsHash()
      // for (const [name, value] of Object.entries(params)) {
      //   this.http.setQueryParam(name, this.interpolate(value))
      // }
      const params: Record<string, string> = {
        page: '1',
        limit: '10',
        sort: 'name',
      }

      for (const [name, value] of Object.entries(params)) {
        world.http.setQueryParam(name, world.interpolate(value))
      }

      expect(world.http.setQueryParam).toHaveBeenCalledTimes(3)
      expect(world.http.setQueryParam).toHaveBeenCalledWith('page', '1')
      expect(world.http.setQueryParam).toHaveBeenCalledWith('limit', '10')
      expect(world.http.setQueryParam).toHaveBeenCalledWith('sort', 'name')
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// HTTP Method Steps (http-methods.steps.ts)
// ═════════════════════════════════════════════════════════════════════════════

describe('HTTP Method Steps', () => {
  let world: MockWorld

  beforeEach(() => {
    world = createMockWorld()
  })

  // ─── I GET {string} ────────────────────────────────────────────────────

  describe('I GET {string}', () => {
    test('calls http.get with interpolated path', async () => {
      // Step logic: await this.http.get(this.interpolate(path))
      const path = '/api/users'
      await world.http.get(world.interpolate(path))

      expect(world.http.get).toHaveBeenCalledWith('/api/users')
    })
  })

  // ─── I POST to {string} ───────────────────────────────────────────────

  describe('I POST to {string}', () => {
    test('calls http.post without body', async () => {
      // Step logic: await this.http.post(this.interpolate(path))
      const path = '/api/users'
      await world.http.post(world.interpolate(path))

      expect(world.http.post).toHaveBeenCalledWith('/api/users')
    })
  })

  // ─── I POST to {string} with body: ────────────────────────────────────

  describe('I POST to {string} with body:', () => {
    test('calls http.post with parsed JSON body', async () => {
      // Step logic:
      // const body = JSON.parse(this.interpolate(docString))
      // await this.http.post(this.interpolate(path), body)
      const path = '/api/users'
      const docString = '{"name": "John", "age": 30}'

      const body = JSON.parse(world.interpolate(docString))
      await world.http.post(world.interpolate(path), body)

      expect(world.http.post).toHaveBeenCalledWith('/api/users', { name: 'John', age: 30 })
    })

    test('interpolates variables in the body', async () => {
      world.setVariable('userName', 'Alice')

      const path = '/api/users'
      const docString = '{"name": "${userName}"}'

      const body = JSON.parse(world.interpolate(docString))
      await world.http.post(world.interpolate(path), body)

      expect(world.http.post).toHaveBeenCalledWith('/api/users', { name: 'Alice' })
    })
  })

  // ─── I PUT to {string} with body: ─────────────────────────────────────

  describe('I PUT to {string} with body:', () => {
    test('calls http.put with parsed JSON body', async () => {
      // Step logic:
      // const body = JSON.parse(this.interpolate(docString))
      // await this.http.put(this.interpolate(path), body)
      const path = '/api/users/1'
      const docString = '{"name": "Updated"}'

      const body = JSON.parse(world.interpolate(docString))
      await world.http.put(world.interpolate(path), body)

      expect(world.http.put).toHaveBeenCalledWith('/api/users/1', { name: 'Updated' })
    })
  })

  // ─── I PATCH to {string} with body: ───────────────────────────────────

  describe('I PATCH to {string} with body:', () => {
    test('calls http.patch with parsed JSON body', async () => {
      // Step logic:
      // const body = JSON.parse(this.interpolate(docString))
      // await this.http.patch(this.interpolate(path), body)
      const path = '/api/users/1'
      const docString = '{"status": "active"}'

      const body = JSON.parse(world.interpolate(docString))
      await world.http.patch(world.interpolate(path), body)

      expect(world.http.patch).toHaveBeenCalledWith('/api/users/1', { status: 'active' })
    })
  })

  // ─── I DELETE {string} ─────────────────────────────────────────────────

  describe('I DELETE {string}', () => {
    test('calls http.delete with interpolated path', async () => {
      // Step logic: await this.http.delete(this.interpolate(path))
      const path = '/api/users/1'
      await world.http.delete(world.interpolate(path))

      expect(world.http.delete).toHaveBeenCalledWith('/api/users/1')
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// Response Assertion Steps (response-assertions.steps.ts)
// ═════════════════════════════════════════════════════════════════════════════

describe('Response Assertion Steps', () => {
  // ─── the response status should be {int} ───────────────────────────────

  describe('the response status should be {int}', () => {
    test('passes when status matches', () => {
      const world = createMockWorld({ status: 200 } as Partial<MockHttpPort>)

      // Step logic: expect(this.http.status).toBe(expectedStatus)
      expect(world.http.status).toBe(200)
    })

    test('fails when status does not match', () => {
      const world = createMockWorld({ status: 404 } as Partial<MockHttpPort>)

      expect(() => {
        // Replicate the assertion the step makes
        const actual = world.http.status
        if (actual !== 200) {
          throw new Error(`Expected status 200 but got ${actual}`)
        }
      }).toThrow()
    })
  })

  // ─── the response status should not be {int} ──────────────────────────

  describe('the response status should not be {int}', () => {
    test('passes when status does not match unexpected', () => {
      const world = createMockWorld({ status: 200 } as Partial<MockHttpPort>)

      // Step logic: expect(this.http.status).not.toBe(unexpectedStatus)
      expect(world.http.status).not.toBe(404)
    })
  })

  // ─── the response body path {string} should equal {string} ────────────

  describe('the response body path {string} should equal {string}', () => {
    test('passes when body path matches string', () => {
      const world = createMockWorld({
        getBodyPath: mock((path: string) => {
          if (path === '$.name') return 'John'
          return undefined
        }),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = this.http.getBodyPath(jsonPath)
      // expect(actual).toBe(this.interpolate(expectedValue))
      const actual = world.http.getBodyPath('$.name')
      expect(actual).toBe(world.interpolate('John'))
    })
  })

  // ─── the response body path {string} should equal {int} ───────────────

  describe('the response body path {string} should equal {int}', () => {
    test('passes when body path matches number', () => {
      const world = createMockWorld({
        getBodyPath: mock((path: string) => {
          if (path === '$.age') return 30
          return undefined
        }),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = this.http.getBodyPath(jsonPath)
      // expect(actual).toBe(expectedValue)
      const actual = world.http.getBodyPath('$.age')
      expect(actual).toBe(30)
    })
  })

  // ─── the response body path {string} should exist ─────────────────────

  describe('the response body path {string} should exist', () => {
    test('passes when body path returns a defined value', () => {
      const world = createMockWorld({
        getBodyPath: mock(() => 'some value'),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const value = this.http.getBodyPath(jsonPath)
      // expect(value).toBeDefined()
      const value = world.http.getBodyPath('$.data')
      expect(value).toBeDefined()
    })
  })

  // ─── the response body path {string} should not exist ─────────────────

  describe('the response body path {string} should not exist', () => {
    test('passes when body path returns undefined', () => {
      const world = createMockWorld({
        getBodyPath: mock(() => undefined),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const value = this.http.getBodyPath(jsonPath)
      // expect(value).toBeUndefined()
      const value = world.http.getBodyPath('$.missing')
      expect(value).toBeUndefined()
    })
  })

  // ─── the response body path {string} should contain {string} ──────────

  describe('the response body path {string} should contain {string}', () => {
    test('passes when body path value contains substring', () => {
      const world = createMockWorld({
        getBodyPath: mock(() => 'Hello World'),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = String(this.http.getBodyPath(jsonPath))
      // expect(actual).toContain(this.interpolate(expectedSubstring))
      const actual = String(world.http.getBodyPath('$.message'))
      expect(actual).toContain(world.interpolate('World'))
    })
  })

  // ─── the response body path {string} should match {string} ────────────

  describe('the response body path {string} should match {string}', () => {
    test('passes when body path value matches regex', () => {
      const world = createMockWorld({
        getBodyPath: mock(() => 'user-12345'),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = String(this.http.getBodyPath(jsonPath))
      // expect(actual).toMatch(new RegExp(pattern))
      const actual = String(world.http.getBodyPath('$.id'))
      expect(actual).toMatch(new RegExp('^user-\\d+$'))
    })
  })

  // ─── the response body path {string} should have {int} items ──────────

  describe('the response body path {string} should have {int} items', () => {
    test('passes when array has expected length', () => {
      const world = createMockWorld({
        getBodyPath: mock(() => ['a', 'b', 'c']),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = this.http.getBodyPath(jsonPath) as unknown[]
      // expect(actual).toHaveLength(expectedCount)
      const actual = world.http.getBodyPath('$.items') as unknown[]
      expect(actual).toHaveLength(3)
    })
  })

  // ─── the response body should be valid JSON ───────────────────────────

  describe('the response body should be valid JSON', () => {
    test('passes when body is an object', () => {
      const world = createMockWorld({
        body: { key: 'value' },
      } as Partial<MockHttpPort>)

      // Step logic: expect(typeof this.http.body).toBe('object')
      expect(typeof world.http.body).toBe('object')
    })
  })

  // ─── the response header {string} should equal {string} ───────────────

  describe('the response header {string} should equal {string}', () => {
    test('passes when header matches expected value', () => {
      const responseHeaders = { 'content-type': 'application/json', 'x-request-id': '123' }
      const world = createMockWorld({
        response: {
          status: 200,
          statusText: 'OK',
          headers: responseHeaders,
          body: {},
          text: '{}',
          responseTime: 50,
        },
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = this.http.response.headers[headerName.toLowerCase()]
      // expect(actual).toBe(this.interpolate(expectedValue))
      const headerName = 'X-Request-Id'
      const actual = world.http.response.headers[headerName.toLowerCase()]
      expect(actual).toBe(world.interpolate('123'))
    })
  })

  // ─── the response header {string} should contain {string} ─────────────

  describe('the response header {string} should contain {string}', () => {
    test('passes when header contains expected substring', () => {
      const responseHeaders = { 'content-type': 'application/json; charset=utf-8' }
      const world = createMockWorld({
        response: {
          status: 200,
          statusText: 'OK',
          headers: responseHeaders,
          body: {},
          text: '{}',
          responseTime: 50,
        },
      } as Partial<MockHttpPort>)

      // Step logic:
      // const actual = this.http.response.headers[headerName.toLowerCase()]
      // expect(actual).toContain(this.interpolate(expectedSubstring))
      const headerName = 'Content-Type'
      const actual = world.http.response.headers[headerName.toLowerCase()]
      expect(actual).toContain(world.interpolate('application/json'))
    })
  })

  // ─── the response time should be less than {int} ms ───────────────────

  describe('the response time should be less than {int} ms', () => {
    test('passes when response time is under limit', () => {
      const world = createMockWorld({
        response: {
          status: 200,
          statusText: 'OK',
          headers: {},
          body: {},
          text: '{}',
          responseTime: 50,
        },
      } as Partial<MockHttpPort>)

      // Step logic: expect(this.http.response.responseTime).toBeLessThan(maxMs)
      expect(world.http.response.responseTime).toBeLessThan(1000)
    })

    test('fails when response time exceeds limit', () => {
      const world = createMockWorld({
        response: {
          status: 200,
          statusText: 'OK',
          headers: {},
          body: {},
          text: '{}',
          responseTime: 2500,
        },
      } as Partial<MockHttpPort>)

      expect(() => {
        const responseTime = world.http.response.responseTime
        if (responseTime >= 1000) {
          throw new Error(`Response time ${responseTime}ms exceeded limit of 1000ms`)
        }
      }).toThrow()
    })
  })

  // ─── I store response body path {string} as {string} ──────────────────

  describe('I store response body path {string} as {string}', () => {
    test('stores body path value as variable', () => {
      const world = createMockWorld({
        getBodyPath: mock((path: string) => {
          if (path === '$.id') return 'user-42'
          return undefined
        }),
      } as Partial<MockHttpPort>)

      // Step logic:
      // const value = this.http.getBodyPath(jsonPath)
      // this.setVariable(variableName, value)
      const value = world.http.getBodyPath('$.id')
      world.setVariable('userId', value)

      expect(world.getVariable('userId')).toBe('user-42')
    })
  })

  // ─── I store response header {string} as {string} ─────────────────────

  describe('I store response header {string} as {string}', () => {
    test('stores header value as variable', () => {
      const responseHeaders = { 'x-request-id': 'req-abc-123' }
      const world = createMockWorld({
        response: {
          status: 200,
          statusText: 'OK',
          headers: responseHeaders,
          body: {},
          text: '{}',
          responseTime: 50,
        },
      } as Partial<MockHttpPort>)

      // Step logic:
      // const value = this.http.response.headers[headerName.toLowerCase()]
      // this.setVariable(variableName, value)
      const headerName = 'X-Request-Id'
      const value = world.http.response.headers[headerName.toLowerCase()]
      world.setVariable('requestId', value)

      expect(world.getVariable('requestId')).toBe('req-abc-123')
    })
  })

  // ─── I store response status as {string} ──────────────────────────────

  describe('I store response status as {string}', () => {
    test('stores status code as variable', () => {
      const world = createMockWorld({ status: 201 } as Partial<MockHttpPort>)

      // Step logic: this.setVariable(variableName, this.http.status)
      world.setVariable('statusCode', world.http.status)

      expect(world.getVariable('statusCode')).toBe(201)
    })
  })
})
