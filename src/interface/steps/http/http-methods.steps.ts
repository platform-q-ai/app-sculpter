import { When } from '@cucumber/cucumber'
import { TestWorld } from '../../world/index.ts'

When<TestWorld>('I GET {string}', async function (path: string) {
  await this.http.get(this.interpolate(path))
})

When<TestWorld>('I POST to {string}', async function (path: string) {
  await this.http.post(this.interpolate(path))
})

When<TestWorld>('I POST to {string} with body:', async function (path: string, docString: string) {
  const body = JSON.parse(this.interpolate(docString))
  await this.http.post(this.interpolate(path), body)
})

When<TestWorld>('I PUT to {string} with body:', async function (path: string, docString: string) {
  const body = JSON.parse(this.interpolate(docString))
  await this.http.put(this.interpolate(path), body)
})

When<TestWorld>('I PATCH to {string} with body:', async function (path: string, docString: string) {
  const body = JSON.parse(this.interpolate(docString))
  await this.http.patch(this.interpolate(path), body)
})

When<TestWorld>('I DELETE {string}', async function (path: string) {
  await this.http.delete(this.interpolate(path))
})

When<TestWorld>('I send a {word} request to {string}', async function (method: string, path: string) {
  await this.http.request(method.toUpperCase(), this.interpolate(path))
})

When<TestWorld>('I send a {word} request to {string} with body:', async function (method: string, path: string, docString: string) {
  const body = JSON.parse(this.interpolate(docString))
  await this.http.request(method.toUpperCase(), this.interpolate(path), body)
})
