import { ActionResult } from '../../utils/types/project.types';
import { BaseVehicleDetailPageLocators } from '../../locators/base/base.vehicleDetailPage.locators';
import { expect, Page } from '@playwright/test';
import { BaseActions } from './BaseActions';

export enum FavouriteAction {
  Add = 'Add',
  Remove = 'Remove'
}

export abstract class BaseVehicleDetailPageActions extends BaseActions {
  protected vehicleDetailPageLocators: BaseVehicleDetailPageLocators;
  protected page: Page;

  constructor(vehicleDetailPageLocators: BaseVehicleDetailPageLocators, page: Page) {
    super();
    this.vehicleDetailPageLocators = vehicleDetailPageLocators;
    this.page = page;
  }

  // #region Functions for both Desktop and Mobile
  
  async clickSendEmailButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.sendEmailButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click send email button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillNameInput(name: string): Promise<ActionResult> {
    try {
      await this.clearNameInput();
      await this.vehicleDetailPageLocators.nameInput().fill(name);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill name input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearNameInput(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.nameInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear name input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillDealerInfoSectionNameInput(name: string): Promise<ActionResult> {
    try {
      await this.clearDealerInfoSectionNameInput();
      await this.vehicleDetailPageLocators.dealerInfoSectionNameInput().fill(name);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill dealer info section name input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearDealerInfoSectionNameInput(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.dealerInfoSectionNameInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear dealer info section name input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillEmailInput(email: string): Promise<ActionResult> {
    try {
      await this.clearEmailInput();
      await this.vehicleDetailPageLocators.emailInput().fill(email);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearEmailInput(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.emailInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillDealerInfoSectionEmailInput(email: string): Promise<ActionResult> {
    try {
      await this.clearDealerInfoSectionEmailInput();
      await this.vehicleDetailPageLocators.dealerInfoSectionEmailInput().fill(email);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill dealer info section email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearDealerInfoSectionEmailInput(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.dealerInfoSectionEmailInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear dealer info section email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillPhoneInput(phoneNumber: string): Promise<ActionResult> {
    try {
      await this.clearPhoneInput();
      await this.vehicleDetailPageLocators.phoneInput().fill(phoneNumber);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill phone input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearPhoneInput(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.phoneInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear phone input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillDealerInfoSectionPhoneInput(phoneNumber: string): Promise<ActionResult> {
    try {
      await this.clearDealerInfoSectionPhoneInput();
      await this.vehicleDetailPageLocators.dealerInfoSectionPhoneInput().fill(phoneNumber);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill dealer info section phone input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearDealerInfoSectionPhoneInput(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.dealerInfoSectionPhoneInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear dealer info section phone input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickSendButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.sendButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click send button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickAddedToListButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.addedToListButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click added to list button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickAddToListButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.addRemoveFavouriteButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click add to list button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async addOrRemoveFavourite(action: FavouriteAction): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.addRemoveFavouriteButton().waitFor({ state: 'visible' });
      const currentAriaLabel = await this.vehicleDetailPageLocators.addRemoveFavouriteButton().getAttribute('aria-label');
      
      if (action === FavouriteAction.Add) {
        if (currentAriaLabel === 'Add to list') {
          await this.vehicleDetailPageLocators.addRemoveFavouriteButton().click();
          await this.vehicleDetailPageLocators.addRemoveFavouriteButton().waitFor({ state: 'visible' });
          await this.page.waitForTimeout(500);
        } else {
          console.log('The listing is already in favourites');
        }
      } else if (action === FavouriteAction.Remove) {
        if (currentAriaLabel === 'Added to list') {
          await this.vehicleDetailPageLocators.addRemoveFavouriteButton().click();
          await this.vehicleDetailPageLocators.addRemoveFavouriteButton().waitFor({ state: 'visible' });
          await this.page.waitForTimeout(500);
        } else {
          console.log('The item is not in favourites');
        }
      } else {
        throw new Error(`Invalid FavouriteAction: ${action}. Use FavouriteAction.Add or FavouriteAction.Remove`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to add or remove favourite:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async getVehicleTitleText(): Promise<string | null> {
    try {
      await this.vehicleDetailPageLocators.vehicleTitle().waitFor({ state: 'visible', timeout: 5000 });
      return await this.vehicleDetailPageLocators.vehicleTitle().textContent();
    } catch (error) {
      console.log('Vehicle title element not found or not visible');
      return null;
    }
  }

  async getDealerNameText(): Promise<string | null> {
    try {
      await this.vehicleDetailPageLocators.dealerName().waitFor({ state: 'visible', timeout: 5000 });
      return await this.vehicleDetailPageLocators.dealerName().textContent();
    } catch (error) {
      console.log('Dealer name element not found or not visible');
      return null;
    }
  }

  async getcertifiedPreOwnedPillText(): Promise<string | null> {
    try {
      await this.vehicleDetailPageLocators.certifiedPreOwnedPill().waitFor({ state: 'visible', timeout: 5000 });
      console.log('Certified pre-owned element is visible');
      return await this.vehicleDetailPageLocators.certifiedPreOwnedPill().textContent();
    } catch (error) {
      console.log('Certified pre-owned element not found or not visible');
      return null;
    }
  }

  async clickLearnMoreButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.learnMoreButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click learn more button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickContactSellerButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.basicDataSection().scrollIntoViewIfNeeded();
      await this.vehicleDetailPageLocators.contactSellerButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click contact seller button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async submitGeneralInquiryLead(name: string, email: string, phone: string): Promise<ActionResult> {
    try {
      await this.clickSendEmailButton();
      await this.fillNameInput(name);
      await this.fillEmailInput(email);
      await this.fillPhoneInput(phone);
      await this.clickSendButton();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit general inquiry lead:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async submitDealerInfoSectionLead(name: string, email: string, phone: string): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.dealerTag().scrollIntoViewIfNeeded();
      await this.fillDealerInfoSectionNameInput(name);
      await this.fillDealerInfoSectionEmailInput(email);
      await this.fillDealerInfoSectionPhoneInput(phone);
      await this.clickSendButton();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit dealer info section lead:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickRequestCARFAXHistoryReportLink(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.requestCARFAXHistoryReportLink().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click request CARFAX history report link:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickEmailReportButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.emailReportButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click email report button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async getCARFAXSuccessMessageText(): Promise<string | null> {
    try {
      await this.vehicleDetailPageLocators.carfaxSuccessMessage().waitFor({ state: 'visible', timeout: 5000 });
      return await this.vehicleDetailPageLocators.carfaxSuccessMessage().textContent();
    } catch (error) {
      console.log('CARFAX success message element not found or not visible');
      return null;
    }
  }

  async isCloseButtonOnCARFAXHistoryReportVisible(): Promise<boolean> {
    try {
      await this.vehicleDetailPageLocators.closeButtonOnCARFAXHistoryReport().waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isBackToListingButtonOnCARFAXHistoryReportVisible(): Promise<boolean> {
    try {
      await this.vehicleDetailPageLocators.backToListingButtonOnCARFAXHistoryReport().waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async clickOnBackToListingButtonOnCARFAXHistoryReport(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.backToListingButtonOnCARFAXHistoryReport().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click back to listing button on CARFAX history report:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async getVehiclePriceText(): Promise<string | null> {
    try {
      await this.vehicleDetailPageLocators.vehiclePrice().waitFor({ state: 'visible', timeout: 5000 });
      return await this.vehicleDetailPageLocators.vehiclePrice().textContent();
    } catch (error) {
      console.log('Vehicle price element not found or not visible');
      return null;
    }
  }

  async isViewSimilarListingsSectionVisible(urls: string[]): Promise<boolean> {
    for (const url of urls) {
      try {
        await this.page.goto(url, { waitUntil: 'load', timeout: 30000 });
        await this.page.waitForTimeout(2000);
        await this.vehicleDetailPageLocators.reportListingButton().scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(2000);
        await this.vehicleDetailPageLocators.viewSimilarListingsSection().waitFor({ state: 'visible', timeout: 10000 });
        return true;
      } catch (error) {
        console.log(`Recommendations section not found on: ${url}`);
      }
    }
    return false;
  }

  async clickTextButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.textButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click text button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickSMSButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.smsButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click SMS button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async submitTextLead(name: string, phone: string): Promise<ActionResult> {
    try {
      await this.clickTextButton();
      await this.fillNameInput(name);
      await this.fillPhoneInput(phone);
      await this.clickSMSButton();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit text lead:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async isCallButtonClickable(): Promise<boolean> {
    try {
      await this.vehicleDetailPageLocators.callButton().waitFor({ state: 'visible', timeout: 5000 });
      return await this.vehicleDetailPageLocators.callButton().isEnabled() && await this.vehicleDetailPageLocators.callButton().isVisible();
    } catch (error) {
      console.log('Call button not found or not clickable');
      return false;
    }
  }

  async clickCallButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.callButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click call button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async getCallButtonPhoneNumber(): Promise<string | null> {
    try {
      await this.vehicleDetailPageLocators.callButton().waitFor({ state: 'visible', timeout: 5000 });
      const href = await this.vehicleDetailPageLocators.callButton().getAttribute('href');
      if (href && href.startsWith('tel:')) {
        return href.replace('tel:', '');
      }
      return null;
    } catch (error) {
      console.log('Call button not found or href missing');
      return null;
    }
  }
  
  // #endregion

  //#region Functions that are desktop-specific and may be overridden by child classes
  async submitContactSellerLead(name: string, email: string, phone: string): Promise<ActionResult> {
    throw new Error('submitContactSellerLead is not available on this device type');
  }

  async submitGalleryLead(name: string, email: string, phone: string): Promise<ActionResult> {
    throw new Error('submitGalleryLead is not available on this device type');
  }

  async clickGallery(): Promise<ActionResult> {
    throw new Error('clickGallery is not available on this device type');
  }

  async fillGalleryNameInput(name: string): Promise<ActionResult> {
    throw new Error('fillGalleryNameInput is not available on this device type');
  }

  async clearGalleryNameInput(): Promise<ActionResult> {
    throw new Error('clearGalleryNameInput is not available on this device type');
  }

  async fillGalleryEmailInput(email: string): Promise<ActionResult> {
    throw new Error('fillGalleryEmailInput is not available on this device type');
  }

  async clearGalleryEmailInput(): Promise<ActionResult> {
    throw new Error('clearGalleryEmailInput is not available on this device type');
  }

  async fillGalleryPhoneInput(phone: string): Promise<ActionResult> {
    throw new Error('fillGalleryPhoneInput is not available on this device type');
  }

  async clearGalleryPhoneInput(): Promise<ActionResult> {
    throw new Error('clearGalleryPhoneInput is not available on this device type');
  }
  //#endregion

  // #region Functions that are mobile-specific and may be overridden by child classes
  
  // #endregion
}
