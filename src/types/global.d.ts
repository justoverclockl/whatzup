export {};

declare global {
    interface Window {
        loadingScreen: (percent: any, message: any) => void;
        getElementByXPath: (path: string) => Element | null;
    }
}
