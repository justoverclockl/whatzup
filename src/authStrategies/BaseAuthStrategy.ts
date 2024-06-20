import { Client } from '../Client'
import { Browser } from 'puppeteer'


export class BaseAuthStrategy {
    constructor() {
    }

    async beforeBrowserInitialized() {}
    async afterBrowserInitialized() {}
    async destroy() {}
    async logout(client: Client, browser: Browser, sessionDir: string) {}
}
