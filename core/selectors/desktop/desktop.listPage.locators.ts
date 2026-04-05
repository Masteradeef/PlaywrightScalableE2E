import { Locator, Page } from '@playwright/test';
import { BaseListPageLocators } from '../common/shared.listPage.locators';

export class DesktopListPageLocators extends BaseListPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  closeFilterButton = () => this.page.getByTestId('close-icon');
  saveSearchButtonOnListPageLocator = () => this.page.locator('#save-search-list-button');
  displayValue = () => this.page.locator('div.SearchMaskListHeader_desktopSort__qwNZq #page-size-dropdown-select');
  listPageHeaderTitle = () => this.page.locator('div[class*="SearchMaskListHeader_desktop"] h1[data-testid="list-header-title"]');
  // #endregion

  // #region Legacy Trader EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  legacyMakeFilter = () => this.page.locator('#faceted-parent-Make a.dropdown-toggle');
  legacyModelFilter = () => this.page.locator('#faceted-Model');
  // #endregion
}














