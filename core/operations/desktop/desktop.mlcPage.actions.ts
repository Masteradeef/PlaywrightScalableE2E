import { Page } from '@playwright/test';
import { BaseMLCPageActions } from '../common/shared.mlcPage.actions';
import { DesktopMLCPageLocators } from '../../selectors/desktop/desktop.mlcPage.locators';

export class DesktopMLCPageActions extends BaseMLCPageActions {
  protected mlcPageLocators: DesktopMLCPageLocators;

  constructor(page: Page) {
    const locators = new DesktopMLCPageLocators(page);
    super(locators, page);
    this.mlcPageLocators = locators;
  }

  // Add any desktop-specific methods here if needed
  // Most functionality will be inherited from the base class
}














