import path from 'path'
import { S3AuthOptions } from '../types'

export class S3Auth {
    private accessKey: string
    private secretKey: string

    constructor({ accessKey, secretKey }: S3AuthOptions) {
        this.accessKey = accessKey
        this.secretKey = secretKey
    }
}
