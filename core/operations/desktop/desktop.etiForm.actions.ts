import { Page } from '@playwright/test';
import { BaseETIFormActions } from '../common/shared.etiForm.actions';
import { DesktopETIFormLocators } from '../../selectors/desktop/desktop.etiForm.locators';

export class DesktopETIFormActions extends BaseETIFormActions {
  protected etiFormLocators: DesktopETIFormLocators;

  constructor(page: Page) {
    const locators = new DesktopETIFormLocators(page);
    super(locators, page);
    this.etiFormLocators = locators;
  }

  // Add any desktop-specific methods here if needed
  // Most functionality will be inherited from the base class
}














