import { Page } from '@playwright/test';
import { BaseListingsPageLocators } from '../common/shared.listingsPage.locators';

export class DesktopListingsPageLocators extends BaseListingsPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // Add any desktop-specific locators here if needed
  // Most locators will be inherited from the base class
}














