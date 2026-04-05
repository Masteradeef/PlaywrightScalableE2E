// shared.locators.ts
import { Locator, Page } from '@playwright/test';
import { VehicleConditionType } from '../../helpers/definitions/project.types';

export abstract class BaseListPageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all list pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  listHeaderTitle = () => this.page.getByTestId('list-header-title');
  clearButton = () => this.page.getByTestId('clear-button');
  seeResultsButton = () => this.page.getByTestId('apply-counter-button');
  locationFilter = () => this.page.locator('button[data-testid="location-filter-item"][aria-controls="location-filter-item-details"]');
  cityPostalCodeInput = () => this.page.locator('#zipCode-input');  
  radiusInput = () => this.page.locator('#radius-input');  
  makeModelTrimFilter = () => this.page.locator('button[data-testid="make-model-filter-item"][aria-controls="make-model-filter-details"]');    
  makeInput = () => this.page.locator('input[id^="make-input-"][role="combobox"]')  
  modelInput = () => this.page.locator('input[id^="model-selector-"][role="combobox"]')  
  trimInput = () => this.page.locator('input[id^="trim-free-text-search-"][role="combobox"]')  
  trimSuggestionList = () => this.page.locator('div[id^="trim-free-text-search-"][role="listbox"]') 
  trimSuggestionListItems = () => this.page.locator('div[id^="trim-free-text-search-"][role="listbox"]> div > div > label') 
  trimSuggestionListItemLabel = (index: number): Locator => this.trimSuggestionList().locator('label').nth(index)  
  trimSuggestionListItem = (index: number): Locator => this.trimSuggestionList().locator('input').nth(index)  
  trimDoneButton = () => this.page.locator('button.sr-button--ghost-accent.sr-autosuggest-multiselect__submit').filter({ hasText: /^(Done|Appliquer)$/ });
  priceFilter = () => this.page.locator('button[data-testid="price-filter-item"]');        
  filterSpinner = () => this.page.locator('dialog[data-testid="filter-modal"] span.sr-spinner-wrapper');
  seeResultsBtnSpinner = () => this.page.locator('button[data-testid="apply-counter-button"] span.sr-spinner-wrapper');
  resultSpinner = () => this.page.locator('main[id="main-target"] span.scr-spinner-wrapper');
  suggestionItem = (index: number): Locator => this.page.locator(`#radius-input-suggestion-${index}`);
  suggestionItemMake = (index: number): Locator => this.page.locator(`#make-input-primary-filter-suggestion-${index}`);
  suggestionItemModel = (index: number): Locator => this.page.locator(`#model-selector-primary-filter-suggestion-${index}`);
  suggestionList = () => this.page.locator('li.suggestion-item')  
  priceFromInput = () => this.page.locator('#price-from')
  priceToInput = () => this.page.locator('#price-to')
  filterList = () => this.page.getByTestId('filter-list-item')
  filter = (index: number): Locator => this.filterList().nth(index)
  filterName = (index: number): Locator => this.filter(index).locator('span').nth(0)
  listingTitlesLocator = () => this.page.locator('main article h2');
  listingsLocator = () => this.page.locator('main article');
  saveSearchPopupModalLocator = () => this.page.locator('div[class*="AnonymousModal_modal"]');
  saveSearchNotification = () => this.page.locator('.scr-notification-banner--confirmation');
  saveSearchMsg = () => this.page.locator('.scr-notification-banner--confirmation p');
  saveSearchDeleteBtn = () => this.page.locator('button.sase-action.sc-link-with-icon.sc-link-with-icon-component.action-button:not(.edit-link)');
  saveSearchDeleteNotification = () => this.page.locator('#sase-notification-deletion-success-title');
  logInModalLocator = () => this.page.locator('.social-sign-in');
  saveSearchListingsTitle = () => this.page.locator('.sase-title');
  listPageSimilarListingsContainer = () => this.page.locator('div[class*="Recommendations_listingCardsContainer"]');
  listPageSimilarListingsTitle = () => this.page.locator('.scr-listing-cards-grid__title');
  similarListingsCard = () => this.page.locator('div.listing-impressions-tracking[data-position="1"]');
  similarListingsCardTitle = () => this.page.locator('div.listing-impressions-tracking[data-position="1"] strong.scr-listing-card__main');
  applyButtonSpinner = () => this.page.locator('button[data-testid="apply-counter-button"] span.sr-spinner-wrapper');
  spinnerWrapper = () => this.page.locator('span.sr-spinner-wrapper');
  vehicleConditionFilter = () => this.page.getByTestId('vehicle-condition-filter-item')
  vehicleConditionFilterForm = () => this.page.locator('form[class*="FilterModal_filterDetailsForm"]');
  vehicleConditionFilterOption = (conditionType: VehicleConditionType) => this.page.getByRole('checkbox', { name: new RegExp(`${conditionType}`, 'i') });
  certifiedPreOwnedText = () => this.page.locator('button.scr-chip span:is([title="Certified pre-owned"], [title="Véhicules Certifiés"])');
  CpoPillText = () => this.page.locator('[data-testid="VehicleDetails-insurance_check"]');
  


  //#region Legacy Trader locators shared across both desktop and mobile
  legacyLocationFilter = () => this.page.locator('#faceted-Location');
  legacyLocationInput = () => this.page.locator('#locationAddress');
  legacyRadiusFilter = () => this.page.locator('#proximity');
  applyLocationButton = () => this.page.locator('#applyLocation');
  legacyMakeInput = (make: string): Locator => this.page.locator(`#rfMakes li[data-dropdownvalue="${make}"] a`);
  legacyModelInput = (model: string): Locator => this.page.locator(`#rfModel li[data-dropdownvalue="${model}"] a`);
  legacyTrimFilter = () => this.page.locator('#faceted-parent-Trim');
  legacyTrimInput = (trim: string): Locator => this.page.locator(`#faceted-parent-Trim input[type="checkbox"][data-value="${trim}"]`);
  inputLegacyMakeSearch = () => this.page.locator('#makeSearch');
  //#endregion
  // #endregion

  // #region abstract Legacy Trader locators to be implemented by both desktop and mobile
  abstract legacyMakeFilter: () => Locator;
  abstract legacyModelFilter: () => Locator;
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

  // #region Legacy Trader locators
    viewResultsButton = (): Locator => {
      throw new Error(`viewResultsButton is not available on this device type : ${process.env.PLAYWRIGHT_PROJECT || 'unknown'}`);
    }
    // #endregion
  // #endregion  

  // #region abstract locators to be implemented by both desktop and mobile
  abstract closeFilterButton: () => Locator;
  abstract saveSearchButtonOnListPageLocator: () => Locator;
  abstract displayValue: () => Locator;
  abstract listPageHeaderTitle: () => Locator;
  // #endregion
}














