

export class BaseAuthStrategy {
    constructor() {
    }

    async beforeBrowserInitialized() {}
    async afterBrowserInitialized() {}
    async destroy() {}
    async logout() {}
}
