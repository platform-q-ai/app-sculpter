import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { TestWorld } from '../../world/index.ts'

Then<TestWorld>(
  'layer {string} should not depend on layer {string}',
  async function (from: string, to: string) {
    const deps = await this.graph.getLayerDependencies(
      this.interpolate(from),
      this.interpolate(to),
    )
    expect(deps).toHaveLength(0)
  },
)

Then<TestWorld>(
  'layer {string} should depend on layer {string}',
  async function (from: string, to: string) {
    const deps = await this.graph.getLayerDependencies(
      this.interpolate(from),
      this.interpolate(to),
    )
    expect(deps.length).toBeGreaterThan(0)
  },
)

Then<TestWorld>(
  'there should be no circular dependencies',
  async function () {
    const cycles = await this.graph.findCircularDependencies()
    expect(cycles).toHaveLength(0)
  },
)

Then<TestWorld>(
  'there should be at most {int} circular dependencies',
  async function (maxCycles: number) {
    const cycles = await this.graph.findCircularDependencies()
    expect(cycles.length).toBeLessThanOrEqual(maxCycles)
  },
)
