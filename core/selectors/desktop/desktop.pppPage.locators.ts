import { Page } from '@playwright/test';
import { BasePPPPageLocators } from '../common/shared.pppPage.locators';

export class DesktopPPPPageLocators extends BasePPPPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // Add any desktop-specific locators here if needed
  // Most locators will be inherited from the base class
}














