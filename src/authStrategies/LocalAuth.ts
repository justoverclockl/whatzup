import path from 'path'
import { LocalAuthOptions } from '../types/localAuth.types'
import { Page } from 'puppeteer'
import * as fs from 'node:fs'

export class LocalAuth {
    public sessionPath: string
    public clientId: string

    constructor({ clientId, sessionPath }: LocalAuthOptions) {
        const idRegex: RegExp = /^[-_\w]+$/i
        if (clientId && !idRegex.test(clientId)) {
            throw new Error(
                'ClientId must contain only alphanumeric characters'
            )
        }

        this.sessionPath = path.resolve(`${process.cwd()}/${sessionPath}` || './.whatzupAuth/')
        this.clientId = clientId || ''
    }

    private async saveLocalStorage(page: Page): Promise<void> {
        const sessionPath: string = this.clientId ? `session-${this.clientId}` : 'session';
        const dirPath: string = path.join(process.cwd(), sessionPath);

        const localStorageData = await page.evaluate(() => {
            const json: { [key: string]: string | null } = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    json[key] = localStorage.getItem(key);
                }
            }
            return json;
        });

        fs.writeFileSync(path.join(dirPath, 'localStorage.json'), JSON.stringify(localStorageData, null, 2));
    }

    private async saveIndexedDB(page: Page): Promise<void> {
        const sessionPath: string = this.clientId ? `session-${this.clientId}` : 'session';
        const dirPath: string = path.join(process.cwd(), sessionPath);

        const indexedDBData = await page.evaluate(() => {
            return new Promise<{ [key: string]: any }>((resolve, reject) => {
                let data: { [storeName: string]: { [key: string]: any } } = {};
                let request: IDBOpenDBRequest = indexedDB.open('wawc');
                request.onsuccess = function (event) {
                    let db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
                    let transaction: IDBTransaction = db.transaction(Array.from(db.objectStoreNames), 'readonly');
                    transaction.oncomplete = function () {
                        resolve(data);
                    };
                    transaction.onerror = function (event: Event) {
                        reject((event.target as IDBRequest).error);
                    };
                    Array.from(db.objectStoreNames).forEach(storeName => {
                        let store: IDBObjectStore = transaction.objectStore(storeName);
                        let storeData: { [key: string]: any } = {};
                        store.openCursor().onsuccess = function (event) {
                            let cursor: IDBCursorWithValue = (event.target as IDBRequest<IDBCursorWithValue>).result;
                            if (cursor) {
                                storeData[cursor.key.toString()] = cursor.value;
                                cursor.continue();
                            } else {
                                data[storeName] = storeData;
                            }
                        };
                    });
                };
                request.onerror = function (event: Event) {
                    reject((event.target as IDBRequest).error);
                };
            });
        });
        fs.writeFileSync(path.join(dirPath, 'indexedDB.json'), JSON.stringify(indexedDBData, null, 2));
    }

    async saveSession(page: Page): Promise<void> {
        const sessionPath: string = this.clientId ? `session-${this.clientId}` : 'session';
        const dirPath: string = path.join(process.cwd(), sessionPath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }

        await this.saveLocalStorage(page);
        await this.saveIndexedDB(page);
    }

    async restoreSession(page: Page): Promise<void> {
        const sessionPath: string = this.clientId ? `session-${this.clientId}` : 'session';
        const dirPath: string = path.join(sessionPath);

        const sessionJson: string = path.join(dirPath, `localStorage.json`);
        console.log(sessionJson)
        if (fs.existsSync(sessionJson)) {
            const localStorageData = JSON.parse(fs.readFileSync(sessionJson, 'utf-8'));
            await page.evaluateOnNewDocument((data) => {
                for (let key in data) {
                    localStorage.setItem(key, data[key]);
                }
            }, localStorageData);
        } else {
            console.log('No localStorage session data found to restore.');
        }

        const indexedDBJson: string = path.join(dirPath, `indexedDB.json`);
        if (fs.existsSync(indexedDBJson)) {
            const indexedDBData = JSON.parse(fs.readFileSync(indexedDBJson, 'utf-8'));

            await page.evaluate(async (data) => {
                function getResultFromRequest(request: IDBRequest<IDBValidKey>) {
                    return new Promise<void>((resolve, reject) => {
                        request.onsuccess = function(event: Event) {
                            resolve();
                        };
                        request.onerror = function(event: Event) {
                            reject(request.error);
                        };
                    });
                }

                async function getDB(): Promise<IDBDatabase> {
                    return new Promise<IDBDatabase>((resolve, reject) => {
                        const request: IDBOpenDBRequest = indexedDB.open('wawc');
                        request.onsuccess = function(event: Event) {
                            resolve(request.result);
                        };
                        request.onerror = function(event: Event) {
                            reject(request.error);
                        };
                    });
                }

                const db: IDBDatabase = await getDB();

                for (let storeName in data) {
                    const storeData = data[storeName];
                    const transaction: IDBTransaction = db.transaction(storeName, 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(storeName);

                    for (let key in storeData) {
                        await getResultFromRequest(objectStore.put(storeData[key], key));
                    }
                }
            }, indexedDBData);
        } else {
            console.log('No IndexedDB session data found to restore.');
        }
    }

}
