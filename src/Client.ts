import puppeteer, { Browser, Page } from 'puppeteer'
import { DEFAULT_CLIENT_OPTIONS, DEFAULT_PUPPETEER_OPTIONS, WHATSAPP_WEB_URL } from './helpers/constants'
import { ClientOptions, PuppeteerOptions } from './types'
import { WhatzupEvents } from './Events/Events'
import { INTRO_QRCODE_SELECTOR, QR_ATTRIBUTE, QR_CONTAINER, QR_SCANNED } from './selectors/selectors'
import { BaseAuthStrategy } from './authStrategies/BaseAuthStrategy'
import { isElementInDom, observeAndGetElementAttribute } from './utils/elementObserver'

export class Client {
    private readonly puppeteerOptions?: PuppeteerOptions
    private options: ClientOptions
    private page?: Page
    private browser?: Browser
    private readonly Events: WhatzupEvents
    private readonly authStrategy: BaseAuthStrategy

    constructor(options: ClientOptions, puppeteerOptions: Partial<PuppeteerOptions> = {}) {
        this.puppeteerOptions = { ...DEFAULT_PUPPETEER_OPTIONS, ...puppeteerOptions }
        this.options = { ...DEFAULT_CLIENT_OPTIONS, ...options }
        this.Events = new WhatzupEvents()
        this.authStrategy = options.authStrategy
    }

    on(event: string, listener: (...args: any[]) => void) {
        this.Events.on(event, listener)
    }

    async initialize(): Promise<void> {
        try {
            await this.authStrategy.beforeBrowserInitialized()
            await this.initializeBrowser()
            await this.authStrategy.afterBrowserInitialized()
            await this.setPageSettings()
            await this.goToPage()

            const isAuthenticated: boolean = await this.isUserAuthenticated()

            if (isAuthenticated) {
                this.Events.emitAuthenticated('Authenticated')
            } else {
                await this.waitForPageLoadingScreen()
                await this.getQrCode()
                await this.checkForQrScan()
            }



        } catch (error) {
            this.Events.emitReady('Failed to initialize client', error as Error)
        }
    }

    private async initializeBrowser(): Promise<void> {
        try {
            this.browser = await puppeteer.launch(this.puppeteerOptions)
            const pages: Page[] = await this.browser.pages()
            this.page =
                pages.length > 0 ? pages[0] : await this.browser.newPage()

            if (this.browser && this.page) {
                this.Events.emitReady('Client initialized!')
            }
        } catch (error) {
            this.Events.emitReady('Error during client initialization!', error as Error)
            throw error
        }
    }

    private async setPageSettings(): Promise<void> {
        if (!this.page) return

        if (this.options.userAgent != null) {
            await this.page.setUserAgent(this.options.userAgent)
        }

        if (this.options.proxyAuthentication) {
            await this.page.authenticate(this.options.proxyAuthentication)
        }

        if (this.options.bypassCSP) {
            await this.page.setBypassCSP(this.options.bypassCSP)
        }

        await this.page.evaluateOnNewDocument((): void => {
            ;(window as any).Error = Error
        })
    }

    private async goToPage(): Promise<void> {
        await this.page?.goto(WHATSAPP_WEB_URL, {
            waitUntil: 'networkidle0',
            timeout: 0,
            referer: 'https://whatsapp.com/',
        })
    }

    private async waitForPageLoadingScreen(): Promise<void> {
        try {
            await this.page?.waitForSelector(INTRO_QRCODE_SELECTOR, {
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

    private async getQrCode(): Promise<void> {
        await observeAndGetElementAttribute(
            this.page!,
            QR_CONTAINER,
            QR_ATTRIBUTE,
            this.Events,
        )
    }

    private async isUserAuthenticated(): Promise<boolean> {
        try {
            return await isElementInDom(this.page!, QR_SCANNED)
        } catch (error) {
            return false;
        }
    }

    private async qrCodeScanned(): Promise<boolean> {
        return isElementInDom(this.page!, QR_SCANNED);
    }

    private async checkForQrScan(): Promise<void> {
        while (true) {
            const isQrScanned: boolean = await this.qrCodeScanned();

            if (isQrScanned) {
                this.Events.emitAuthenticated('Authenticated');
                break;
            }
            await this.waitFor(1000);
        }
    }

    async logout(): Promise<void> {
        await this.authStrategy.logout(this, this.browser!, this.puppeteerOptions?.userDataDir!)
        this.Events.emitLogout('logout executed')
    }

    async waitFor(ms: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
    }
}
