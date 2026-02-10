import type { ExternBddConfig } from '../../application/config/index.ts'
import type { HttpPort, BrowserPort, CliPort, GraphPort, SecurityPort } from '../../application/ports/index.ts'
import { PlaywrightHttpAdapter } from '../adapters/http/PlaywrightHttpAdapter.ts'
import { PlaywrightBrowserAdapter } from '../adapters/browser/PlaywrightBrowserAdapter.ts'
import { BunCliAdapter } from '../adapters/cli/BunCliAdapter.ts'
import { Neo4jGraphAdapter } from '../adapters/graph/Neo4jGraphAdapter.ts'
import { ZapSecurityAdapter } from '../adapters/security/ZapSecurityAdapter.ts'

export interface Adapters {
  http?: HttpPort
  browser?: BrowserPort
  cli?: CliPort
  graph?: GraphPort
  security?: SecurityPort
  dispose(): Promise<void>
}

export async function createAdapters(config: ExternBddConfig): Promise<Adapters> {
  const adapters: Partial<Adapters> = {}

  if (config.adapters.http) {
    const http = new PlaywrightHttpAdapter(config.adapters.http)
    await http.initialize()
    adapters.http = http
  }

  if (config.adapters.browser) {
    const browser = new PlaywrightBrowserAdapter(config.adapters.browser)
    await browser.initialize()
    adapters.browser = browser
  }

  if (config.adapters.cli) {
    adapters.cli = new BunCliAdapter(config.adapters.cli)
  }

  if (config.adapters.graph) {
    const graph = new Neo4jGraphAdapter(config.adapters.graph)
    await graph.connect()
    adapters.graph = graph
  }

  if (config.adapters.security) {
    adapters.security = new ZapSecurityAdapter(config.adapters.security)
  }

  return {
    ...adapters,
    async dispose() {
      await Promise.all([
        adapters.http?.dispose(),
        adapters.browser?.dispose(),
        adapters.cli?.dispose(),
        adapters.graph?.dispose(),
        adapters.security?.dispose(),
      ])
    },
  } as Adapters
}
