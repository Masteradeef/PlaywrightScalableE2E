import { Page } from '@playwright/test';
import { BaseDealerWebsiteWidgetPageActions } from '../common/shared.dealerWidgetPage.actions';
import { MobileDealerWebsiteWidgetPageLocators } from '../../selectors/mobile/mobile.dealerWebsiteWidgetPage.locators';

export class MobileDealerWebsiteWidgetPageActions extends BaseDealerWebsiteWidgetPageActions {
  protected dealerWebsiteWidgetPageLocators: MobileDealerWebsiteWidgetPageLocators;

  constructor(page: Page) {
    const locators = new MobileDealerWebsiteWidgetPageLocators(page);
    super(locators, page);
    this.dealerWebsiteWidgetPageLocators = locators;
  }

  // Add any mobile-specific methods here if needed
  // Most functionality will be inherited from the base class
}














