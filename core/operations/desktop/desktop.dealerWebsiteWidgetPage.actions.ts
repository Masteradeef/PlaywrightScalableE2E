import { Page } from '@playwright/test';
import { BaseDealerWebsiteWidgetPageActions } from '../common/shared.dealerWidgetPage.actions';
import { DesktopDealerWebsiteWidgetPageLocators } from '../../selectors/desktop/desktop.dealerWebsiteWidgetPage.locators';

export class DesktopDealerWebsiteWidgetPageActions extends BaseDealerWebsiteWidgetPageActions {
  protected dealerWebsiteWidgetPageLocators: DesktopDealerWebsiteWidgetPageLocators;

  constructor(page: Page) {
    const locators = new DesktopDealerWebsiteWidgetPageLocators(page);
    super(locators, page);
    this.dealerWebsiteWidgetPageLocators = locators;
  }

  // Add any desktop-specific methods here if needed
  // Most functionality will be inherited from the base class
}














