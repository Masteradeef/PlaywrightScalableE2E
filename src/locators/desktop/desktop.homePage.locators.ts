import { Locator, Page } from '@playwright/test';
import { BaseHomePageLocators } from '../base/base.homePage.locators';

export class DesktopHomePageLocators extends BaseHomePageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  // #endregion
}
