import { Locator, Page } from '@playwright/test';
import { BaseSharedLocators } from '../base/base.shared.locators';

export class DesktopSharedLocators extends BaseSharedLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  loginButton = (): Locator => this.page.locator('[data-id="okta-login-button"]');
  
  favouritesIcon = (): Locator => this.page.getByTestId('hfo_favorites-star--desktop');
  // #endregion

  // #region Desktop-only locators
  loggedInText = (): Locator => this.page.locator('[testid="hfo-desktop-drowndown-btn"] span.hfo-nav__button__subtitle').filter({ hasText: /logged in|connecté/i });
  // #endregion
}