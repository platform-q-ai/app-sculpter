import { test, expect, describe } from 'bun:test'
import { BunCliAdapter } from '../../src/infrastructure/adapters/cli/BunCliAdapter.ts'

describe('BunCliAdapter', () => {
  test('run executes a command and captures stdout', async () => {
    const adapter = new BunCliAdapter({})
    const result = await adapter.run('echo "hello world"')
    expect(result.stdout.trim()).toBe('hello world')
    expect(result.exitCode).toBe(0)
  })

  test('run captures stderr', async () => {
    const adapter = new BunCliAdapter({})
    const result = await adapter.run('echo "error" >&2')
    expect(result.stderr.trim()).toBe('error')
  })

  test('run captures non-zero exit codes', async () => {
    const adapter = new BunCliAdapter({})
    const result = await adapter.run('exit 1')
    expect(result.exitCode).toBe(1)
  })

  test('run records duration', async () => {
    const adapter = new BunCliAdapter({})
    const result = await adapter.run('echo ok')
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  test('setEnv sets environment variables', async () => {
    const adapter = new BunCliAdapter({})
    adapter.setEnv('MY_TEST_VAR', 'test_value')
    const result = await adapter.run('echo $MY_TEST_VAR')
    expect(result.stdout.trim()).toBe('test_value')
  })

  test('setWorkingDir changes working directory', async () => {
    const adapter = new BunCliAdapter({})
    adapter.setWorkingDir('/tmp')
    const result = await adapter.run('pwd')
    expect(result.stdout.trim()).toBe('/tmp')
  })

  test('result accessor returns last result', async () => {
    const adapter = new BunCliAdapter({})
    await adapter.run('echo "test"')
    expect(adapter.stdout.trim()).toBe('test')
    expect(adapter.exitCode).toBe(0)
  })

  test('runWithStdin sends stdin to command', async () => {
    const adapter = new BunCliAdapter({})
    const result = await adapter.runWithStdin('cat', 'hello from stdin')
    expect(result.stdout).toBe('hello from stdin')
  })

  test('chaining setEnv calls', async () => {
    const adapter = new BunCliAdapter({})
    adapter.setEnv('A', '1').setEnv('B', '2')
    const result = await adapter.run('echo "$A $B"')
    expect(result.stdout.trim()).toBe('1 2')
  })
})
