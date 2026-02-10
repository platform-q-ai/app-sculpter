import type { HttpResponse } from '../../domain/entities/index.ts'

export interface HttpPort {
  // Request building (chainable)
  setHeader(name: string, value: string): this
  setHeaders(headers: Record<string, string>): this
  setQueryParam(name: string, value: string): this
  setQueryParams(params: Record<string, string>): this
  setBearerToken(token: string): this
  setBasicAuth(username: string, password: string): this

  // HTTP methods
  get(path: string): Promise<void>
  post(path: string, body?: unknown): Promise<void>
  put(path: string, body?: unknown): Promise<void>
  patch(path: string, body?: unknown): Promise<void>
  delete(path: string): Promise<void>

  // Response accessors
  readonly response: HttpResponse
  readonly status: number
  readonly body: unknown

  // Utilities
  getBodyPath(jsonPath: string): unknown

  // Lifecycle
  dispose(): Promise<void>
}
