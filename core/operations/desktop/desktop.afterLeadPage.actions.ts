import { BaseAfterLeadPageActions } from '../common/shared.afterLeadPage.actions';
import { DesktopAfterLeadPageLocators } from '../../selectors/desktop/desktop.afterLeadPage.locators';
import { Page } from '@playwright/test';

export class DesktopAfterLeadPageActions extends BaseAfterLeadPageActions {
  constructor(page: Page) {
    const locators = new DesktopAfterLeadPageLocators(page);
    super(locators, page);
  }

  // #region Desktop-specific implementations (if any in the future)
  // #endregion
}















