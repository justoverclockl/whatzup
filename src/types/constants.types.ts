import {PuppeteerDefaultOptions, WhatsappEvents, WhatsappStatus} from "./client.types";


export declare const WHATSAPP_WEB_URL: string;
export declare const DEFAULT_CLIENT_OPTIONS: PuppeteerDefaultOptions;
export declare const WHATSAPP_STATUS: {
    INITIALIZING: WhatsappStatus;
    AUTHENTICATING: WhatsappStatus;
    READY: WhatsappStatus;
};
export declare const EVENTS: WhatsappEvents;
