import { Locator, Page } from '@playwright/test';
import { BaseListPageLocators } from '../base/base.listPage.locators';

export class MobileListPageLocators extends BaseListPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-iPhone-Safari and FR-iPhone-Safari specific locators
  filtersButton = () => this.page.locator('button.SearchMaskFilterTags_mobile_filter__zjJKj').filter({ hasText: /^(Filters?|Filtrer)$/i });
  locationFilterText = () => this.page.locator('button[data-testid="filter-list-item"]').nth(0).locator('span.FilterListItem_selectedFilterChipText__bhBn9');
  backIcon = () => this.page.getByTestId('back-icon');
  makeModelTrimFilterText = () => this.page.locator('button[data-testid="filter-list-item"]').nth(3).locator('span.FilterListItem_selectedFilterChipText__bhBn9');
  doneButton = () => this.page.getByTestId('apply-filters-button');
  // #endregion

  // #region EN-iPhone-Safari and FR-iPhone-Safari specific locators that override abstract methods from base
  closeFilterButton = () => this.page.locator('button[data-role="filter-close-button"]');
  saveSearchButtonOnListPageLocator = () => this.page.locator('#save-search-promotion');
  // #endregion
}