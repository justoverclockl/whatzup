import { S3AuthOptions } from '../types'
import { promisify } from 'node:util'
import * as fs from 'node:fs'
import { S3Client, PutObjectCommand, HeadObjectCommand, HeadObjectOutput } from '@aws-sdk/client-s3'
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

    public async afterBrowserInitialized(): Promise<void> {
        console.log('started')
        if (fs.existsSync(this.sessionPath)) {
            try {
                //await this.uploadFolder(this.sessionPath);
            } catch (error) {
                throw error;
            }
        } else {
            console.log('no folder detected');
        }
    }

    private async zipAndUploadToBucket() {
        console.log(this.sessionPath)
        const zipFilePath = path.join(process.cwd(), 'whatzup.zip');
        const output = fs.createWriteStream(zipFilePath)
        const archive = archiver('zip', {
            zlib: { level: 9 }
        })
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            console.log('Zip file path:', zipFilePath);
        });
        archive.pipe(output);
        archive.directory(this.sessionPath, false);
        await archive.finalize();
    }

    private async isFileAlreadyUploaded(filePath: string): Promise<{ exists: boolean; metadata?: HeadObjectOutput }> {
        const key: string = path.relative(this.sessionPath, filePath).replace(/\\/g, '/');
        const command: HeadObjectCommand = new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            const metadata = await this.s3.send(command);
            return { exists: true, metadata };
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'NotFound') {
                return { exists: false };
            }
            throw error;
        }
    }

    private async hasFileChanged(filePath: string, metadata: HeadObjectOutput): Promise<boolean> {
        const fileStat = await stat(filePath);

        const localFileSize = fileStat.size;
        const localFileLastModified = fileStat.mtime;

        const s3FileSize = metadata.ContentLength;
        const s3FileLastModified = metadata.LastModified;

        if (s3FileSize !== localFileSize) {
            return true;
        }

        return !!(s3FileLastModified && localFileLastModified > s3FileLastModified);
    }

    private async uploadFile(filePath: string): Promise<void> {
        try {
            const { exists, metadata } = await this.isFileAlreadyUploaded(filePath);

            if (exists && metadata && !(await this.hasFileChanged(filePath, metadata))) {
                console.log(`File has not changed: ${filePath}`);
                return;
            }

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

    private async uploadFolder(localFolderPath: string): Promise<void> {
        try {
            const uploadTasks = await this.getUploadTasks(localFolderPath);
            await Promise.all(uploadTasks)
            this.events.emitS3SessionSaved('session saved');
        } catch (error) {
            throw error;
        }
    }

    private async getUploadTasks(localFolderPath: string): Promise<Promise<void>[]> {
        const uploadTasks: Promise<void>[] = [];

        try {
            const files = await readdir(localFolderPath);

            for (const file of files) {
                const fullPath = path.join(localFolderPath, file);
                const fileStat = await stat(fullPath);

                if (fileStat.isFile()) {
                    uploadTasks.push(this.uploadFile(fullPath));
                } else if (fileStat.isDirectory()) {
                    uploadTasks.push(...await this.getUploadTasks(fullPath));
                }
            }
        } catch (error) {
            console.error('Error retrieving folder contents:', error);
            throw error;
        }

        return uploadTasks;
    }
}
