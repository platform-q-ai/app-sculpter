import { Given, When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'
import type { NodeType } from '../../../domain/value-objects/index.ts'

// Layer Selection (sets context for subsequent assertions)
Given<TestWorld>('the layer {string}', async function (layer: string) {
  const layerName = this.interpolate(layer)
  this.setVariable('_currentLayer', layerName)
  const info = await this.graph.getLayer(layerName)
  this.setVariable('_currentLayerInfo', info)
})

Given<TestWorld>('all nodes in layer {string}', async function (layer: string) {
  const layerName = this.interpolate(layer)
  this.setVariable('_currentLayer', layerName)
  const nodes = await this.graph.getNodesInLayer(layerName)
  this.setVariable('_selectedNodes', nodes)
})

Given<TestWorld>('all classes in layer {string}', async function (layer: string) {
  const layerName = this.interpolate(layer)
  this.setVariable('_currentLayer', layerName)
  const nodes = await this.graph.getNodesInLayer(layerName, 'class')
  this.setVariable('_selectedNodes', nodes)
})

Given<TestWorld>('all interfaces in layer {string}', async function (layer: string) {
  const layerName = this.interpolate(layer)
  this.setVariable('_currentLayer', layerName)
  const nodes = await this.graph.getNodesInLayer(layerName, 'interface')
  this.setVariable('_selectedNodes', nodes)
})

// Node Selection
Given<TestWorld>('all classes matching {string}', async function (pattern: string) {
  const nodes = await this.graph.findNodes(this.interpolate(pattern), 'class')
  this.setVariable('_selectedNodes', nodes)
})

Given<TestWorld>('all classes in {string}', async function (path: string) {
  const nodes = await this.graph.findNodes(`.*${this.interpolate(path)}.*`, 'class')
  this.setVariable('_selectedNodes', nodes)
})

Given<TestWorld>('all interfaces in {string}', async function (path: string) {
  const nodes = await this.graph.findNodes(`.*${this.interpolate(path)}.*`, 'interface')
  this.setVariable('_selectedNodes', nodes)
})

Given<TestWorld>('the class {string}', async function (name: string) {
  const nodes = await this.graph.findNodes(this.interpolate(name), 'class')
  this.setVariable('_selectedNodes', nodes)
  if (nodes.length > 0) {
    this.setVariable('_currentNode', nodes[0])
  }
})

Given<TestWorld>('the module {string}', async function (name: string) {
  const nodes = await this.graph.findNodes(this.interpolate(name), 'module')
  this.setVariable('_selectedNodes', nodes)
  if (nodes.length > 0) {
    this.setVariable('_currentNode', nodes[0])
  }
})

// Cypher Queries
When<TestWorld>('I query:', async function (docString: string) {
  await this.graph.query(this.interpolate(docString))
})

When<TestWorld>('I check for circular dependencies', async function () {
  const cycles = await this.graph.findCircularDependencies()
  this.setVariable('_cycles', cycles)
})

When<TestWorld>('I check for circular dependencies in layer {string}', async function (layer: string) {
  const cycles = await this.graph.findCircularDependenciesInLayer(this.interpolate(layer))
  this.setVariable('_cycles', cycles)
})
