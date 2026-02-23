import { Page } from '@playwright/test';
import { BaseSharedActions } from '../base/base.shared.actions';
import { DesktopSharedLocators } from '../../locators/desktop/desktop.shared.locators';
import { ActionResult } from '../../utils/types/project.types';

export class DesktopSharedActions extends BaseSharedActions {
  constructor(page: Page) {
    const locators = new DesktopSharedLocators(page);
    super(locators, page);
  }

  // #region EN-Desktop and FR-Desktop specific actions that override abstract methods from base
  async clickLoginButton(): Promise<ActionResult> {
    try {
      await this.sharedLocators.loginButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click login button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async signIn(email: string, password: string): Promise<ActionResult> {
    try {
      await this.clickLoginButton();
      await this.sharedLocators.emailInput().fill(email);
      await this.sharedLocators.continueWithEmailButton().click();
      await this.sharedLocators.passwordInput().fill(password);
      await this.sharedLocators.signInButton().click();
      await this.sharedLocators.myAccountLink().waitFor({ state: 'attached', timeout: 30000 });
      return { success: true };
    } catch (error) {
      console.error('Failed to sign in:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async isLoggedInTextVisible(timeout: number = 5000): Promise<boolean> {
    try {
      return await this.sharedLocators.loggedInText().isVisible({ timeout });
    } catch (error) {
      return false;
    }
  }

  async getLoggedInText(timeout: number = 5000): Promise<string | null> {
    try {
      if (await this.sharedLocators.loggedInText().isVisible({ timeout })) {
        return await this.sharedLocators.loggedInText().textContent();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async clickMyAccountDropdown(): Promise<ActionResult> {
    try {
      await this.sharedLocators.myAccountDropdown().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click my account dropdown:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async isMyAccountDropdownVisible(timeout: number = 5000): Promise<boolean> {
    try {
      return await this.sharedLocators.myAccountDropdown().isVisible({ timeout });
    } catch (error) {
      return false;
    }
  }
  // #endregion
}