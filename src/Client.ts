import puppeteer, { Browser, Page } from 'puppeteer'
import { DEFAULT_CLIENT_OPTIONS, DEFAULT_PUPPETEER_OPTIONS, WHATSAPP_WEB_URL } from './helpers/constants'
import { ClientOptions, PuppeteerOptions } from './types'
import { WhatzupEvents } from './Events/Events'
import {
    INTRO_QRCODE_SELECTOR,
    PROGRESS_BAR_XPATH, PROGRESS_MESSAGE_XPATH,
    QR_ATTRIBUTE,
    QR_CONTAINER,
    QR_SCANNED,
} from './selectors/selectors'
import { BaseAuthStrategy } from './authStrategies/BaseAuthStrategy'
import { Chat } from './services'
import { isElementInDom, observeAndGetElementAttribute } from './utils/elementObserver'


export class Client {
    private readonly puppeteerOptions?: PuppeteerOptions
    private options: ClientOptions
    private page?: Page
    private browser?: Browser
    private readonly Events: WhatzupEvents
    private readonly authStrategy: BaseAuthStrategy

    public chat?: Chat

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
            await this.provideXpathGet()
            await this.checkSessionPageLoadingBar();

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
                this.chat = new Chat(this.page);
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

    private async checkSessionPageLoadingBar(): Promise<void> {
        let lastPercent: null = null;
        let lastPercentMessage: null = null;

        await this.page?.exposeFunction('loadingScreen', async (percent: any, message: any): Promise<void> => {
            if (lastPercent !== percent || lastPercentMessage !== message) {
                lastPercent = percent;
                lastPercentMessage = message;
            }

            if (lastPercent === 100) {
                this.Events.emitChatLoaded('chat loaded')
            }
        });

        await this.page?.evaluate(async (selectors): Promise<void> => {
            const observer: MutationObserver = new MutationObserver(async (): Promise<void> => {
                const progressBar: HTMLProgressElement | null = window.getElementByXPath(selectors.PROGRESS) as HTMLProgressElement | null
                const progressMessage: HTMLElement | null = window.getElementByXPath(selectors.PROGRESS_MESSAGE) as HTMLElement | null

                if (progressBar && progressMessage) {
                    window.loadingScreen(
                        progressBar.value,
                        progressMessage.innerText
                    );
                }
            });

            observer.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true,
            });
        }, {
            PROGRESS: PROGRESS_BAR_XPATH,
            PROGRESS_MESSAGE: PROGRESS_MESSAGE_XPATH,
        });
    }

    async logout(): Promise<void> {
        await this.authStrategy.logout(this, this.browser!, this.puppeteerOptions?.userDataDir!)
        this.Events.emitLogout('logout executed')
    }

    async waitFor(ms: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
    }

    async provideXpathGet(): Promise<void> {
        await this.page?.evaluate((): void => {
            window.getElementByXPath = function (path: string): Element | null {
                const result: Node | null = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                return result as Element | null;
            };
        });
    }

    async getChats() {
        await this.waitFor(2000)
        return this.chat?.getChats()
    }
}
