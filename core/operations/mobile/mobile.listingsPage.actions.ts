import { Page } from '@playwright/test';
import { BaseListingsPageActions } from '../common/shared.listingsPage.actions';
import { MobileListingsPageLocators } from '../../selectors/mobile/mobile.listingsPage.locators';

export class MobileListingsPageActions extends BaseListingsPageActions {
  protected listingsPageLocators: MobileListingsPageLocators;

  constructor(page: Page) {
    const locators = new MobileListingsPageLocators(page);
    super(locators, page);
    this.listingsPageLocators = locators;
  }

  // Add any mobile-specific methods here if needed
  // Most functionality will be inherited from the base class
}














