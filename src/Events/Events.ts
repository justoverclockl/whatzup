import { EventEmitter } from 'node:events';
import { EVENTS } from '../helpers/constants';
import { EventMessage } from '../types';

export class WhatzupEvents extends EventEmitter {
    static readonly READY: string = EVENTS.READY;
    static readonly LOADED: string = EVENTS.LOADED;
    static readonly QR_CODE_READY: string = EVENTS.QR_RECEIVED;
    static readonly S3_SESSION_SAVED: string = EVENTS.REMOTE_SESSION_SAVED;
    static readonly AUTHENTICATED: string = EVENTS.AUTHENTICATED;
    static readonly LOGOUT: string = EVENTS.LOGOUT;

    constructor() {
        super();
    }

    emitReady(message: string, error?: Error) {
        const eventMessage: EventMessage = error ? { message, error } : { message };
        this.emit(WhatzupEvents.READY, eventMessage);
    }

    emitLoadComplete(message: string, error?: Error) {
        const eventMessage: EventMessage = error ? { message, error } : { message };
        this.emit(WhatzupEvents.LOADED, eventMessage);
    }

    emitQr(qr: string, error?: Error) {
        const eventMessage: EventMessage = error ? { message: qr, error } : { message: qr };
        this.emit(WhatzupEvents.QR_CODE_READY, eventMessage);
    }

    emitAuthenticated(message: string, error?: Error) {
        const eventMessage: EventMessage = error ? { message, error } : { message };
        this.emit(WhatzupEvents.AUTHENTICATED, eventMessage);
    }

    emitS3SessionSaved(message: string, error?: Error) {
        const eventMessage: EventMessage = error ? { message, error } : { message };
        this.emit(WhatzupEvents.S3_SESSION_SAVED, eventMessage);
    }

    emitLogout(message: string, error?: Error) {
        const eventMessage: EventMessage = error ? { message, error } : { message };
        this.emit(WhatzupEvents.LOGOUT, eventMessage);
    }
}
