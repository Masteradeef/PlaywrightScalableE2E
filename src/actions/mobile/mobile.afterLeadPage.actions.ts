import { BaseAfterLeadPageActions } from '../base/base.afterLeadPage.actions';
import { MobileAfterLeadPageLocators } from '../../locators/mobile/mobile.afterLeadPage.locators';
import { Page } from '@playwright/test';

export class MobileAfterLeadPageActions extends BaseAfterLeadPageActions {
  constructor(page: Page) {
    const locators = new MobileAfterLeadPageLocators(page);
    super(locators, page);
  }

  // #region Mobile-specific implementations (if any in the future)
  // #endregion
}
