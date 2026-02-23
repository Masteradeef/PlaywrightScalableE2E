import { BaseAfterLeadPageActions } from '../base/base.afterLeadPage.actions';
import { DesktopAfterLeadPageLocators } from '../../locators/desktop/desktop.afterLeadPage.locators';
import { Page } from '@playwright/test';

export class DesktopAfterLeadPageActions extends BaseAfterLeadPageActions {
  constructor(page: Page) {
    const locators = new DesktopAfterLeadPageLocators(page);
    super(locators, page);
  }

  // #region Desktop-specific implementations (if any in the future)
  // #endregion
}
