import { test, expect, describe } from 'bun:test'
import { VariableNotFoundError } from '../../src/domain/errors/VariableNotFoundError.ts'
import { AdapterNotConfiguredError } from '../../src/domain/errors/AdapterNotConfiguredError.ts'
import { DomainError } from '../../src/domain/errors/DomainError.ts'

describe('VariableNotFoundError', () => {
  test('has correct code', () => {
    const error = new VariableNotFoundError('myVar')
    expect(error.code).toBe('VARIABLE_NOT_FOUND')
  })

  test('has descriptive message', () => {
    const error = new VariableNotFoundError('myVar')
    expect(error.message).toBe('Variable "myVar" is not defined')
  })

  test('extends DomainError', () => {
    const error = new VariableNotFoundError('myVar')
    expect(error).toBeInstanceOf(DomainError)
    expect(error).toBeInstanceOf(Error)
  })
})

describe('AdapterNotConfiguredError', () => {
  test('has correct code', () => {
    const error = new AdapterNotConfiguredError('http')
    expect(error.code).toBe('ADAPTER_NOT_CONFIGURED')
  })

  test('has descriptive message', () => {
    const error = new AdapterNotConfiguredError('http')
    expect(error.message).toBe('Adapter "http" is not configured')
  })

  test('extends DomainError', () => {
    const error = new AdapterNotConfiguredError('http')
    expect(error).toBeInstanceOf(DomainError)
  })
})
