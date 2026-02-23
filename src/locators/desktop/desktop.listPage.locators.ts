import { Locator, Page } from '@playwright/test';
import { BaseListPageLocators } from '../base/base.listPage.locators';

export class DesktopListPageLocators extends BaseListPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  closeFilterButton = () => this.page.getByTestId('close-icon');
  saveSearchButtonOnListPageLocator = () => this.page.locator('#save-search-list-button');
  // #endregion
}