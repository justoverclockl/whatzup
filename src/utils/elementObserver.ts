import { Page } from 'puppeteer'
import { WhatzupEvents } from '../Events/Events'

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


export const observeAndGetElementAttribute = async (
    page: Page,
    elementSelector: string,
    elementAttribute: string,
    event: WhatzupEvents
) => {
    if (!page) {
        return null
    }

    const attributeValue: string | null = await page?.evaluate(
        (selector: string, attribute: string) => {
            return new Promise<string | null>((resolve) => {
                const element: Element | null = document.querySelector(selector)
                if (!element) {
                    return resolve(null)
                }

                const observer: MutationObserver = new MutationObserver(
                    (): void => {
                        if (element.hasAttribute(attribute)) {
                            const value: string | null =
                                element.getAttribute(attribute)
                            observer.disconnect()
                            resolve(value)
                        }
                    }
                )

                observer.observe(element, { attributes: true })

                if (element.hasAttribute(attribute)) {
                    const initialValue: string | null = element.getAttribute(attribute)
                    observer.disconnect()
                    resolve(initialValue)
                }
            })
        },
        elementSelector,
        elementAttribute
    )

    if (attributeValue !== null) {
        event.emitQr(attributeValue)
    }

    return attributeValue
}
