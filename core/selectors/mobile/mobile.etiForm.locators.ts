import { Page } from '@playwright/test';
import { BaseETIFormLocators } from '../common/shared.etiForm.locators';

export class MobileETIFormLocators extends BaseETIFormLocators {
  constructor(page: Page) {
    super(page);
  }

  // Add any mobile-specific locators here if needed
  // Most locators will be inherited from the base class
}














