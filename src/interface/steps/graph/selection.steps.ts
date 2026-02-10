import { Given, When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'
import type { NodeType } from '../../../domain/value-objects/index.ts'

Given<TestWorld>(
  'I query nodes in layer {string}',
  async function (layer: string) {
    const nodes = await this.graph.getNodesInLayer(this.interpolate(layer))
    this.setVariable('_lastNodes', nodes)
  },
)

Given<TestWorld>(
  'I query {string} nodes in layer {string}',
  async function (type: string, layer: string) {
    const nodes = await this.graph.getNodesInLayer(this.interpolate(layer), type as NodeType)
    this.setVariable('_lastNodes', nodes)
  },
)

When<TestWorld>(
  'I query classes implementing {string}',
  async function (interfaceName: string) {
    const nodes = await this.graph.getClassesImplementing(this.interpolate(interfaceName))
    this.setVariable('_lastNodes', nodes)
  },
)

When<TestWorld>(
  'I execute Cypher query:',
  async function (docString: string) {
    const results = await this.graph.query(this.interpolate(docString))
    this.setVariable('_lastQueryResults', results)
  },
)

When<TestWorld>(
  'I execute Cypher query {string}',
  async function (cypher: string) {
    const results = await this.graph.query(this.interpolate(cypher))
    this.setVariable('_lastQueryResults', results)
  },
)
