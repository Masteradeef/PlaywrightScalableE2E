import { Page, BrowserContext } from '@playwright/test';

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export class CookieHelper {
  private page: Page;
  private context: BrowserContext;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }

  /**
   * Add a single cookie to the browser context
   * @param cookie Cookie object to add
   */
  async addCookie(cookie: Cookie): Promise<void> {
    await this.context.addCookies([{
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || '.autotrader.ca',
      path: cookie.path || '/',
      expires: cookie.expires,
      httpOnly: cookie.httpOnly || false,
      secure: cookie.secure || true,
      sameSite: cookie.sameSite || 'None'
    }]);
  }

  /**
   * Add multiple cookies to the browser context
   * @param cookies Array of cookie objects to add
   */
  async addCookies(cookies: Cookie[]): Promise<void> {
    const formattedCookies = cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || '.autotrader.ca',
      path: cookie.path || '/',
      expires: cookie.expires,
      httpOnly: cookie.httpOnly || false,
      secure: cookie.secure || true,
      sameSite: cookie.sameSite || 'None' as const
    }));

    await this.context.addCookies(formattedCookies);
  }

  /**
   * Add the OMP (One Marketplace) cookie
   */
  async addOmpCookie(): Promise<void> {
    await this.addCookie({
      name: 'omoptin',
      value: 'one-marketplace',
      domain: '.autotrader.ca',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 86400,
      secure: true,
      sameSite: 'Lax'
    });
  }

  /**
   * Add the favourite notification cookie
   */
  async addFavouriteCookie(): Promise<void> {
    await this.addCookie({
      name: 'toguru-enable-notification-on-favorite',
      value: 'true',
      domain: '.autotrader.ca',
      path: '/',
      expires: Math.floor(new Date('2026-11-06T14:11:21.000Z').getTime() / 1000),
      secure: true,
      sameSite: 'None'
    });
  }

  /**
   * Add the AutoHebdo cookie
   */
  async addAutoHebdoCookie(): Promise<void> {
    await this.addCookie({
      name: 'omoptin',
      value: 'one-marketplace',
      domain: '.autohebdo.net',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 86400,
      secure: true,
      sameSite: 'Lax'
    });
  }

  /**
   * Add the ETI (Trade-in ingress and price estimation) cookie
   */
  async addEtiCookie(): Promise<void> {
    await this.addCookie({
      name: 'toguru',
      value: 'enable-trade-in-ingress-and-price-estimation-for-ca=true',
      domain: '.autotrader.ca',
      path: '/',
      secure: true,
      sameSite: 'None'
    });
  }

  /**
   * Add the hide welcome popup cookie for both domains
   */
  async addHideWelcomePopupCookie(): Promise<void> {
    await this.addCookies([
      {
        name: 'hideWelcomePopup',
        value: 'true',
        domain: '.autotrader.ca',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 86400
      },
      {
        name: 'hideWelcomePopup',
        value: 'true',
        domain: '.autohebdo.net',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 86400
      }
    ]);
  }

  /**
   * Add all common cookies at once (OMP + Favourite + AutoHebdo + ETI + HideWelcomePopup)
   */
  async addAllCommonCookies(): Promise<void> {
    await this.addCookies([
      {
        name: 'omoptin',
        value: 'one-marketplace',
        domain: '.autotrader.ca',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + 86400,
        secure: true,
        sameSite: 'Lax'
      },
      {
        name: 'omoptin',
        value: 'one-marketplace',
        domain: '.autohebdo.net',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + 86400,
        secure: true,
        sameSite: 'Lax'
      },
      {
        name: 'hideWelcomePopup',
        value: 'true',
        domain: '.autotrader.ca',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + 86400,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      },
      {
        name: 'hideWelcomePopup',
        value: 'true',
        domain: '.autohebdo.net',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + 86400,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }
    ]);
  }

  /**
   * Get all cookies from the current context
   */
  async getAllCookies(): Promise<any[]> {
    return await this.context.cookies();
  }

  /**
   * Get a specific cookie by name
   * @param name Cookie name to retrieve
   */
  async getCookie(name: string): Promise<any | undefined> {
    const cookies = await this.getAllCookies();
    return cookies.find(cookie => cookie.name === name);
  }

  /**
   * Clear all cookies from the context
   */
  async clearAllCookies(): Promise<void> {
    await this.context.clearCookies();
  }

  /**
   * Clear a specific cookie by name
   * @param name Cookie name to clear
   */
  async clearCookie(name: string): Promise<void> {
    await this.context.clearCookies({ name });
  }

  /**
   * Check if a specific cookie exists
   * @param name Cookie name to check
   */
  async hasCookie(name: string): Promise<boolean> {
    const cookie = await this.getCookie(name);
    return cookie !== undefined;
  }
}