// Configuration
export { defineConfig, loadConfig } from './application/config/index.ts'
export type {
  ExternBddConfig,
  HttpAdapterConfig,
  BrowserAdapterConfig,
  CliAdapterConfig,
  GraphAdapterConfig,
  SecurityAdapterConfig,
} from './application/config/index.ts'

// Ports (for custom adapter implementations)
export type { HttpPort } from './application/ports/index.ts'
export type { BrowserPort, WaitOptions } from './application/ports/index.ts'
export type { CliPort } from './application/ports/index.ts'
export type { GraphPort } from './application/ports/index.ts'
export type { SecurityPort } from './application/ports/index.ts'

// Factories
export { createAdapters } from './infrastructure/factories/index.ts'
export type { Adapters } from './infrastructure/factories/index.ts'

// World
export { TestWorld } from './interface/world/index.ts'

// Domain types
export type {
  HttpResponse,
  HttpRequest,
  CommandResult,
  GraphNode,
  Dependency,
  Cycle,
  SecurityAlert,
  ConfidenceLevel,
  ScanResult,
  SpiderResult,
  HeaderCheckResult,
  SslCheckResult,
  Variable,
} from './domain/entities/index.ts'

export { RiskLevel } from './domain/value-objects/index.ts'
export type { NodeType } from './domain/value-objects/index.ts'
export { JsonPath } from './domain/value-objects/index.ts'

// Errors
export { DomainError, VariableNotFoundError, AdapterNotConfiguredError } from './domain/errors/index.ts'

// Services (for advanced usage)
export { VariableService } from './application/services/index.ts'
export { InterpolationService } from './application/services/index.ts'
