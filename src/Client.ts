import puppeteer, { Browser, Page } from 'puppeteer'
import { DEFAULT_CLIENT_OPTIONS, WHATSAPP_WEB_URL } from './helpers/constants'
import { PuppeteerDefaultOptions } from './types/client.types'
import { WhatzupEvents } from './Events/Events'

export class Client {
    private options: PuppeteerDefaultOptions
    private page?: Page
    private browser?: Browser
    private Events: WhatzupEvents

    constructor(options: Partial<PuppeteerDefaultOptions> = {}) {
        this.options = { ...DEFAULT_CLIENT_OPTIONS, ...options }
        this.Events = new WhatzupEvents()
    }

    async initialize(): Promise<void> {
        try {
            await this.checkBrowserWSEndpoint()
            await this.initializeBrowser()
            await this.setPageSettings()
            await this.page
                ?.goto(WHATSAPP_WEB_URL, {
                    waitUntil: 'load',
                    timeout: 0,
                    referer: 'https://whatsapp.com/',
                })
                .then(() => this.Events.emitReady('Client initialized!'))
        } catch (error) {
            console.error('Failed to initialize client:', error)
        }
    }

    private async checkBrowserWSEndpoint(): Promise<void> {
        if (this.options.browserWSEndpoint) {
            this.browser = await puppeteer.connect(this.options.puppeteer)
            this.page = await this.browser.newPage()
        }
    }

    private async initializeBrowser(): Promise<void> {
        if (!this.browser) {
            this.browser = await puppeteer.launch(this.options.puppeteer)
            const pages = await this.browser.pages()
            this.page =
                pages.length > 0 ? pages[0] : await this.browser.newPage()
        }
    }

    private async setPageSettings(): Promise<void> {
        if (!this.page) return

        await this.page.setUserAgent(this.options.userAgent)

        if (this.options.proxyAuthentication) {
            await this.page.authenticate(this.options.proxyAuthentication)
        }

        if (this.options.bypassCSP) {
            await this.page.setBypassCSP(this.options.bypassCSP)
        }

        await this.page.evaluateOnNewDocument(() => {
            window.Error = Error
        })
    }
}
