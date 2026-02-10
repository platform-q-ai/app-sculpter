import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'
import type { GraphNode, Cycle } from '../../../domain/entities/index.ts'

// Layer Dependency Assertions (use context from "Given the layer ...")
Then<TestWorld>('it should not depend on layer {string}', async function (targetLayer: string) {
  const currentLayer = this.getVariable<string>('_currentLayer')
  const deps = await this.graph.getLayerDependencies(currentLayer, this.interpolate(targetLayer))
  expect(deps).toHaveLength(0)
})

Then<TestWorld>('it should only depend on layer {string}', async function (allowedLayer: string) {
  const currentLayer = this.getVariable<string>('_currentLayer')
  const allowed = this.interpolate(allowedLayer)
  // Get all layers this layer depends on
  const allNodes = await this.graph.getNodesInLayer(currentLayer)
  for (const node of allNodes) {
    const deps = await this.graph.getDependencies(node.fqn)
    for (const dep of deps) {
      if (dep.to.layer && dep.to.layer !== currentLayer) {
        expect(dep.to.layer).toBe(allowed)
      }
    }
  }
})

Then<TestWorld>('it should only depend on layers:', async function (docString: string) {
  const currentLayer = this.getVariable<string>('_currentLayer')
  const allowedLayers = docString.split('\n').map((l) => l.trim()).filter(Boolean)
  const allNodes = await this.graph.getNodesInLayer(currentLayer)
  for (const node of allNodes) {
    const deps = await this.graph.getDependencies(node.fqn)
    for (const dep of deps) {
      if (dep.to.layer && dep.to.layer !== currentLayer) {
        expect(allowedLayers).toContain(dep.to.layer)
      }
    }
  }
})

Then<TestWorld>('it may depend on layer {string}', async function (_allowedLayer: string) {
  // This is a permissive assertion - just documents that the dependency is allowed
  // No assertion needed, the step exists for documentation purposes
})

Then<TestWorld>('dependencies on layer {string} should only be interfaces', async function (targetLayer: string) {
  const currentLayer = this.getVariable<string>('_currentLayer')
  const deps = await this.graph.getLayerDependencies(currentLayer, this.interpolate(targetLayer))
  for (const dep of deps) {
    expect(dep.to.type).toBe('interface')
  }
})

// Circular Dependency Detection
Then<TestWorld>('no cycles should be found', function () {
  const cycles = this.getVariable<Cycle[]>('_cycles')
  expect(cycles).toHaveLength(0)
})

Then<TestWorld>('there should be no circular dependencies', async function () {
  const cycles = await this.graph.findCircularDependencies()
  expect(cycles).toHaveLength(0)
})

// Interface Assertions (use context from "Given all classes ...")
Then<TestWorld>('each should implement an interface', async function () {
  const nodes = this.getVariable<GraphNode[]>('_selectedNodes')
  const noInterface = await this.graph.getClassesNotImplementingAnyInterface()
  const noInterfaceFqns = new Set(noInterface.map((n) => n.fqn))
  for (const node of nodes) {
    expect(noInterfaceFqns.has(node.fqn)).toBe(false)
  }
})

Then<TestWorld>('each should implement an interface from layer {string}', async function (layer: string) {
  const nodes = this.getVariable<GraphNode[]>('_selectedNodes')
  const interfaces = await this.graph.getInterfacesInLayer(this.interpolate(layer))
  const interfaceNames = new Set(interfaces.map((i) => i.name))
  for (const node of nodes) {
    const deps = await this.graph.getDependencies(node.fqn)
    const implementsFromLayer = deps.some(
      (d) => d.type === 'implements' && interfaceNames.has(d.to.name),
    )
    expect(implementsFromLayer).toBe(true)
  }
})

Then<TestWorld>('each should implement an interface matching {string}', async function (pattern: string) {
  const nodes = this.getVariable<GraphNode[]>('_selectedNodes')
  const regex = new RegExp(this.interpolate(pattern))
  for (const node of nodes) {
    const deps = await this.graph.getDependencies(node.fqn)
    const implementsMatching = deps.some(
      (d) => d.type === 'implements' && regex.test(d.to.name),
    )
    expect(implementsMatching).toBe(true)
  }
})

Then<TestWorld>(
  'classes implementing {string} should be in layer {string}',
  async function (interfaceName: string, expectedLayer: string) {
    const classes = await this.graph.getClassesImplementing(this.interpolate(interfaceName))
    for (const cls of classes) {
      expect(cls.layer).toBe(this.interpolate(expectedLayer))
    }
  },
)

// Import Assertions
Then<TestWorld>('imports should only be interfaces', async function () {
  const nodes = this.getVariable<GraphNode[]>('_selectedNodes')
  for (const node of nodes) {
    const deps = await this.graph.getDependencies(node.fqn)
    const imports = deps.filter((d) => d.type === 'imports')
    for (const imp of imports) {
      expect(imp.to.type).toBe('interface')
    }
  }
})

Then<TestWorld>('there should be no direct imports from layer {string}', async function (targetLayer: string) {
  const currentLayer = this.getVariable<string>('_currentLayer')
  const deps = await this.graph.getLayerDependencies(currentLayer, this.interpolate(targetLayer))
  const directImports = deps.filter((d) => d.type === 'imports')
  expect(directImports).toHaveLength(0)
})
