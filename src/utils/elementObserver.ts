import { Page } from 'puppeteer'

export const isElementInDom = async (page: Page, elementSelector: string): Promise<boolean> => {
    try {
        const isElement: boolean | undefined = await page?.evaluate(async (selector: string): Promise<boolean> => {
            return new Promise<boolean>((resolve): void => {
                const element: Element | null = document.querySelector(selector);

                if (element) {
                    resolve(true);
                    return;
                }

                const observer: MutationObserver = new MutationObserver((): void => {
                    const scannedElement: Element | null = document.querySelector(selector);
                    if (scannedElement) {
                        observer.disconnect();
                        resolve(true);
                    }
                });

                observer.observe(document, { childList: true, subtree: true });

                setTimeout(() => {
                    observer.disconnect();
                    resolve(false);
                }, 5000);
            });
        }, elementSelector);

        return isElement || false;
    } catch (error) {
        return false;
    }
}
