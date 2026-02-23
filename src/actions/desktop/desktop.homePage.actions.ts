import { Page } from '@playwright/test';
import { BaseHomePageActions } from '../base/base.homePage.actions';
import { DesktopHomePageLocators } from '../../locators/desktop/desktop.homePage.locators';

export class DesktopHomePageActions extends BaseHomePageActions {
  constructor(page: Page) {
    const homePageLocators = new DesktopHomePageLocators(page);
    super(homePageLocators, page);
  }

  // #region EN-Desktop and FR-Desktop specific actions that override abstract methods from base
  
  // #endregion
}
