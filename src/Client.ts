import puppeteer, { Browser, Page } from 'puppeteer'
import { DEFAULT_CLIENT_OPTIONS, WHATSAPP_WEB_URL } from './helpers/constants'
import { PuppeteerDefaultOptions } from './types/client.types'
import { WhatzupEvents } from './Events/Events'
import { INTRO_QRCODE_SELECTOR, PAIRING_CODE_BUTTON, QR_CONTAINER } from './selectors/selectors'

export class Client {
    private options: PuppeteerDefaultOptions
    private page?: Page
    private browser?: Browser
    private Events: WhatzupEvents

    constructor(options: Partial<PuppeteerDefaultOptions> = {}) {
        this.options = { ...DEFAULT_CLIENT_OPTIONS, ...options }
        this.Events = new WhatzupEvents()
    }

    on(event: string, listener: (...args: any[]) => void) {
        this.Events.on(event, listener)
    }

    async initialize(): Promise<void> {
        try {
            await this.initializeBrowser()
            await this.setPageSettings()

            await this.page?.goto(WHATSAPP_WEB_URL, {
                waitUntil: 'load',
                timeout: 0,
                referer: 'https://whatsapp.com/',
            })

            this.Events.emitReady('Client initialized!')
            await this.waitForPageLoadingScreen(this.page)
            await this.getQrCode(this.page)
        } catch (error) {
            this.Events.emitReady('Failed to initialize client', error as Error)
        }
    }

    private async initializeBrowser(): Promise<void> {
        try {
            this.browser = await puppeteer.launch(this.options.puppeteer)
            const pages = await this.browser.pages()
            this.page =
                pages.length > 0 ? pages[0] : await this.browser.newPage()
        } catch (error) {
            console.error('Failed to launch browser:', error)
            throw error
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
            (window as any).Error = Error;
        })
    }

    private async waitForPageLoadingScreen(page: Page | undefined) {
        try {
            await page?.waitForSelector(INTRO_QRCODE_SELECTOR, {
                visible: true,
            })
            this.Events.emitLoadComplete('Page loaded, ready to scan QR!')
        } catch (error) {
            this.Events.emitLoadComplete(
                'Page loaded, ready to scan QR!',
                error as Error
            )
        }
    }

    private async getQrCode(page: Page | undefined): Promise<string | null> {
        if (!page) {
            return null
        }

        const attributeValue: string | null = await page?.evaluate((selector, attribute) => {
            return new Promise<string | null>((resolve) => {
                const element = document.querySelector(selector)
                if (!element) {
                    return resolve(null)
                }

                const observer: MutationObserver = new MutationObserver(() => {
                    if (element.hasAttribute(attribute)) {
                        const value: string | null = element.getAttribute(attribute);
                        observer.disconnect();
                        resolve(value);
                    }
                });

                observer.observe(element, { attributes: true })

                if (element.hasAttribute(attribute)) {
                    const initialValue = element.getAttribute(attribute);
                    observer.disconnect();
                    resolve(initialValue);
                }
            })
        }, QR_CONTAINER, 'data-ref')


        if (attributeValue !== null) {
            this.Events.emitQr(attributeValue);
        }


        return attributeValue;
    }
}
