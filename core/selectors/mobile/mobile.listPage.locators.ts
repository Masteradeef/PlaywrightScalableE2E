import { Locator, Page } from '@playwright/test';
import { BaseListPageLocators } from '../common/shared.listPage.locators';

export class MobileListPageLocators extends BaseListPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-iPhone-Safari and FR-iPhone-Safari specific locators
  filtersButton = () => this.page.locator('.SearchMaskFilterTags_wrapper__F_I_u').getByRole('button', { name: /^(Filters?|Filtrer)$/i });
  locationFilterText = () => this.page.locator('button[data-testid="filter-list-item"]').nth(0).locator('span.FilterListItem_selectedFilterChipText__bhBn9');
  backIcon = () => this.page.getByTestId('back-icon');
  makeModelTrimFilterText = () => this.page.locator('button[data-testid="filter-list-item"]').nth(3).locator('span.FilterListItem_selectedFilterChipText__bhBn9');
  doneButton = () => this.page.getByTestId('apply-filters-button');
  // #endregion

  // #region EN-iPhone-Safari and FR-iPhone-Safari specific locators that override abstract methods from base
  closeFilterButton = () => this.page.locator('button[data-role="filter-close-button"]');
  saveSearchButtonOnListPageLocator = () => this.page.locator('#save-search-promotion');
  displayValue = () => this.page.locator('div.SearchMaskListHeader_mobileSort__OQenb #page-size-dropdown-select');
  listPageHeaderTitle = () => this.page.locator('div[class*="SearchMaskListHeader_mobile"] h1[data-testid="list-header-title"]');
  // #endregion

  // #region Legacy Trader locators
  legacyFiltersButton = () => this.page.locator('#filterBtn');
  viewResultsButton = () => this.page.locator('#viewResultsBtn');
  // #endregion

  // #region Legacy Trader EN-iPhone-Safari and FR-iPhone-Safari specific locators that override abstract methods from base
  legacyMakeFilter = () => this.page.locator('#faceted-parent-Make')
  legacyModelFilter = () => this.page.locator('#faceted-parent-Model a.dropdown-toggle')
  // #endregion
}














