import type { NodeType } from '../value-objects/NodeType.ts'

export interface GraphNode {
  readonly name: string
  readonly fqn: string
  readonly type: NodeType
  readonly layer?: string
  readonly file?: string
}

export interface Dependency {
  readonly from: GraphNode
  readonly to: GraphNode
  readonly type: string
}

export interface Cycle {
  readonly nodes: GraphNode[]
  readonly path: string[]
}
