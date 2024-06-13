/// <reference types="node" />
import EventEmitter from "node:events";
export default class Client extends EventEmitter {
    private options;
    private page;
    private browser;
    constructor(options?: {});
    initialize(): Promise<void>;
}
