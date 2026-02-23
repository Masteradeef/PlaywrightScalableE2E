import { BaseVehicleDetailPageLocators } from '../base/base.vehicleDetailPage.locators';
import { Locator, Page } from '@playwright/test';

export class DesktopVehicleDetailPageLocators extends BaseVehicleDetailPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  sendEmailButton = (): Locator => this.page.locator('#lead-form-lightbox-desktop-button');
  // #endregion

  // #region Desktop-only locators
  contactSellerButton = (): Locator => this.page.locator('button#sticky-header-desktop-button');
  galleryImage = (): Locator => this.page.locator('div.image-gallery img').first();
  galleryNameInput = (): Locator => this.page.locator('#gallery_senderName');
  galleryEmailInput = (): Locator => this.page.locator('#gallery_senderEmail');
  galleryPhoneInput = (): Locator => this.page.locator('#gallery_fullPhoneNumber');
  // #endregion
}
