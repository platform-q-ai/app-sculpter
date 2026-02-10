export interface ExternBddConfig {
  adapters: {
    http?: HttpAdapterConfig
    browser?: BrowserAdapterConfig
    cli?: CliAdapterConfig
    graph?: GraphAdapterConfig
    security?: SecurityAdapterConfig
  }
}

export interface HttpAdapterConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  auth?: {
    type: 'bearer' | 'basic'
    token?: string
    username?: string
    password?: string
  }
}

export interface BrowserAdapterConfig {
  baseURL: string
  headless?: boolean
  viewport?: { width: number; height: number }
  timeout?: number
}

export interface CliAdapterConfig {
  workingDir?: string
  env?: Record<string, string>
  timeout?: number
  shell?: string
}

export interface GraphAdapterConfig {
  uri: string
  username: string
  password: string
  database?: string
}

export interface SecurityAdapterConfig {
  apiUrl: string
  apiKey?: string
  timeout?: number
}
