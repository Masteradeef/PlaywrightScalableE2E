// base.homePage.locators.ts
import { Locator, Page } from '@playwright/test';

export abstract class BaseHomePageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all home pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  makeDropdown = () => this.page.locator('#make');
  modelCombobox = () => this.page.locator('#select-model-container input[role="combobox"]');
  postalCodeInput = () => this.page.locator('input#location');
  resultFoundButton = () => this.page.locator('#search-mask-search-cta');
  loadingSpinner = () => this.resultFoundButton().locator('span.hf-searchmask-form__results-button__loading-spinner');
  modelListItem = (index: number): Locator => this.page.locator(`li.suggestion-item:nth-child(${index + 1}) .sr-visually-hidden`);
  modelList = () => this.page.locator('li.suggestion-item');
  // #endregion

  //#region EN-Desktop and FR-Desktop Specific Locators (must be overridden by desktop)  
  //#endregion 

  // #region EN-Mobile and FR-Mobile Specific Locators (must be overridden by mobile)
  // #endregion
}
