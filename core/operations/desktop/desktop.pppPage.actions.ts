import { Page } from '@playwright/test';
import { BasePPPPageActions } from '../common/shared.pppPage.actions';
import { DesktopPPPPageLocators } from '../../selectors/desktop/desktop.pppPage.locators';

export class DesktopPPPPageActions extends BasePPPPageActions {
  protected pppPageLocators: DesktopPPPPageLocators;

  constructor(page: Page) {
    const locators = new DesktopPPPPageLocators(page);
    super(locators, page);
    this.pppPageLocators = locators;
  }

  // Add any desktop-specific methods here if needed
  // Most functionality will be inherited from the base class
}














