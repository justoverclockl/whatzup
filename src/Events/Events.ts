import { EventEmitter } from 'node:events'

export class WhatzupEvents extends EventEmitter {
    static readonly READY = 'ready'
    static readonly LOADED = 'loaded'
    static readonly QR_CODE_READY = 'qr'

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
            ? this.emit(WhatzupEvents.LOADED, { error })
            : this.emit(WhatzupEvents.LOADED, qr)
    }
}
