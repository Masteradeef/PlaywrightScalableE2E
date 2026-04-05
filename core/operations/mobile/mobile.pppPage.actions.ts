import { Page } from '@playwright/test';
import { BasePPPPageActions } from '../common/shared.pppPage.actions';
import { MobilePPPPageLocators } from '../../selectors/mobile/mobile.pppPage.locators';

export class MobilePPPPageActions extends BasePPPPageActions {
  protected pppPageLocators: MobilePPPPageLocators;

  constructor(page: Page) {
    const locators = new MobilePPPPageLocators(page);
    super(locators, page);
    this.pppPageLocators = locators;
  }

  // Add any mobile-specific methods here if needed
  // Most functionality will be inherited from the base class
}














