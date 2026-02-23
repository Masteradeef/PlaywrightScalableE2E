// base.afterLeadPage.locators.ts
import { Locator, Page } from '@playwright/test';

export abstract class BaseAfterLeadPageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all after lead pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  successMessage = () => this.page.locator('h2.AfterleadPage_successMessageTitle__2srrA');
  successMessageBody = () => this.page.locator('p.AfterleadPage_successMessageBody__jMrl6');
  backToListingButton = () => this.page.locator('a[class*="AfterleadCTA_backToListing"]');
  // #endregion
}
