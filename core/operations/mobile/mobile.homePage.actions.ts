import { Page } from '@playwright/test';
import { BaseHomePageActions } from '../common/shared.homePage.actions';
import { MobileHomePageLocators } from '../../selectors/mobile/mobile.homePage.locators';

export class MobileHomePageActions extends BaseHomePageActions {
  constructor(page: Page) {
    const homePageLocators = new MobileHomePageLocators(page);
    super(homePageLocators, page);
  }

  // #region EN-Mobile and FR-Mobile specific actions that override abstract methods from base
  
  // #endregion
}















