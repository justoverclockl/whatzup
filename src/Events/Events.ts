import { EventEmitter } from 'node:events'
import { EVENTS } from '../helpers/constants'

export class WhatzupEvents extends EventEmitter {
    static readonly READY = EVENTS.READY
    static readonly LOADED = EVENTS.LOADED
    static readonly QR_CODE_READY = EVENTS.QR_RECEIVED
    static readonly S3_SESSION_SAVED = EVENTS.REMOTE_SESSION_SAVED
    static readonly AUTHENTICATED = EVENTS.AUTHENTICATED

    constructor() {
        super()
    }

    emitReady(message: string, error?: Error) {
        error
            ? this.emit(WhatzupEvents.READY, { message, error })
            : this.emit(WhatzupEvents.READY, message)
    }

    emitLoadComplete(message: string, error?: Error) {
        error
            ? this.emit(WhatzupEvents.LOADED, { message, error })
            : this.emit(WhatzupEvents.LOADED, message)
    }

    emitQr(qr: string | Promise<string>, error?: Error) {
        error
            ? this.emit(WhatzupEvents.QR_CODE_READY, { error })
            : this.emit(WhatzupEvents.QR_CODE_READY, qr)
    }

    emitAuthenticated(message: string, error?: Error) {
        error
            ? this.emit(WhatzupEvents.AUTHENTICATED, { message, error })
            : this.emit(WhatzupEvents.AUTHENTICATED, message)
    }

    emitS3SessionSaved(message: string, error?: Error) {
        error
            ? this.emit(WhatzupEvents.S3_SESSION_SAVED, { message, error })
            : this.emit(WhatzupEvents.S3_SESSION_SAVED, message)
    }
}
