import { S3AuthOptions } from '../types'
import { promisify } from 'node:util'
import * as fs from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import path from 'node:path'
import { WhatzupEvents } from '../Events/Events'
import { BaseAuthStrategy } from './BaseAuthStrategy'
import archiver from 'archiver';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export class S3Auth extends BaseAuthStrategy {
    private readonly accessKey: string;
    private readonly secretKey: string;
    private readonly region: string;
    private readonly bucketName: string;
    private s3: S3Client;
    private readonly sessionPath: string;
    private events: WhatzupEvents;

    constructor({ accessKey, secretKey, region, bucketName }: S3AuthOptions) {
        super();
        this.sessionPath = path.join(process.cwd(), '.whatzup');
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.region = region;
        this.bucketName = bucketName;
        this.events = new WhatzupEvents();

        this.s3 = new S3Client({
            region: this.region,
            maxAttempts: 3,
            credentials: {
                accessKeyId: this.accessKey,
                secretAccessKey: this.secretKey,
            },
        });
    }

    public async beforeBrowserInitialized() {
        await this.zipAndUploadToBucket();
    }

    public async afterBrowserInitialized(): Promise<void> {}

    private async zipAndUploadToBucket() {
        const zipFilePath = path.join(process.cwd(), 'whatzup.zip');
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        return new Promise<void>((resolve, reject) => {
            output.on('close', async () => {
                console.log(archive.pointer() + ' total bytes');
                console.log('Archiver has been finalized and the output file descriptor has closed.');
                console.log('Zip file path:', zipFilePath);

                try {
                    await this.uploadFile(zipFilePath);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(this.sessionPath, false);
            archive.finalize();
        });
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
            console.log(`Uploaded file: ${filePath}`);
        } catch (error) {
            throw error;
        }
    }
}
