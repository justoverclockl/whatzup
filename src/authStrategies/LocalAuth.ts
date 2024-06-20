import { BaseAuthStrategy } from './BaseAuthStrategy'

export class LocalAuth extends BaseAuthStrategy {
    constructor() {
        super()
    }

    async beforeBrowserInitialized() {}
    async afterBrowserInitialized() {}
    async destroy() {}
    async logout() {}
}
