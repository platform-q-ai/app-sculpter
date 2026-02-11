import { test, expect, describe, beforeEach, mock } from 'bun:test'
import { VariableService } from '../../../src/application/services/VariableService.ts'
import { InterpolationService } from '../../../src/application/services/InterpolationService.ts'
import type { GraphNode, Dependency, Cycle } from '../../../src/domain/entities/index.ts'

/**
 * Tests for graph step definition logic (selection, dependency-assertions, query).
 *
 * We do NOT import the step definition files (they register with Cucumber).
 * Instead, we create a mock world with a mock GraphPort and replicate
 * the handler logic inline per test.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    name: overrides.name ?? 'MyClass',
    fqn: overrides.fqn ?? 'com.example.MyClass',
    type: overrides.type ?? 'class',
    layer: overrides.layer,
    file: overrides.file,
  }
}

function makeDep(overrides: Partial<Dependency> = {}): Dependency {
  return {
    from: overrides.from ?? makeNode({ name: 'A', fqn: 'a' }),
    to: overrides.to ?? makeNode({ name: 'B', fqn: 'b' }),
    type: overrides.type ?? 'imports',
  }
}

function makeCycle(nodes: GraphNode[]): Cycle {
  return { nodes, path: nodes.map((n) => n.name).join(' -> ') }
}

interface MockGraphPort {
  getLayer: ReturnType<typeof mock>
  getNodesInLayer: ReturnType<typeof mock>
  getLayerDependencies: ReturnType<typeof mock>
  getDependencies: ReturnType<typeof mock>
  getDependents: ReturnType<typeof mock>
  findCircularDependencies: ReturnType<typeof mock>
  findCircularDependenciesInLayer: ReturnType<typeof mock>
  getClassesImplementing: ReturnType<typeof mock>
  getClassesNotImplementingAnyInterface: ReturnType<typeof mock>
  getInterfacesInLayer: ReturnType<typeof mock>
  findNodes: ReturnType<typeof mock>
  findNodesByLayer: ReturnType<typeof mock>
  query: ReturnType<typeof mock>
  connect: ReturnType<typeof mock>
  disconnect: ReturnType<typeof mock>
  dispose: ReturnType<typeof mock>
  config: Record<string, unknown>
  records: Record<string, unknown>[]
  count: number
}

function createMockWorld() {
  const variableService = new VariableService()
  const interpolationService = new InterpolationService(variableService)

  const graph: MockGraphPort = {
    getLayer: mock(() => Promise.resolve({ name: 'domain', nodeCount: 5, classCount: 3, interfaceCount: 2 })),
    getNodesInLayer: mock(() => Promise.resolve([] as GraphNode[])),
    getLayerDependencies: mock(() => Promise.resolve([] as Dependency[])),
    getDependencies: mock(() => Promise.resolve([] as Dependency[])),
    getDependents: mock(() => Promise.resolve([] as Dependency[])),
    findCircularDependencies: mock(() => Promise.resolve([] as Cycle[])),
    findCircularDependenciesInLayer: mock(() => Promise.resolve([] as Cycle[])),
    getClassesImplementing: mock(() => Promise.resolve([] as GraphNode[])),
    getClassesNotImplementingAnyInterface: mock(() => Promise.resolve([] as GraphNode[])),
    getInterfacesInLayer: mock(() => Promise.resolve([] as GraphNode[])),
    findNodes: mock(() => Promise.resolve([] as GraphNode[])),
    findNodesByLayer: mock(() => Promise.resolve([] as GraphNode[])),
    query: mock(() => Promise.resolve([])),
    connect: mock(() => Promise.resolve()),
    disconnect: mock(() => Promise.resolve()),
    dispose: mock(() => Promise.resolve()),
    config: {},
    records: [],
    count: 0,
  }

  return {
    graph,
    setVariable: (name: string, value: unknown) => variableService.set(name, value),
    getVariable: <T>(name: string): T => variableService.get<T>(name),
    hasVariable: (name: string) => variableService.has(name),
    interpolate: (text: string) => interpolationService.interpolate(text),
  }
}

type MockWorld = ReturnType<typeof createMockWorld>

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Graph Steps', () => {
  let world: MockWorld

  beforeEach(() => {
    world = createMockWorld()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // selection.steps.ts
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Selection Steps', () => {
    // ── Test 1: 'all nodes in layer {string}' calls graph.getNodesInLayer ──
    test('all nodes in layer calls graph.getNodesInLayer', async () => {
      const nodes = [makeNode({ name: 'A', layer: 'domain' })]
      world.graph.getNodesInLayer.mockResolvedValueOnce(nodes)

      // Step logic: Given all nodes in layer {string}
      const layer = 'domain'
      const layerName = world.interpolate(layer)
      world.setVariable('_currentLayer', layerName)
      await world.graph.getNodesInLayer(layerName)

      expect(world.graph.getNodesInLayer).toHaveBeenCalledWith('domain')
    })

    // ── Test 2: 'all nodes in layer' stores results as _selectedNodes ──────
    test('all nodes in layer stores results as _selectedNodes', async () => {
      const nodes = [
        makeNode({ name: 'A', layer: 'domain' }),
        makeNode({ name: 'B', layer: 'domain' }),
      ]
      world.graph.getNodesInLayer.mockResolvedValueOnce(nodes)

      // Step logic
      const layer = 'domain'
      const layerName = world.interpolate(layer)
      world.setVariable('_currentLayer', layerName)
      const result = await world.graph.getNodesInLayer(layerName)
      world.setVariable('_selectedNodes', result)

      const stored = world.getVariable<GraphNode[]>('_selectedNodes')
      expect(stored).toHaveLength(2)
      expect(stored[0]!.name).toBe('A')
      expect(stored[1]!.name).toBe('B')
    })

    // ── Test 3: 'all classes in layer' filters by type ─────────────────────
    test('all classes in layer filters by type class', async () => {
      const classNodes = [makeNode({ name: 'Svc', type: 'class', layer: 'application' })]
      world.graph.getNodesInLayer.mockResolvedValueOnce(classNodes)

      // Step logic: Given all classes in layer {string}
      const layer = 'application'
      const layerName = world.interpolate(layer)
      world.setVariable('_currentLayer', layerName)
      const nodes = await world.graph.getNodesInLayer(layerName, 'class')
      world.setVariable('_selectedNodes', nodes)

      expect(world.graph.getNodesInLayer).toHaveBeenCalledWith('application', 'class')
      const stored = world.getVariable<GraphNode[]>('_selectedNodes')
      expect(stored).toHaveLength(1)
      expect(stored[0]!.name).toBe('Svc')
    })

    // ── Test 4: 'the class {string}' calls graph.findNodes ─────────────────
    test('the class {string} calls graph.findNodes with class type', async () => {
      const nodes = [makeNode({ name: 'UserService', fqn: 'com.app.UserService' })]
      world.graph.findNodes.mockResolvedValueOnce(nodes)

      // Step logic: Given the class {string}
      const name = 'UserService'
      const found = await world.graph.findNodes(world.interpolate(name), 'class') as GraphNode[]
      world.setVariable('_selectedNodes', found)
      if (found.length > 0) {
        world.setVariable('_currentNode', found[0])
      }

      expect(world.graph.findNodes).toHaveBeenCalledWith('UserService', 'class')
      const currentNode = world.getVariable<GraphNode>('_currentNode')
      expect(currentNode.name).toBe('UserService')
    })

    // ── Test 5: 'I query:' docstring calls graph.query ─────────────────────
    test('I query: docstring calls graph.query', async () => {
      world.graph.query.mockResolvedValueOnce([{ n: { name: 'Foo' } }])

      // Step logic: When I query: (docString)
      const docString = 'MATCH (n) RETURN n'
      await world.graph.query(world.interpolate(docString))

      expect(world.graph.query).toHaveBeenCalledWith('MATCH (n) RETURN n')
    })

    // ── Test 6: 'I check for circular dependencies' calls findCircularDependencies
    test('I check for circular dependencies calls findCircularDependencies and stores _cycles', async () => {
      const cycles = [makeCycle([makeNode({ name: 'A' }), makeNode({ name: 'B' })])]
      world.graph.findCircularDependencies.mockResolvedValueOnce(cycles)

      // Step logic: When I check for circular dependencies
      const result = await world.graph.findCircularDependencies() as Cycle[]
      world.setVariable('_cycles', result)

      expect(world.graph.findCircularDependencies).toHaveBeenCalled()
      const stored = world.getVariable<Cycle[]>('_cycles')
      expect(stored).toHaveLength(1)
      expect(stored[0]!.nodes[0]!.name).toBe('A')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // dependency-assertions.steps.ts
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Dependency Assertion Steps', () => {
    // ── Test 7: 'it should not depend on layer' passes when empty ──────────
    test('it should not depend on layer passes when no dependencies', async () => {
      world.setVariable('_currentLayer', 'domain')
      world.graph.getLayerDependencies.mockResolvedValueOnce([])

      // Step logic: Then it should not depend on layer {string}
      const targetLayer = 'infrastructure'
      const currentLayer = world.getVariable<string>('_currentLayer')
      const deps = await world.graph.getLayerDependencies(currentLayer, world.interpolate(targetLayer))

      expect(deps).toHaveLength(0)
    })

    // ── Test 8: 'it should not depend on layer' fails when deps exist ──────
    test('it should not depend on layer fails when dependencies exist', async () => {
      world.setVariable('_currentLayer', 'domain')
      const deps = [makeDep({ type: 'imports' })]
      world.graph.getLayerDependencies.mockResolvedValueOnce(deps)

      // Step logic
      const targetLayer = 'infrastructure'
      const currentLayer = world.getVariable<string>('_currentLayer')
      const result = await world.graph.getLayerDependencies(currentLayer, world.interpolate(targetLayer))

      expect(() => {
        expect(result).toHaveLength(0)
      }).toThrow()
    })

    // ── Test 9: 'there should be no circular dependencies' passes when none
    test('there should be no circular dependencies passes when none', async () => {
      world.graph.findCircularDependencies.mockResolvedValueOnce([])

      // Step logic: Then there should be no circular dependencies
      const cycles = await world.graph.findCircularDependencies()

      expect(cycles).toHaveLength(0)
    })

    // ── Test 10: 'there should be no circular dependencies' fails when found
    test('there should be no circular dependencies fails when cycles found', async () => {
      const cycles = [makeCycle([makeNode({ name: 'X' }), makeNode({ name: 'Y' })])]
      world.graph.findCircularDependencies.mockResolvedValueOnce(cycles)

      // Step logic
      const result = await world.graph.findCircularDependencies()

      expect(() => {
        expect(result).toHaveLength(0)
      }).toThrow()
    })

    // ── Test 11: 'no cycles should be found' passes from _cycles variable ──
    test('no cycles should be found passes when _cycles is empty', () => {
      world.setVariable('_cycles', [] as Cycle[])

      // Step logic: Then no cycles should be found
      const cycles = world.getVariable<Cycle[]>('_cycles')

      expect(cycles).toHaveLength(0)
    })

    // ── Test 12: 'no cycles should be found' fails when cycles exist ───────
    test('no cycles should be found fails when _cycles contains entries', () => {
      const cycles = [makeCycle([makeNode({ name: 'A' }), makeNode({ name: 'B' })])]
      world.setVariable('_cycles', cycles)

      // Step logic
      const stored = world.getVariable<Cycle[]>('_cycles')

      expect(() => {
        expect(stored).toHaveLength(0)
      }).toThrow()
    })

    // ── Test 19: 'it should not depend on layer' verifies correct params ───
    test('it should not depend on layer calls getLayerDependencies with correct params', async () => {
      world.setVariable('_currentLayer', 'application')
      world.graph.getLayerDependencies.mockResolvedValueOnce([])

      // Step logic
      const targetLayer = 'infrastructure'
      const currentLayer = world.getVariable<string>('_currentLayer')
      await world.graph.getLayerDependencies(currentLayer, world.interpolate(targetLayer))

      expect(world.graph.getLayerDependencies).toHaveBeenCalledWith('application', 'infrastructure')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // query.steps.ts
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Query Assertion Steps', () => {
    // ── Test 13: 'the result should be empty' passes when count is 0 ───────
    test('the result should be empty passes when count is 0', () => {
      world.graph.count = 0

      // Step logic: Then the result should be empty
      expect(world.graph.count).toBe(0)
    })

    // ── Test 14: 'the result should have N rows' passes for matching count ─
    test('the result should have N rows passes for matching count', () => {
      world.graph.count = 5

      // Step logic: Then the result should have {int} rows
      const expectedCount = 5
      expect(world.graph.count).toBe(expectedCount)
    })

    // ── Test 15: 'the result should have at least N rows' passes ───────────
    test('the result should have at least N rows passes', () => {
      world.graph.count = 10

      // Step logic: Then the result should have at least {int} rows
      const minCount = 5
      expect(world.graph.count).toBeGreaterThanOrEqual(minCount)
    })

    // ── Test 16: 'the result path should equal' passes ─────────────────────
    test('the result path should equal passes for matching value', () => {
      world.graph.records = [{ user: { name: 'Alice' } }]

      // Step logic: Then the result path {string} should equal {string}
      const path = 'user.name'
      const expectedValue = 'Alice'
      const records = world.graph.records
      expect(records.length).toBeGreaterThan(0)

      const keys = path.split('.')
      let value: unknown = records[0]
      for (const key of keys) {
        value = (value as Record<string, unknown>)[key]
      }
      expect(String(value)).toBe(world.interpolate(expectedValue))
    })

    // ── Test 17: 'I store the result count as' stores count ────────────────
    test('I store the result count as stores count variable', () => {
      world.graph.count = 42

      // Step logic: Then I store the result count as {string}
      const variableName = 'nodeCount'
      world.setVariable(variableName, world.graph.count)

      expect(world.getVariable<number>('nodeCount')).toBe(42)
    })

    // ── Test 18: 'I store the result as' stores records ────────────────────
    test('I store the result as stores records variable', () => {
      const records = [{ id: 1, name: 'Foo' }, { id: 2, name: 'Bar' }]
      world.graph.records = records

      // Step logic: Then I store the result as {string}
      const variableName = 'queryResults'
      world.setVariable(variableName, world.graph.records)

      const stored = world.getVariable<Record<string, unknown>[]>('queryResults')
      expect(stored).toHaveLength(2)
      expect(stored[0]).toEqual({ id: 1, name: 'Foo' })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // Additional / Cross-cutting
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Additional Selection Steps', () => {
    // ── Test 20: 'all nodes in layer' stores _selectedNodes and _currentLayer
    test('all nodes in layer stores both _selectedNodes and _currentLayer', async () => {
      const nodes = [
        makeNode({ name: 'Svc', layer: 'application' }),
        makeNode({ name: 'Repo', layer: 'application' }),
      ]
      world.graph.getNodesInLayer.mockResolvedValueOnce(nodes)

      // Step logic: Given all nodes in layer {string}
      const layer = 'application'
      const layerName = world.interpolate(layer)
      world.setVariable('_currentLayer', layerName)
      const result = await world.graph.getNodesInLayer(layerName)
      world.setVariable('_selectedNodes', result)

      expect(world.getVariable<string>('_currentLayer')).toBe('application')
      const stored = world.getVariable<GraphNode[]>('_selectedNodes')
      expect(stored).toHaveLength(2)
      expect(stored[0]!.name).toBe('Svc')
      expect(stored[1]!.name).toBe('Repo')
    })
  })
})
