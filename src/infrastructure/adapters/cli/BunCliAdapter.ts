import type { CliPort } from '../../../application/ports/index.ts'
import type { CliAdapterConfig } from '../../../application/config/index.ts'
import type { CommandResult } from '../../../domain/entities/index.ts'

export class BunCliAdapter implements CliPort {
  private env: Record<string, string> = {}
  private workingDir: string
  private _result!: CommandResult

  constructor(readonly config: CliAdapterConfig) {
    this.workingDir = config.workingDir ?? process.cwd()
    if (config.env) {
      Object.assign(this.env, config.env)
    }
  }

  setEnv(name: string, value: string): this {
    this.env[name] = value
    return this
  }

  setEnvs(env: Record<string, string>): this {
    Object.assign(this.env, env)
    return this
  }

  clearEnv(name: string): this {
    delete this.env[name]
    return this
  }

  setWorkingDir(dir: string): this {
    this.workingDir = dir
    return this
  }

  async run(command: string): Promise<CommandResult> {
    const startTime = Date.now()

    const proc = Bun.spawn(['sh', '-c', command], {
      cwd: this.workingDir,
      env: { ...process.env, ...this.env },
      stdout: 'pipe',
      stderr: 'pipe',
    })

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ])

    const exitCode = await proc.exited

    this._result = {
      stdout,
      stderr,
      exitCode,
      duration: Date.now() - startTime,
    }

    return this._result
  }

  async runWithStdin(command: string, stdin: string): Promise<CommandResult> {
    const startTime = Date.now()

    const proc = Bun.spawn(['sh', '-c', command], {
      cwd: this.workingDir,
      env: { ...process.env, ...this.env },
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    })

    proc.stdin.write(stdin)
    proc.stdin.end()

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ])

    const exitCode = await proc.exited

    this._result = {
      stdout,
      stderr,
      exitCode,
      duration: Date.now() - startTime,
    }

    return this._result
  }

  async runWithTimeout(command: string, timeoutMs: number): Promise<CommandResult> {
    const startTime = Date.now()

    const proc = Bun.spawn(['sh', '-c', command], {
      cwd: this.workingDir,
      env: { ...process.env, ...this.env },
      stdout: 'pipe',
      stderr: 'pipe',
    })

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        proc.kill()
        reject(new Error(`Command timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    try {
      const [stdout, stderr] = await Promise.race([
        Promise.all([
          new Response(proc.stdout).text(),
          new Response(proc.stderr).text(),
        ]),
        timeoutPromise,
      ]) as [string, string]

      const exitCode = await proc.exited

      this._result = {
        stdout,
        stderr,
        exitCode,
        duration: Date.now() - startTime,
      }

      return this._result
    } catch (error) {
      this._result = {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Command timed out',
        exitCode: 124,
        duration: Date.now() - startTime,
      }
      return this._result
    }
  }

  get result(): CommandResult {
    return this._result
  }

  get stdout(): string {
    return this._result.stdout
  }

  get stderr(): string {
    return this._result.stderr
  }

  get exitCode(): number {
    return this._result.exitCode
  }

  get duration(): number {
    return this._result.duration
  }

  stdoutLine(lineNumber: number): string {
    const lines = this._result.stdout.split('\n')
    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(`Line ${lineNumber} does not exist (stdout has ${lines.length} lines)`)
    }
    return lines[lineNumber - 1]!
  }

  stdoutMatching(pattern: RegExp): string | null {
    const match = this._result.stdout.match(pattern)
    return match ? (match[1] ?? match[0]) : null
  }

  async dispose(): Promise<void> {
    // No cleanup needed for CLI adapter
  }
}
