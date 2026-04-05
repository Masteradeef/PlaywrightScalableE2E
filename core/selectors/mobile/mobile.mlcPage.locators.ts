import { Page } from '@playwright/test';
import { BaseMLCPageLocators } from '../common/shared.mlcPage.locators';

export class MobileMLCPageLocators extends BaseMLCPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // Add any mobile-specific locators here if needed
  // Most locators will be inherited from the base class
}














