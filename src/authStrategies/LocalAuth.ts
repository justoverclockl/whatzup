import { BaseAuthStrategy } from './BaseAuthStrategy'
import { Client } from '../Client'
import { Browser, Page } from 'puppeteer'
import * as fs from 'node:fs/promises'

export class LocalAuth extends BaseAuthStrategy {

    constructor() {
        super()
    }

    async beforeBrowserInitialized() {}
    async afterBrowserInitialized() {}
    async destroy() {}

    async logout(client: Client, browser: Browser, sessionDir: string): Promise<void> {
        const pages: Page[] = await browser.pages()
        for (const page of pages) await page.close()

        await browser.close()

        try {
            if (await fs.stat(sessionDir)) {
                await fs.rm(sessionDir, { recursive: true, force: true });
            }
        } catch (error) {
        }

        await client.waitFor(7000)
        await client.initialize()
    }
}
