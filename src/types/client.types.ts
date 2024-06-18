import { S3Auth } from '../authStrategies/S3Auth'

export type PuppeteerArgs =
    | '--no-sandbox'
    | '--disable-setuid-sandbox'
    | '--disable-infobars'
    | '--single-process'
    | '--no-zygote'
    | '--no-first-run'
    | '--window-position=0,0'
    | '--ignore-certificate-errors'
    | '--ignore-certificate-errors-skip-list'
    | '--disable-dev-shm-usage'
    | '--disable-accelerated-2d-canvas'
    | '--disable-gpu'
    | '--hide-scrollbars'
    | '--disable-notifications'
    | '--disable-background-timer-throttling'
    | '--disable-backgrounding-occluded-windows'
    | '--disable-breakpad'
    | '--disable-component-extensions-with-background-pages'
    | '--disable-extensions'
    | '--disable-features=TranslateUI,BlinkGenPropertyTrees'
    | '--disable-ipc-flooding-protection'
    | '--disable-renderer-backgrounding'
    | '--enable-features=NetworkService,NetworkServiceInProcess'
    | '--force-color-profile=srgb'
    | '--metrics-recording-only'
    | '--mute-audio'
    | '--disable-web-security'

export interface ClientOptions {
    puppeteer?: {
        headless: boolean
        defaultViewport: null
        args: PuppeteerArgs[]
        userDataDir: string
    }
    authStrategy?: S3Auth
    browserWSEndpoint?: string
    browserURL?: string
    authTimeoutMs?: number
    qrMaxRetries?: number
    takeoverOnConflict?: boolean
    takeoverTimeoutMs?: number
    userAgent?: string
    ffmpegPath?: 'ffmpeg'
    bypassCSP?: boolean
    proxyAuthentication?: undefined
    userDataPath?: string
}

export enum WhatsappStatus {
    INITIALIZING = 0,
    AUTHENTICATING = 1,
    READY = 2,
}
