import neo4j, { type Driver, type Session } from 'neo4j-driver'
import type { GraphPort } from '../../../application/ports/index.ts'
import type { GraphAdapterConfig } from '../../../application/config/index.ts'
import type { GraphNode, Dependency, Cycle } from '../../../domain/entities/index.ts'
import type { NodeType } from '../../../domain/value-objects/index.ts'

export class Neo4jGraphAdapter implements GraphPort {
  private driver!: Driver
  private session!: Session

  constructor(private readonly config: GraphAdapterConfig) {}

  async connect(): Promise<void> {
    this.driver = neo4j.driver(
      this.config.uri,
      neo4j.auth.basic(this.config.username, this.config.password),
    )
    this.session = this.driver.session({
      database: this.config.database ?? 'neo4j',
    })
  }

  async disconnect(): Promise<void> {
    await this.session?.close()
    await this.driver?.close()
  }

  async query<T>(cypher: string, params?: Record<string, unknown>): Promise<T[]> {
    const result = await this.session.run(cypher, params)
    return result.records.map((record) => record.toObject() as T)
  }

  async getNodesInLayer(layer: string, type?: NodeType): Promise<GraphNode[]> {
    const typeFilter = type ? 'AND n.type = $type' : ''
    const cypher = `
      MATCH (n:Node)
      WHERE n.layer = $layer ${typeFilter}
      RETURN n.name AS name, n.fqn AS fqn, n.type AS type, n.layer AS layer, n.file AS file
    `
    const results = await this.query<GraphNode>(cypher, { layer, type })
    return results
  }

  async getLayerDependencies(from: string, to: string): Promise<Dependency[]> {
    const cypher = `
      MATCH (a:Node)-[r:DEPENDS_ON]->(b:Node)
      WHERE a.layer = $from AND b.layer = $to
      RETURN a AS \`from\`, b AS \`to\`, type(r) AS type
    `
    const results = await this.query<Dependency>(cypher, { from, to })
    return results
  }

  async findCircularDependencies(): Promise<Cycle[]> {
    const cypher = `
      MATCH path = (n:Node)-[:DEPENDS_ON*2..10]->(n)
      WITH nodes(path) AS pathNodes
      RETURN pathNodes AS nodes,
             [node IN pathNodes | node.fqn] AS path
      LIMIT 100
    `
    const results = await this.query<Cycle>(cypher)
    return results
  }

  async getClassesImplementing(interfaceName: string): Promise<GraphNode[]> {
    const cypher = `
      MATCH (n:Node)-[:IMPLEMENTS]->(i:Node)
      WHERE i.name = $interfaceName
      RETURN n.name AS name, n.fqn AS fqn, n.type AS type, n.layer AS layer, n.file AS file
    `
    const results = await this.query<GraphNode>(cypher, { interfaceName })
    return results
  }

  async dispose(): Promise<void> {
    await this.disconnect()
  }
}
