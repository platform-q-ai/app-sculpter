import { test, expect, describe } from 'bun:test'
import { VariableService } from '../../src/application/services/VariableService.ts'
import { InterpolationService } from '../../src/application/services/InterpolationService.ts'
import { VariableNotFoundError } from '../../src/domain/errors/index.ts'

describe('VariableService', () => {
  test('set and get a variable', () => {
    const service = new VariableService()
    service.set('name', 'test')
    expect(service.get('name')).toBe('test')
  })

  test('get typed variable', () => {
    const service = new VariableService()
    service.set('count', 42)
    expect(service.get<number>('count')).toBe(42)
  })

  test('throws VariableNotFoundError for missing variable', () => {
    const service = new VariableService()
    expect(() => service.get('missing')).toThrow(VariableNotFoundError)
  })

  test('has returns true for existing variable', () => {
    const service = new VariableService()
    service.set('key', 'value')
    expect(service.has('key')).toBe(true)
  })

  test('has returns false for missing variable', () => {
    const service = new VariableService()
    expect(service.has('missing')).toBe(false)
  })

  test('clear removes all variables', () => {
    const service = new VariableService()
    service.set('a', 1)
    service.set('b', 2)
    service.clear()
    expect(service.has('a')).toBe(false)
    expect(service.has('b')).toBe(false)
  })
})

describe('InterpolationService', () => {
  test('interpolates user-defined variables', () => {
    const vars = new VariableService()
    vars.set('name', 'World')
    const service = new InterpolationService(vars)
    expect(service.interpolate('Hello ${name}!')).toBe('Hello World!')
  })

  test('interpolates multiple variables', () => {
    const vars = new VariableService()
    vars.set('first', 'John')
    vars.set('last', 'Doe')
    const service = new InterpolationService(vars)
    expect(service.interpolate('${first} ${last}')).toBe('John Doe')
  })

  test('interpolates timestamp as number string', () => {
    const vars = new VariableService()
    const service = new InterpolationService(vars)
    const result = service.interpolate('${timestamp}')
    expect(Number(result)).toBeGreaterThan(0)
  })

  test('interpolates uuid as valid UUID', () => {
    const vars = new VariableService()
    const service = new InterpolationService(vars)
    const result = service.interpolate('${uuid}')
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  test('interpolates random_email', () => {
    const vars = new VariableService()
    const service = new InterpolationService(vars)
    const result = service.interpolate('${random_email}')
    expect(result).toMatch(/^test_\w+@example\.com$/)
  })

  test('interpolates random_string', () => {
    const vars = new VariableService()
    const service = new InterpolationService(vars)
    const result = service.interpolate('${random_string}')
    expect(result.length).toBe(8)
  })

  test('leaves text without variables unchanged', () => {
    const vars = new VariableService()
    const service = new InterpolationService(vars)
    expect(service.interpolate('no variables here')).toBe('no variables here')
  })

  test('throws for undefined user variable', () => {
    const vars = new VariableService()
    const service = new InterpolationService(vars)
    expect(() => service.interpolate('${unknown}')).toThrow(VariableNotFoundError)
  })
})
