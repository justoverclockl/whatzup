import { ClientOptions, WhatsappEvents, WhatsappStatus } from '../types/client.types'


export const WHATSAPP_WEB_URL: string = "https://web.whatsapp.com/";
export const DEFAULT_CLIENT_OPTIONS: ClientOptions = {
  puppeteer: {
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  webVersion: "2.2346.52",
  webVersionCache: {
    type: "local",
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

export const EVENTS: WhatsappEvents = {
  AUTHENTICATED: "authenticated",
  AUTHENTICATION_FAILURE: "auth_failure",
  READY: "ready",
  CHAT_REMOVED: "chat_removed",
  CHAT_ARCHIVED: "chat_archived",
  MESSAGE_RECEIVED: "message",
  MESSAGE_CIPHERTEXT: "message_ciphertext",
  MESSAGE_CREATE: "message_create",
  MESSAGE_REVOKED_EVERYONE: "message_revoke_everyone",
  MESSAGE_REVOKED_ME: "message_revoke_me",
  MESSAGE_ACK: "message_ack",
  MESSAGE_EDIT: "message_edit",
  UNREAD_COUNT: "unread_count",
  MESSAGE_REACTION: "message_reaction",
  MEDIA_UPLOADED: "media_uploaded",
  CONTACT_CHANGED: "contact_changed",
  GROUP_JOIN: "group_join",
  GROUP_LEAVE: "group_leave",
  GROUP_ADMIN_CHANGED: "group_admin_changed",
  GROUP_MEMBERSHIP_REQUEST: "group_membership_request",
  GROUP_UPDATE: "group_update",
  QR_RECEIVED: "qr",
  LOADING_SCREEN: "loading_screen",
  DISCONNECTED: "disconnected",
  STATE_CHANGED: "change_state",
  BATTERY_CHANGED: "change_battery",
  INCOMING_CALL: "call",
  REMOTE_SESSION_SAVED: "remote_session_saved",
  VOTE_UPDATE: "vote_update",
};
