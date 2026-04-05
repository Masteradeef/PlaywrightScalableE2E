import { Page } from '@playwright/test';
import { BaseListingsPageActions } from '../common/shared.listingsPage.actions';
import { DesktopListingsPageLocators } from '../../selectors/desktop/desktop.listingsPage.locators';

export class DesktopListingsPageActions extends BaseListingsPageActions {
  protected listingsPageLocators: DesktopListingsPageLocators;

  constructor(page: Page) {
    const locators = new DesktopListingsPageLocators(page);
    super(locators, page);
    this.listingsPageLocators = locators;
  }

  // Add any desktop-specific methods here if needed
  // Most functionality will be inherited from the base class
}














