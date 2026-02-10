import { World, type IWorldOptions } from '@cucumber/cucumber'
import type { HttpPort, BrowserPort, CliPort, GraphPort, SecurityPort } from '../../application/ports/index.ts'
import { VariableService } from '../../application/services/VariableService.ts'
import { InterpolationService } from '../../application/services/InterpolationService.ts'

export class TestWorld extends World {
  // Adapters (attached in Before hook)
  http!: HttpPort
  browser!: BrowserPort
  cli!: CliPort
  graph!: GraphPort
  security!: SecurityPort

  // Shared state
  variables: Map<string, unknown> = new Map()

  // Services
  private variableService = new VariableService()
  private interpolationService = new InterpolationService(this.variableService)

  constructor(options: IWorldOptions) {
    super(options)
  }

  setVariable(name: string, value: unknown): void {
    this.variableService.set(name, value)
  }

  getVariable<T>(name: string): T {
    return this.variableService.get<T>(name)
  }

  hasVariable(name: string): boolean {
    return this.variableService.has(name)
  }

  interpolate(text: string): string {
    return this.interpolationService.interpolate(text)
  }

  reset(): void {
    this.variableService.clear()
  }
}
