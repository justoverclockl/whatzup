import { EventEmitter } from 'node:events'
import { WaEvents } from '../types'

export class WhatzupEvents extends EventEmitter {
    static readonly READY = WaEvents.READY
    static readonly LOADED = WaEvents.LOADING_SCREEN
    static readonly QR_CODE_READY = WaEvents.QR_RECEIVED

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
}
