import type { GraphNode, Dependency, Cycle } from '../../domain/entities/index.ts'
import type { NodeType } from '../../domain/value-objects/index.ts'

export interface GraphPort {
  // Connection
  connect(): Promise<void>
  disconnect(): Promise<void>

  // Queries
  query<T>(cypher: string, params?: Record<string, unknown>): Promise<T[]>

  // High-level helpers
  getNodesInLayer(layer: string, type?: NodeType): Promise<GraphNode[]>
  getLayerDependencies(from: string, to: string): Promise<Dependency[]>
  findCircularDependencies(): Promise<Cycle[]>
  getClassesImplementing(interfaceName: string): Promise<GraphNode[]>

  // Lifecycle
  dispose(): Promise<void>
}
