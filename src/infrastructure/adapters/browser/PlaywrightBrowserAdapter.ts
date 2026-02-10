import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'
import type { BrowserPort, WaitOptions } from '../../../application/ports/index.ts'
import type { BrowserAdapterConfig } from '../../../application/config/index.ts'
import type { ScreenshotOptions } from '../../../domain/entities/index.ts'

export class PlaywrightBrowserAdapter implements BrowserPort {
  private browser!: Browser
  private context!: BrowserContext
  private _page!: Page

  constructor(readonly config: BrowserAdapterConfig) {}

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

  // Navigation
  async goto(path: string): Promise<void> {
    await this._page.goto(path)
  }

  async reload(): Promise<void> {
    await this._page.reload()
  }

  async goBack(): Promise<void> {
    await this._page.goBack()
  }

  async goForward(): Promise<void> {
    await this._page.goForward()
  }

  // Interactions
  async click(selector: string): Promise<void> {
    await this._page.click(selector)
  }

  async doubleClick(selector: string): Promise<void> {
    await this._page.dblclick(selector)
  }

  async fill(selector: string, value: string): Promise<void> {
    await this._page.fill(selector, value)
  }

  async clear(selector: string): Promise<void> {
    await this._page.fill(selector, '')
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this._page.selectOption(selector, value)
  }

  async check(selector: string): Promise<void> {
    await this._page.check(selector)
  }

  async uncheck(selector: string): Promise<void> {
    await this._page.uncheck(selector)
  }

  async press(key: string): Promise<void> {
    await this._page.keyboard.press(key)
  }

  async type(selector: string, text: string): Promise<void> {
    await this._page.locator(selector).pressSequentially(text)
  }

  async hover(selector: string): Promise<void> {
    await this._page.hover(selector)
  }

  async focus(selector: string): Promise<void> {
    await this._page.focus(selector)
  }

  // File upload
  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this._page.setInputFiles(selector, filePath)
  }

  // Waiting
  async waitForSelector(selector: string, options?: WaitOptions): Promise<void> {
    await this._page.waitForSelector(selector, {
      timeout: options?.timeout,
      state: options?.state,
    })
  }

  async waitForNavigation(): Promise<void> {
    await this._page.waitForLoadState('networkidle')
  }

  async waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void> {
    await this._page.waitForLoadState(state ?? 'load')
  }

  async waitForTimeout(ms: number): Promise<void> {
    await this._page.waitForTimeout(ms)
  }

  // Information
  url(): string {
    return this._page.url()
  }

  async title(): Promise<string> {
    return await this._page.title()
  }

  async textContent(selector: string): Promise<string | null> {
    return await this._page.textContent(selector)
  }

  async getAttribute(selector: string, name: string): Promise<string | null> {
    return await this._page.getAttribute(selector, name)
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this._page.isVisible(selector)
  }

  async isEnabled(selector: string): Promise<boolean> {
    return await this._page.isEnabled(selector)
  }

  async isChecked(selector: string): Promise<boolean> {
    return await this._page.isChecked(selector)
  }

  // Screenshots
  async screenshot(options?: ScreenshotOptions): Promise<Buffer> {
    return (await this._page.screenshot({
      fullPage: options?.fullPage,
      clip: options?.clip,
      type: options?.type,
      quality: options?.quality,
      path: options?.path,
    })) as Buffer
  }

  // Context management
  async clearContext(): Promise<void> {
    await this.context.clearCookies()
    await this._page.evaluate(() => localStorage.clear())
  }

  // Lifecycle
  async dispose(): Promise<void> {
    await this.context.close()
    await this.browser.close()
  }
}
