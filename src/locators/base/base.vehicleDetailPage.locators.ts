// base.vehicleDetailPage.locators.ts
import { Locator, Page } from '@playwright/test';

export abstract class BaseVehicleDetailPageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all vehicle detail pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  nameInput = () => this.page.locator('#lightbox_senderName');
  emailInput = () => this.page.locator('#lightbox_senderEmail');
  phoneInput = () => this.page.locator('#lightbox_fullPhoneNumber');
  sendButton = () => this.page.locator('#sendEmailButton');
  dealerInfoSectionNameInput = () => this.page.locator('#onpage_senderName');
  dealerInfoSectionEmailInput = () => this.page.locator('#onpage_senderEmail');
  dealerInfoSectionPhoneInput = () => this.page.locator('#onpage_fullPhoneNumber');
  addedToListButton = () => this.page.locator('button[aria-label="Added to list"]');
  addRemoveFavouriteButton = () => this.page.locator('button[data-cs-override-id="add_to_favourite_cta_stage-area"]');
  vehicleTitle = () => this.page.locator('h1.StageTitle_title__ROiR4 .StageTitle_boldClassifiedInfo__sQb0l');
  dealerName = () => this.page.locator('div.CommonComponents_nameContainer__TtFCL[data-cs-mask="true"]');
  basicDataSection = () => this.page.locator('#basic-details-section h2[class*="DetailsSectionTitle_text"]');
  dealerTag = () => this.page.locator('div[class*="VendorData_title"] span[class*="scr-tag"]');
  requestCARFAXHistoryReportLink = () => this.page.locator('a.scr-link.undefined');
  emailReportButton = () => this.page.locator('#sendCarFaxLeadButton');
  carfaxSuccessMessage = () => this.page.locator('div.CarFaxLeadForm_successMessage__dP1G8');
  closeButtonOnCARFAXHistoryReport = () => this.page.locator('button[aria-label="close button"]');
  backToListingButtonOnCARFAXHistoryReport = () => this.page.locator('#backToListingButton');
  vehiclePrice = () => this.page.locator('span.PriceInfo_price__XU0aF');
  viewSimilarListingsSection = () => this.page.locator('section[data-cy="recommendations-section"]');
  reportListingButton = () => this.page.locator('button[class*="OMPFraudReportLink_reportFraudButton"]');
  certifiedPreOwnedPill = () => this.page.locator('span.StagePill_stagePill__Txt9S', { hasText: /^(Certified pre-owned?|Véhicule Certifié)$/i });
  learnMoreButton = () => this.page.locator('a.sr-button--secondary', { hasText: /^(Learn more?|En savoir plus)$/i });
  // #endregion

  // #region EN-Desktop and FR-Desktop Specific Locators (must be overridden by desktop)  
  contactSellerButton = (): Locator => {
    throw new Error('contactSellerButton is not available on this device type');
  };

  galleryImage = (): Locator => {
    throw new Error('galleryImage is not available on this device type');
  };

  galleryNameInput = (): Locator => {
    throw new Error('galleryNameInput is not available on this device type');
  };

  galleryEmailInput = (): Locator => {
    throw new Error('galleryEmailInput is not available on this device type');
  };

  galleryPhoneInput = (): Locator => {
    throw new Error('galleryPhoneInput is not available on this device type');
  };
  // #endregion 

  // #region EN-Mobile and FR-Mobile Specific Locators (must be overridden by mobile)
  textButton = (): Locator => {
    throw new Error('textButton is not available on this device type');
  };

  smsButton = (): Locator => {
    throw new Error('smsButton is not available on this device type');
  };

  callButton = (): Locator => {
    throw new Error('callButton is not available on this device type');
  };
  // #endregion

  // #abstract locators to be implemented by both desktop and mobile
  abstract sendEmailButton(): Locator;
  // #endregion
}
