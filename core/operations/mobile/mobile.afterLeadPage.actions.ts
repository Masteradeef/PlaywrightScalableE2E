import { BaseAfterLeadPageActions } from '../common/shared.afterLeadPage.actions';
import { MobileAfterLeadPageLocators } from '../../selectors/mobile/mobile.afterLeadPage.locators';
import { Page } from '@playwright/test';

export class MobileAfterLeadPageActions extends BaseAfterLeadPageActions {
  constructor(page: Page) {
    const locators = new MobileAfterLeadPageLocators(page);
    super(locators, page);
  }

  // #region Mobile-specific implementations (if any in the future)
  // #endregion
}















