import { Page } from 'puppeteer'
import { CHAT_LIST_ITEM_SELECTOR } from '../selectors/selectors'
import {load} from 'cheerio'



export class Chat {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async getChats() {
        try {
            // TODO: find a method to retrieve all chats because this not work

            const elements = await this.page.$$eval(CHAT_LIST_ITEM_SELECTOR, elements =>
                elements.map(element => {
                    return element.outerHTML
                })
            );

            const $ = load(elements.join(''))
            const title = $('div._ak8l > div._ak8o > div._ak8q > div > span')
            title.each((i, element) => {
                console.log($(element).text())
            })


        } catch (error) {
            console.error('Error finding elements:', error);
            return [];
        }
    }
}
