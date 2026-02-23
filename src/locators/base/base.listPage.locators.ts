// base.locators.ts
import { Locator, Page } from '@playwright/test';

export abstract class BaseListPageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all list pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  listHeaderTitle = () => this.page.getByTestId('list-header-title');
  clearButton = () => this.page.getByTestId('clear-button');
  seeResultsButton = () => this.page.getByTestId('apply-counter-button');
  locationFilter = () => this.page.locator('button[data-testid="filter-list-item"][aria-controls="location-filter-item-details"]');
  cityPostalCodeInput = () => this.page.locator('#zipCode-input');  
  radiusInput = () => this.page.locator('#radius-input');  
  makeModelTrimFilter = () => this.page.locator('button[data-testid="filter-list-item"][aria-controls="make-model-filter-details"]');  
  makeInput = () => this.page.locator('input[id^="make-input-"][role="combobox"]')  
  modelInput = () => this.page.locator('input[id^="model-selector-"][role="combobox"]')  
  trimInput = () => this.page.locator('input[id^="trim-free-text-search-"][role="combobox"]')  
  trimSuggestionList = () => this.page.locator('div[id^="trim-free-text-search-"][role="listbox"]')  
  trimSuggestionListItemLabel = (index: number): Locator => this.trimSuggestionList().locator('label').nth(index)  
  trimSuggestionListItem = (index: number): Locator => this.trimSuggestionList().locator('input').nth(index)  
  trimDoneButton = () => this.page.locator('button.sr-button--ghost-accent.sr-autosuggest-multiselect__submit').filter({ hasText: /^(Done|Appliquer)$/ });
  priceFilter = () => this.page.locator('button[data-testid="filter-list-item"][aria-controls="price-evaluation-filter-details"]');    
  filterSpinner = () => this.page.locator('dialog[data-testid="filter-modal"] span.sr-spinner-wrapper');
  seeResultsBtnSpinner = () => this.page.locator('button[data-testid="apply-counter-button"] span.sr-spinner-wrapper');
  resultSpinner = () => this.page.locator('main[id="main-target"] span.scr-spinner-wrapper');
  suggestionItem = (index: number): Locator => this.page.locator('li.suggestion-item').nth(index);
  suggestionList = () => this.page.locator('li.suggestion-item')  
  priceFromInput = () => this.page.locator('#price-from')
  priceToInput = () => this.page.locator('#price-to')
  filterList = () => this.page.getByTestId('filter-list-item')
  filter = (index: number): Locator => this.filterList().nth(index)
  filterName = (index: number): Locator => this.filter(index).locator('span').nth(0)
  listingTitlesLocator = () => this.page.locator('main article h2');
  listingsLocator = () => this.page.locator('main article');
  saveSearchPopupModalLocator = () => this.page.locator('div[class*="AnonymousModal_modal"]');
  logInModalLocator = () => this.page.locator('#social-sign-in');
  saveSearchListingsTitle = () => this.page.locator('.sase-title');
  listPageSimilarListingsContainer = () => this.page.locator('div[class*="Recommendations_listingCardsContainer"]');
  listPageSimilarListingsTitle = () => this.page.locator('.scr-listing-cards-grid__title');
  similarListingsCard = () => this.page.locator('div.listing-impressions-tracking[data-position="1"]');
  similarListingsCardTitle = () => this.page.locator('div.listing-impressions-tracking[data-position="1"] strong.scr-listing-card__main');
  applyButtonSpinner = () => this.page.locator('button[data-testid="apply-counter-button"] span.sr-spinner-wrapper');
  spinnerWrapper = () => this.page.locator('span.sr-spinner-wrapper');
  vehicleConditionFilter = () => this.page.locator('xpath=//button[@data-testid="filter-list-item" and @aria-controls="vehicle-condition-filter-details"]');
  vehicleConditionFilterForm = () => this.page.locator('form.FilterModal_filterDetailsForm__2VsUd');
  // #endregion

  //#region EN-Desktop and FR-Desktop Specific Locators (must be overridden by desktop) 
  //#endregion 

  // #region EN-Mobile and FR-Mobile Specific Locators (must be overridden by mobile)
  locationFilterText = (): Locator => {
    throw new Error('locationFilterText is not available on this device type');
  };

  makeModelTrimFilterText = (): Locator => {
    throw new Error('makeModelTrimFilterText is not available on this device type');
  };

  filtersButton = (): Locator => {
    throw new Error('filtersButton is not available on this device type');
  };

  backIcon = (): Locator => {
    throw new Error(`backIcon is not available on this device type. Current project: ${process.env.PLAYWRIGHT_PROJECT || 'unknown'}`);
  };

  doneButton = (): Locator => {
    throw new Error(`doneButton is not available on this device type. Current project: ${process.env.PLAYWRIGHT_PROJECT || 'unknown'}`);
  };
  // #endregion  

  // #region abstract locators to be implemented by both desktop and mobile
  abstract closeFilterButton: () => Locator;
  abstract saveSearchButtonOnListPageLocator: () => Locator;
  // #endregion
}