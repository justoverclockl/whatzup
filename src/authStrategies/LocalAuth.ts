import path from 'path'
import { LocalAuthOptions } from '../types/localAuth.types'

export class LocalAuth {
    public path: string
    public clientId: string

    constructor({ clientId, path: authPath }: LocalAuthOptions) {
        const idRegex: RegExp = /^[-_\w]+$/i
        if (clientId && !idRegex.test(clientId)) {
            throw new Error(
                'ClientId must contain only alphanumeric characters'
            )
        }

        this.path = path.resolve(authPath || './.whatzupAuth/')
        this.clientId = clientId || ''
    }
}
