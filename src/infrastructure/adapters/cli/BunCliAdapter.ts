import type { CliPort } from '../../../application/ports/index.ts'
import type { CliAdapterConfig } from '../../../application/config/index.ts'
import type { CommandResult } from '../../../domain/entities/index.ts'

export class BunCliAdapter implements CliPort {
  private env: Record<string, string> = {}
  private workingDir: string
  private _result!: CommandResult

  constructor(private readonly config: CliAdapterConfig) {
    this.workingDir = config.workingDir ?? process.cwd()
    if (config.env) {
      Object.assign(this.env, config.env)
    }
  }

  setEnv(name: string, value: string): this {
    this.env[name] = value
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

  async dispose(): Promise<void> {
    // No cleanup needed for CLI adapter
  }
}
