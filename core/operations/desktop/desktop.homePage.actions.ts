import { Page } from '@playwright/test';
import { BaseHomePageActions } from '../common/shared.homePage.actions';
import { DesktopHomePageLocators } from '../../selectors/desktop/desktop.homePage.locators';

export class DesktopHomePageActions extends BaseHomePageActions {
  constructor(page: Page) {
    const homePageLocators = new DesktopHomePageLocators(page);
    super(homePageLocators, page);
  }

  // #region EN-Desktop and FR-Desktop specific actions that override abstract methods from base
  
  // #endregion
}















