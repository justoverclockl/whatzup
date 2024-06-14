import { EventEmitter } from 'node:events'

export class WhatzupEvents extends EventEmitter {
    static readonly READY = 'ready'

    constructor() {
        super()
    }

    emitReady(message: string) {
        this.emit(WhatzupEvents.READY, message)
    }
}
