import { ClientOptions, WhatsappStatus } from '../types'


export const WHATSAPP_WEB_URL: string = "https://web.whatsapp.com/";
export const DEFAULT_CLIENT_OPTIONS: ClientOptions = {
  puppeteer: {
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    userDataDir: './.whatzup'
  },
  authTimeoutMs: 0,
  qrMaxRetries: 0,
  takeoverOnConflict: false,
  takeoverTimeoutMs: 0,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
  ffmpegPath: "ffmpeg",
  bypassCSP: false,
  proxyAuthentication: undefined,
};

export const WHATSAPP_STATUS = {
  INITIALIZING: WhatsappStatus.INITIALIZING,
  AUTHENTICATING: WhatsappStatus.AUTHENTICATING,
  READY: WhatsappStatus.READY,
};
