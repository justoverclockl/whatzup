import { Page } from 'puppeteer'
import { CHAT_LIST_CONTAINER, CHAT_LIST_ITEM_SELECTOR, QR_CONTAINER } from '../selectors/selectors'
import { isElementInDom } from '../utils/elementObserver'

export class Chat {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    /*async getChats() {
        try {
            await this.page.waitForSelector('.x10l6tqk', { visible: false });

            const chats = await this.page.$$eval('.x10l6tqk', elements => {
                return elements.map(element => {
                    const titleElement = element.querySelector('._aou8 > span');

                    if (titleElement) {
                        const title = titleElement.textContent
                        return {
                            title: title,
                        };
                    }
                }).filter(chat => chat !== null)
            })
            return chats
        } catch (error) {
            console.error('Error finding elements:', error);
            return [];
        }
    }*/

    async getChats() {
        const containerSelector = CHAT_LIST_CONTAINER;
        const elementSelector = CHAT_LIST_ITEM_SELECTOR;

        try {
            await this.page.evaluate(async (containerSelector) => {
                const container = document.querySelector(containerSelector);
                if (container) {
                    container.scrollTop = container.scrollHeight;
                    await new Promise(resolve => setTimeout(resolve, 4000));
                }
            }, containerSelector);

            const elements = await this.page.$$eval(elementSelector, elements =>
                elements.map(element => {
                    const titleElement = element.querySelector('._aou8._aj_h > span');

                    if (titleElement) {
                        const title = titleElement.textContent
                        return {
                            title: title,
                        };
                    }
                }).filter(chat => chat !== null)
            );

            console.log('Elements found:', elements);

        } catch (error) {
            console.error('Error finding elements:', error);
            return [];
        }
    }
}
