import { EventEmitter } from 'node:events'
import { EVENTS } from '../helpers/constants'
import { EventMessage } from '../types'

export class WhatzupEvents extends EventEmitter {
    static readonly READY: string = EVENTS.READY
    static readonly LOADED: string = EVENTS.LOADED
    static readonly QR_CODE_READY: string = EVENTS.QR_RECEIVED
    static readonly S3_SESSION_SAVED: string = EVENTS.REMOTE_SESSION_SAVED
    static readonly AUTHENTICATED: string = EVENTS.AUTHENTICATED

    constructor() {
        super()
    }

    emitReady(message: EventMessage, error?: Error) {
        error
            ? this.emit(WhatzupEvents.READY, { message, error })
            : this.emit(WhatzupEvents.READY, message)
    }

    emitLoadComplete(message: EventMessage, error?: Error) {
        error
            ? this.emit(WhatzupEvents.LOADED, { message, error })
            : this.emit(WhatzupEvents.LOADED, message)
    }

    emitQr(qr: EventMessage | Promise<string>, error?: Error) {
        error
            ? this.emit(WhatzupEvents.QR_CODE_READY, { error })
            : this.emit(WhatzupEvents.QR_CODE_READY, qr)
    }

    emitAuthenticated(message: EventMessage, error?: Error) {
        error
            ? this.emit(WhatzupEvents.AUTHENTICATED, { message, error })
            : this.emit(WhatzupEvents.AUTHENTICATED, message)
    }

    emitS3SessionSaved(message: EventMessage, error?: Error) {
        error
            ? this.emit(WhatzupEvents.S3_SESSION_SAVED, { message, error })
            : this.emit(WhatzupEvents.S3_SESSION_SAVED, message)
    }
}
