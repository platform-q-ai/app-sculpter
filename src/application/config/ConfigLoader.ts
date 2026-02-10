import type { ExternBddConfig } from './ConfigSchema.ts'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

export async function loadConfig(configPath?: string): Promise<ExternBddConfig> {
  const path = configPath ?? resolve(process.cwd(), 'extern-bdd.config.ts')
  const module = await import(pathToFileURL(path).href)
  return module.default
}

export function defineConfig(config: ExternBddConfig): ExternBddConfig {
  return config
}
