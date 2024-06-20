import { BaseAuthStrategy } from './BaseAuthStrategy'
import { Client } from '../Client'
import { Browser, Page } from 'puppeteer'
import * as fs from 'node:fs/promises'
import path from 'node:path'

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

        const sessionPath: string = path.join(process.cwd(), '.whatzup');
        try {
            if (await fs.stat(sessionDir)) {
                await fs.rm(sessionDir, { recursive: true, force: true });
            }
        } catch (error) {
            console.error(`Failed to delete session path: ${sessionPath}`, error);
        }

        await client.waitFor(2000)
        await client.initialize()
    }
}
