import { test, expect, describe } from 'bun:test'
import { RiskLevel } from '../../src/domain/value-objects/RiskLevel.ts'
import { JsonPath } from '../../src/domain/value-objects/JsonPath.ts'

describe('RiskLevel', () => {
  test('compare returns positive when first is higher', () => {
    expect(RiskLevel.compare('High', 'Low')).toBeGreaterThan(0)
  })

  test('compare returns negative when first is lower', () => {
    expect(RiskLevel.compare('Low', 'High')).toBeLessThan(0)
  })

  test('compare returns zero for same levels', () => {
    expect(RiskLevel.compare('Medium', 'Medium')).toBe(0)
  })

  test('isAtLeast returns true when level meets threshold', () => {
    expect(RiskLevel.isAtLeast('High', 'Medium')).toBe(true)
  })

  test('isAtLeast returns false when level is below threshold', () => {
    expect(RiskLevel.isAtLeast('Low', 'High')).toBe(false)
  })

  test('isAtLeast returns true for equal levels', () => {
    expect(RiskLevel.isAtLeast('Medium', 'Medium')).toBe(true)
  })
})

describe('JsonPath', () => {
  test('creates valid JsonPath starting with $', () => {
    const path = new JsonPath('$.store.book[0].title')
    expect(path.expression).toBe('$.store.book[0].title')
  })

  test('throws for path not starting with $', () => {
    expect(() => new JsonPath('store.book')).toThrow('JSONPath must start with $')
  })

  test('toString returns expression', () => {
    const path = new JsonPath('$.name')
    expect(path.toString()).toBe('$.name')
  })
})
