import { BaseVehicleDetailPageActions } from '../base/base.vehicleDetailPage.actions';
import { DesktopVehicleDetailPageLocators } from '../../locators/desktop/desktop.vehicleDetailPage.locators';
import { Page } from '@playwright/test';
import { ActionResult } from '../../utils/types/project.types';

export class DesktopVehicleDetailPageActions extends BaseVehicleDetailPageActions {
  constructor(page: Page) {
    const locators = new DesktopVehicleDetailPageLocators(page);
    super(locators, page);
  }

  // #region Desktop-specific implementations
  async submitContactSellerLead(name: string, email: string, phone: string): Promise<ActionResult> {
    try {
      await this.clickContactSellerButton();
      await this.fillNameInput(name);
      await this.fillEmailInput(email);
      await this.fillPhoneInput(phone);
      await this.clickSendButton();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit contact seller lead:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async submitGalleryLead(name: string, email: string, phone: string): Promise<ActionResult> {
    try {
      await this.clickGallery();
      await this.fillGalleryNameInput(name);
      await this.fillGalleryEmailInput(email);
      await this.fillGalleryPhoneInput(phone);
      await this.clickSendButton();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit gallery lead:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickGallery(): Promise<ActionResult> {
    try {
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryImage().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click gallery:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillGalleryNameInput(name: string): Promise<ActionResult> {
    try {
      await this.clearGalleryNameInput();
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryNameInput().fill(name);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill gallery name input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearGalleryNameInput(): Promise<ActionResult> {
    try {
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryNameInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear gallery name input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillGalleryEmailInput(email: string): Promise<ActionResult> {
    try {
      await this.clearGalleryEmailInput();
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryEmailInput().fill(email);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill gallery email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearGalleryEmailInput(): Promise<ActionResult> {
    try {
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryEmailInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear gallery email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillGalleryPhoneInput(phone: string): Promise<ActionResult> {
    try {
      await this.clearGalleryPhoneInput();
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryPhoneInput().fill(phone);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill gallery phone input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearGalleryPhoneInput(): Promise<ActionResult> {
    try {
      const desktopLocators = this.vehicleDetailPageLocators as DesktopVehicleDetailPageLocators;
      await desktopLocators.galleryPhoneInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear gallery phone input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }
  // #endregion
}
