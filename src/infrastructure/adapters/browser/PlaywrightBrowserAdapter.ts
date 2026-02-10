import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'
import type { BrowserPort, WaitOptions } from '../../../application/ports/index.ts'
import type { BrowserAdapterConfig } from '../../../application/config/index.ts'

export class PlaywrightBrowserAdapter implements BrowserPort {
  private browser!: Browser
  private context!: BrowserContext
  private _page!: Page

  constructor(private readonly config: BrowserAdapterConfig) {}

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: this.config.headless ?? true })
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      baseURL: this.config.baseURL,
    })
    this._page = await this.context.newPage()
  }

  get page(): Page {
    return this._page
  }

  async goto(path: string): Promise<void> {
    await this._page.goto(path)
  }

  async reload(): Promise<void> {
    await this._page.reload()
  }

  async goBack(): Promise<void> {
    await this._page.goBack()
  }

  async click(selector: string): Promise<void> {
    await this._page.click(selector)
  }

  async fill(selector: string, value: string): Promise<void> {
    await this._page.fill(selector, value)
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this._page.selectOption(selector, value)
  }

  async check(selector: string): Promise<void> {
    await this._page.check(selector)
  }

  async waitForSelector(selector: string, options?: WaitOptions): Promise<void> {
    await this._page.waitForSelector(selector, {
      timeout: options?.timeout,
      state: options?.state,
    })
  }

  async waitForNavigation(): Promise<void> {
    await this._page.waitForLoadState('networkidle')
  }

  url(): string {
    return this._page.url()
  }

  async title(): Promise<string> {
    return await this._page.title()
  }

  async textContent(selector: string): Promise<string | null> {
    return await this._page.textContent(selector)
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this._page.isVisible(selector)
  }

  async screenshot(): Promise<Buffer> {
    return (await this._page.screenshot()) as Buffer
  }

  async clearContext(): Promise<void> {
    await this.context.clearCookies()
    await this._page.evaluate(() => localStorage.clear())
  }

  async dispose(): Promise<void> {
    await this.context.close()
    await this.browser.close()
  }
}
