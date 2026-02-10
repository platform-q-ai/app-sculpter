export interface WaitOptions {
  timeout?: number
  state?: 'attached' | 'detached' | 'visible' | 'hidden'
}

export interface BrowserPort {
  // Navigation
  goto(path: string): Promise<void>
  reload(): Promise<void>
  goBack(): Promise<void>

  // Interactions
  click(selector: string): Promise<void>
  fill(selector: string, value: string): Promise<void>
  selectOption(selector: string, value: string): Promise<void>
  check(selector: string): Promise<void>

  // Waiting
  waitForSelector(selector: string, options?: WaitOptions): Promise<void>
  waitForNavigation(): Promise<void>

  // Information
  url(): string
  title(): Promise<string>
  textContent(selector: string): Promise<string | null>
  isVisible(selector: string): Promise<boolean>

  // Screenshots
  screenshot(): Promise<Buffer>

  // Lifecycle
  clearContext(): Promise<void>
  dispose(): Promise<void>
}
