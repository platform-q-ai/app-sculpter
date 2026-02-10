import type { CommandResult } from '../../domain/entities/index.ts'

export interface CliPort {
  // Environment
  setEnv(name: string, value: string): this
  setWorkingDir(dir: string): this

  // Execution
  run(command: string): Promise<CommandResult>
  runWithStdin(command: string, stdin: string): Promise<CommandResult>

  // Result accessors
  readonly result: CommandResult
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: number

  // Lifecycle
  dispose(): Promise<void>
}
