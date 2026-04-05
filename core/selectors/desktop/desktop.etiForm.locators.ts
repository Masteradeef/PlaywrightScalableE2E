import { Page } from '@playwright/test';
import { BaseETIFormLocators } from '../common/shared.etiForm.locators';

export class DesktopETIFormLocators extends BaseETIFormLocators {
  constructor(page: Page) {
    super(page);
  }

  // Add any desktop-specific locators here if needed
  // Most locators will be inherited from the base class
}














