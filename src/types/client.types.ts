import { LocalAuthOptions } from './localAuth.types'
import { LocalAuth } from '../authStrategies/LocalAuth'

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

export interface ClientOptions {
    puppeteer?: {
        headless: boolean
        defaultViewport: null
        args: PuppeteerArgs[]
    }
    authStrategy?: LocalAuth
    webVersion?: string
    webVersionCache?: {
        type: 'local' | 'remote'
    }
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
}

export enum WhatsappStatus {
    INITIALIZING = 0,
    AUTHENTICATING = 1,
    READY = 2,
}

export interface WhatsappEvents {
    AUTHENTICATED: string
    AUTHENTICATION_FAILURE: string
    READY: string
    CHAT_REMOVED: string
    CHAT_ARCHIVED: string
    MESSAGE_RECEIVED: string
    MESSAGE_CIPHERTEXT: string
    MESSAGE_CREATE: string
    MESSAGE_REVOKED_EVERYONE: string
    MESSAGE_REVOKED_ME: string
    MESSAGE_ACK: string
    MESSAGE_EDIT: string
    UNREAD_COUNT: string
    MESSAGE_REACTION: string
    MEDIA_UPLOADED: string
    CONTACT_CHANGED: string
    GROUP_JOIN: string
    GROUP_LEAVE: string
    GROUP_ADMIN_CHANGED: string
    GROUP_MEMBERSHIP_REQUEST: string
    GROUP_UPDATE: string
    QR_RECEIVED: string
    LOADING_SCREEN: string
    DISCONNECTED: string
    STATE_CHANGED: string
    BATTERY_CHANGED: string
    INCOMING_CALL: string
    REMOTE_SESSION_SAVED: string
    VOTE_UPDATE: string
}
