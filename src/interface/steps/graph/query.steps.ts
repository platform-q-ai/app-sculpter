import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'
import type { GraphNode } from '../../../domain/entities/index.ts'

Then<TestWorld>(
  'the node count should be {int}',
  function (expectedCount: number) {
    const nodes = this.getVariable<GraphNode[]>('_lastNodes')
    expect(nodes).toHaveLength(expectedCount)
  },
)

Then<TestWorld>(
  'the node count should be greater than {int}',
  function (minCount: number) {
    const nodes = this.getVariable<GraphNode[]>('_lastNodes')
    expect(nodes.length).toBeGreaterThan(minCount)
  },
)

Then<TestWorld>(
  'a node named {string} should exist',
  function (name: string) {
    const nodes = this.getVariable<GraphNode[]>('_lastNodes')
    const found = nodes.find((n) => n.name === this.interpolate(name))
    expect(found).toBeDefined()
  },
)

Then<TestWorld>(
  'a node named {string} should not exist',
  function (name: string) {
    const nodes = this.getVariable<GraphNode[]>('_lastNodes')
    const found = nodes.find((n) => n.name === this.interpolate(name))
    expect(found).toBeUndefined()
  },
)

Then<TestWorld>(
  'the query result count should be {int}',
  function (expectedCount: number) {
    const results = this.getVariable<unknown[]>('_lastQueryResults')
    expect(results).toHaveLength(expectedCount)
  },
)

Then<TestWorld>(
  'I store node count as {string}',
  function (variableName: string) {
    const nodes = this.getVariable<GraphNode[]>('_lastNodes')
    this.setVariable(variableName, nodes.length)
  },
)
