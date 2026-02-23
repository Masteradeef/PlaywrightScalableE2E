import { Page } from '@playwright/test';
import { BaseSharedActions } from '../base/base.shared.actions';
import { MobileSharedLocators } from '../../locators/mobile/mobile.shared.locators';
import { ActionResult } from '../../utils/types/project.types';

export class MobileSharedActions extends BaseSharedActions {
  constructor(page: Page) {
    const locators = new MobileSharedLocators(page);
    super(locators, page);
  }

  // #region EN-Mobile and FR-Mobile specific actions that override abstract methods from base
  async clickLoginButton(): Promise<ActionResult> {
    try {
      await this.clickHamburgerMenu();
      await this.clickLogInSignUpButton();
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

  async clickHamburgerMenu(): Promise<ActionResult> {
    try {
      await this.sharedLocators.hamburgerMenu().click();
      await this.page.waitForTimeout(1000);
      return { success: true };
    } catch (error) {
      console.error('Failed to click hamburger menu:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickLogInSignUpButton(): Promise<ActionResult> {
    try {
      await this.sharedLocators.logInSignUpButton().waitFor({ state: 'attached', timeout: 10000 });
      console.log('Login button found in DOM');
      await this.sharedLocators.logInSignUpButton().click({ force: true });
      console.log('Login button clicked with force');
      return { success: true };
    } catch (error) {
      console.log('Failed to find/click login button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickCloseMenuIcon(): Promise<ActionResult> {
    try {
      await this.sharedLocators.closeMenuIcon().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click close menu icon:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickMyAccountDropdown(): Promise<ActionResult> {
    try {
      await this.clickHamburgerMenu();
      await this.sharedLocators.myAccountDropdown().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click my account dropdown:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async isMyAccountDropdownVisible(timeout: number = 5000): Promise<boolean> {
    try {
      await this.clickHamburgerMenu();
      return await this.sharedLocators.myAccountDropdown().isVisible({ timeout });
    } catch (error) {
      return false;
    }
  }

  async clickFavouritesMenu(): Promise<ActionResult> {
    try {
      await this.clickHamburgerMenu();
      await this.clickMyAccountDropdown();
      await this.sharedLocators.favouritesLink().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click favourites menu:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }
  // #endregion
}