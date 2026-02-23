import { Locator, Page } from '@playwright/test';
import { BaseHomePageLocators } from '../base/base.homePage.locators';

export class MobileHomePageLocators extends BaseHomePageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Mobile and FR-Mobile specific locators that override abstract methods from base
  // #endregion
}
