import path from 'path'
import { S3AuthOptions } from '../types'

const s3secret = '9+6GY3VAHD+f6K3+GV4kMi22oI1IFwuV/G9tikT7'
const s3Access = 'AKIAYS2NSEWWEAJLKCXE'

export class S3Auth {
    private accessKey: string
    private secretKey: string

    constructor({ accessKey, secretKey }: S3AuthOptions) {
        this.accessKey = accessKey
        this.secretKey = secretKey
    }
}
