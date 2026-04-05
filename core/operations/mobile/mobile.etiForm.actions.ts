import { Page } from '@playwright/test';
import { BaseETIFormActions } from '../common/shared.etiForm.actions';
import { MobileETIFormLocators } from '../../selectors/mobile/mobile.etiForm.locators';

export class MobileETIFormActions extends BaseETIFormActions {
  protected etiFormLocators: MobileETIFormLocators;

  constructor(page: Page) {
    const locators = new MobileETIFormLocators(page);
    super(locators, page);
    this.etiFormLocators = locators;
  }

  // Add any mobile-specific methods here if needed
  // Most functionality will be inherited from the base class
}














