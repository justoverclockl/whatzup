export class LocalAuth {
    public path: string
    public clientId: string

    constructor({ clientId, path }) {
        const idRegex: RegExp = /^[-_\w]+$/i;
        if(clientId && !idRegex.test(clientId)) {
            throw new Error('ClientId must contain only alphanumeric characters');
        }

        this.path = path.resolve(path || './.whatzupAuth/');
        this.clientId = clientId;
    }
}
