import EventEmitter from "node:events";
import puppeteer, { Browser, Page } from "puppeteer";
import { DEFAULT_CLIENT_OPTIONS, WHATSAPP_WEB_URL } from "./helpers/constants";
import {PuppeteerDefaultOptions} from "./types/client.types";

export class Client extends EventEmitter {
  private readonly options: PuppeteerDefaultOptions = DEFAULT_CLIENT_OPTIONS;
  private page: Page | undefined;
  private browser: Browser | undefined;

  constructor(options = {}) {
    super();

    this.options = {
      ...DEFAULT_CLIENT_OPTIONS,
      ...options,
    };
  }

  async initialize() {
    if (this.options && this.options.browserWSEndpoint) {
      this.browser = await puppeteer.connect(this.options.puppeteer);
      this.page = await this.browser.newPage();
    } else {

    }
    if (this.options.proxyAuthentication !== undefined) {
      await this.page?.authenticate(this.options.proxyAuthentication);
    }

    if (this.options.bypassCSP) {
      await this.page?.setBypassCSP(this.options.bypassCSP);
    }

    await this.page?.setUserAgent(this.options.userAgent);
    this.browser = await puppeteer.launch({ ...this.options.puppeteer });
    this.page = (await this.browser.pages())[0];

    await this.page.evaluateOnNewDocument(() => {
      const newError: ErrorConstructor = Error;
      return newError;
    });

    await this.page.goto(WHATSAPP_WEB_URL, {
      waitUntil: "load",
      timeout: 0,
      referer: "https://whatsapp.com/",
    });
  }
}
