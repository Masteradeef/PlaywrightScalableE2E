import { Locator, Page } from '@playwright/test';
import { BaseSharedLocators } from '../base/base.shared.locators';

export class MobileSharedLocators extends BaseSharedLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Mobile and FR-Mobile specific locators that override abstract methods from base
  loginButton = (): Locator => {
    throw new Error('loginButton is handled differently on mobile - use hamburgerMenu and logInSignUpButton');
  };
  
  favouritesIcon = (): Locator => this.page.locator('a[href="/favorites"] div.hfo-header__mobile-bell-enabled.hfo-header__mobile-favorite-star-link-icon-wrapper');
  // #endregion

  // #region Mobile-only locators
  hamburgerMenu = (): Locator => this.page.locator('#hfo-mobile-burger-button');
  
  logInSignUpButton = (): Locator => this.page.locator('#mobile-login-button');
  
  closeMenuIcon = (): Locator => this.page.locator('#hfo-mobile-burger-button.hfo-mobile-menu-open');
  // #endregion
}