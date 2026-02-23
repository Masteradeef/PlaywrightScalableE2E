import { BaseVehicleDetailPageLocators } from '../base/base.vehicleDetailPage.locators';
import { Locator, Page } from '@playwright/test';

export class MobileVehicleDetailPageLocators extends BaseVehicleDetailPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Mobile and FR-Mobile specific locators that override abstract methods from base
  sendEmailButton = (): Locator => this.page.locator('#lead-form-mobile-button');
  // #endregion

  // #region Mobile-only locators (not in desktop)
  textButton = (): Locator => this.page.locator('#sms-lead-form-mobile-button');
  smsButton = (): Locator => this.page.locator('#sendSMSButton');
  callButton = (): Locator => this.page.locator('#call-sticky-mobile-button');
  // #endregion
}
