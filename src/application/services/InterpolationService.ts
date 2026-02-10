import { VariableService } from './VariableService.ts'

export class InterpolationService {
  constructor(private variables: VariableService) {}

  interpolate(text: string): string {
    return text.replace(/\$\{(\w+)\}/g, (_, name) => {
      // Handle built-in variables
      switch (name) {
        case 'timestamp':
          return String(Math.floor(Date.now() / 1000))
        case 'timestamp_ms':
          return String(Date.now())
        case 'iso_date':
          return new Date().toISOString()
        case 'uuid':
          return crypto.randomUUID()
        case 'random_int':
          return String(Math.floor(Math.random() * 1000000))
        case 'random_string':
          return this.randomString(8)
        case 'random_email':
          return `test_${this.randomString(6)}@example.com`
        default:
          return String(this.variables.get(name))
      }
    })
  }

  private randomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }
}
