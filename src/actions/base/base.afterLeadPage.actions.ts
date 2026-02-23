import { ActionResult } from '../../utils/types/project.types';
import { BaseAfterLeadPageLocators } from '../../locators/base/base.afterLeadPage.locators';
import { Page } from '@playwright/test';
import { BaseActions } from './BaseActions';

export abstract class BaseAfterLeadPageActions extends BaseActions {
  protected afterLeadPageLocators: BaseAfterLeadPageLocators;
  protected page: Page;

  constructor(afterLeadPageLocators: BaseAfterLeadPageLocators, page: Page) {
    super();
    this.afterLeadPageLocators = afterLeadPageLocators;
    this.page = page;
  }

  // #region Functions for both Desktop and Mobile
  
  async getSuccessMessageText(): Promise<string | null> {
    try {
      await this.page.waitForURL('**/afterlead**', { timeout: 120000 });
      console.log('Navigated to afterlead page:', this.page.url());
      
      if (await this.afterLeadPageLocators.successMessage().isVisible()) {
        const text = await this.afterLeadPageLocators.successMessage().textContent();
        return text?.trim() || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get success message text:', error);
      return null;
    }
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      return await this.afterLeadPageLocators.successMessage().isVisible();
    } catch (error) {
      console.error('Failed to check if success message is visible:', error);
      return false;
    }
  }

  async getSuccessMessageBodyText(): Promise<string | null> {
    try {
      if (await this.afterLeadPageLocators.successMessageBody().isVisible()) {
        return await this.afterLeadPageLocators.successMessageBody().textContent();
      }
      return null;
    } catch (error) {
      console.error('Failed to get success message body text:', error);
      return null;
    }
  }

  async isSuccessMessageBodyVisible(): Promise<boolean> {
    try {
      return await this.afterLeadPageLocators.successMessageBody().isVisible();
    } catch (error) {
      console.error('Failed to check if success message body is visible:', error);
      return false;
    }
  }

  async clickBackToListingButton(): Promise<ActionResult> {
    try {
      await this.afterLeadPageLocators.backToListingButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click back to listing button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  // #endregion
}
