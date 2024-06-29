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
    LOADED: string
    DISCONNECTED: string
    STATE_CHANGED: string
    BATTERY_CHANGED: string
    INCOMING_CALL: string
    REMOTE_SESSION_SAVED: string
    VOTE_UPDATE: string
    LOGOUT: string
    CHAT_LOADED: string
}

export interface EventMessage {
    message: string;
    error?: Error;
}
