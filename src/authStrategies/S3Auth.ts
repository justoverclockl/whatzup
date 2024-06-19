import { S3AuthOptions } from '../types'
import { promisify } from 'node:util'
import * as fs from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'node:path'
import { WhatzupEvents } from '../Events/Events'
import { BaseAuthStrategy } from './BaseAuthStrategy'
import { Client } from '../Client'


const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export class S3Auth extends BaseAuthStrategy {
    private readonly accessKey: string
    private readonly secretKey: string
    private readonly region: string
    private readonly bucketName: string
    private s3: S3Client;
    private readonly sessionPath: string;
    private events: WhatzupEvents

    constructor({ accessKey, secretKey, region, bucketName }: S3AuthOptions) {
        super()
        this.sessionPath = path.join(process.cwd(), '.whatzup');
        this.accessKey = accessKey
        this.secretKey = secretKey
        this.region = region
        this.bucketName = bucketName
        this.events = new WhatzupEvents()


        this.s3 = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.accessKey,
                secretAccessKey: this.secretKey,
            },
        });
    }

    public async afterBrowserInitialized(): Promise<void> {
        if (fs.existsSync(this.sessionPath)) {
            try {
                 await this._uploadFolderRecursive(this.sessionPath);
            } catch (error) {
                throw error;
            }
        } else {
            console.log('no folder detected')
        }
    }

    private async uploadFile(filePath: string): Promise<void> {
        try {
            const fileContent: Buffer = await fs.promises.readFile(filePath);
            const key: string = path.relative(this.sessionPath, filePath).replace(/\\/g, '/');
            const command: PutObjectCommand = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileContent,
            });

            await this.s3.send(command);
        } catch (error) {
            throw error;
        }
    }

    private async _uploadFolderRecursive(localFolderPath: string, retryCount = 3): Promise<number> {
        let totalUploads: number = 0;

        try {
            const files = await readdir(localFolderPath);

            for (const file of files) {
                const fullPath = path.join(localFolderPath, file);
                const fileStat = await stat(fullPath);

                if (fileStat.isFile()) {
                    await this.uploadFile(fullPath);
                    totalUploads++;
                } else if (fileStat.isDirectory()) {
                    totalUploads += await this._uploadFolderRecursive(fullPath);
                }
            }

            return totalUploads;
        } catch (error) {
            if (retryCount > 0) {
                return await this._uploadFolderRecursive(localFolderPath, retryCount - 1);
            } else {
                throw error;
            }
        }
    }
}
