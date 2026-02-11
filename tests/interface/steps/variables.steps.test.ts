import { test, expect, describe, beforeEach } from 'bun:test'
import { VariableService } from '../../../src/application/services/VariableService.ts'
import { InterpolationService } from '../../../src/application/services/InterpolationService.ts'

/**
 * Tests for variable step definition logic.
 *
 * We do NOT import the step definition files (they register with Cucumber).
 * Instead, we create a mock world object with the same methods the step handlers
 * call, and replicate the handler logic inline per test.
 */

interface MockWorld {
  setVariable(name: string, value: unknown): void
  getVariable(name: string): unknown
  hasVariable(name: string): boolean
  interpolate(text: string): string
}

function createMockWorld(): MockWorld {
  const variableService = new VariableService()
  const interpolationService = new InterpolationService(variableService)
  return {
    setVariable: (name, value) => variableService.set(name, value),
    getVariable: (name) => variableService.get(name),
    hasVariable: (name) => variableService.has(name),
    interpolate: (text) => interpolationService.interpolate(text),
  }
}

describe('Variable Steps', () => {
  let world: MockWorld

  beforeEach(() => {
    world = createMockWorld()
  })

  // ─── Given 'I set variable {string} to {string}' ──────────────────────

  describe('I set variable {string} to {string}', () => {
    test('stores a string value', () => {
      // Step logic: this.setVariable(name, this.interpolate(value))
      const name = 'greeting'
      const value = 'hello'
      world.setVariable(name, world.interpolate(value))

      expect(world.getVariable('greeting')).toBe('hello')
    })

    test('interpolates the value before storing', () => {
      // Set a variable that will be referenced in interpolation
      world.setVariable('host', 'localhost')

      // Step logic: this.setVariable(name, this.interpolate(value))
      const name = 'url'
      const value = 'http://${host}/api'
      world.setVariable(name, world.interpolate(value))

      expect(world.getVariable('url')).toBe('http://localhost/api')
    })
  })

  // ─── Given 'I set variable {string} to {int}' ─────────────────────────

  describe('I set variable {string} to {int}', () => {
    test('stores a numeric value', () => {
      // Step logic: this.setVariable(name, value)
      const name = 'count'
      const value = 42
      world.setVariable(name, value)

      expect(world.getVariable('count')).toBe(42)
    })
  })

  // ─── Given 'I set variable {string} to:' (doc string) ─────────────────

  describe('I set variable {string} to: (doc string)', () => {
    test('parses valid JSON doc string', () => {
      // Step logic:
      // try { this.setVariable(name, JSON.parse(this.interpolate(docString))) }
      // catch { this.setVariable(name, this.interpolate(docString)) }
      const name = 'payload'
      const docString = '{"key": "value", "num": 123}'

      try {
        world.setVariable(name, JSON.parse(world.interpolate(docString)))
      } catch {
        world.setVariable(name, world.interpolate(docString))
      }

      const stored = world.getVariable('payload') as Record<string, unknown>
      expect(stored).toEqual({ key: 'value', num: 123 })
    })

    test('falls back to plain string for non-JSON doc string', () => {
      const name = 'message'
      const docString = 'This is just plain text, not JSON'

      try {
        world.setVariable(name, JSON.parse(world.interpolate(docString)))
      } catch {
        world.setVariable(name, world.interpolate(docString))
      }

      expect(world.getVariable('message')).toBe('This is just plain text, not JSON')
    })
  })

  // ─── Then 'the variable {string} should equal {string}' ───────────────

  describe('the variable {string} should equal {string}', () => {
    test('passes when values match', () => {
      world.setVariable('color', 'blue')

      // Step logic:
      // const actual = this.getVariable(name)
      // expect(actual).toBe(this.interpolate(expected))
      const actual = world.getVariable('color')
      expect(actual).toBe(world.interpolate('blue'))
    })

    test('fails when values do not match', () => {
      world.setVariable('color', 'blue')

      const actual = world.getVariable('color')
      expect(() => {
        const check = world.interpolate('red')
        // Replicate the assertion the step makes
        if (actual !== check) {
          throw new Error(`Expected "red" but got "${actual}"`)
        }
      }).toThrow()
    })
  })

  // ─── Then 'the variable {string} should equal {int}' ──────────────────

  describe('the variable {string} should equal {int}', () => {
    test('passes when numeric values match', () => {
      world.setVariable('count', 99)

      // Step logic:
      // const actual = this.getVariable(name)
      // expect(actual).toBe(expected)
      const actual = world.getVariable('count')
      expect(actual).toBe(99)
    })
  })

  // ─── Then 'the variable {string} should exist' ────────────────────────

  describe('the variable {string} should exist', () => {
    test('passes when variable exists', () => {
      world.setVariable('token', 'abc123')

      // Step logic: expect(this.hasVariable(name)).toBe(true)
      expect(world.hasVariable('token')).toBe(true)
    })
  })

  // ─── Then 'the variable {string} should not exist' ────────────────────

  describe('the variable {string} should not exist', () => {
    test('passes when variable does not exist', () => {
      // Step logic: expect(this.hasVariable(name)).toBe(false)
      expect(world.hasVariable('nonexistent')).toBe(false)
    })
  })

  // ─── Then 'the variable {string} should contain {string}' ─────────────

  describe('the variable {string} should contain {string}', () => {
    test('passes when variable value contains substring', () => {
      world.setVariable('message', 'Hello, World!')

      // Step logic:
      // const actual = String(this.getVariable(name))
      // expect(actual).toContain(this.interpolate(expected))
      const actual = String(world.getVariable('message'))
      expect(actual).toContain(world.interpolate('World'))
    })
  })

  // ─── Then 'the variable {string} should match {string}' ───────────────

  describe('the variable {string} should match {string}', () => {
    test('passes when variable value matches regex', () => {
      world.setVariable('email', 'test@example.com')

      // Step logic:
      // const actual = String(this.getVariable(name))
      // expect(actual).toMatch(new RegExp(pattern))
      const actual = String(world.getVariable('email'))
      expect(actual).toMatch(new RegExp('^\\S+@\\S+\\.\\S+$'))
    })

    test('fails when variable value does not match regex', () => {
      world.setVariable('email', 'not-an-email')

      const actual = String(world.getVariable('email'))
      expect(() => {
        const regex = new RegExp('^\\S+@\\S+\\.\\S+$')
        if (!regex.test(actual)) {
          throw new Error(`Expected "${actual}" to match pattern`)
        }
      }).toThrow()
    })
  })
})
