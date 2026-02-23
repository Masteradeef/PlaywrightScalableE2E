import { ActionResult } from '../../utils/types/project.types';
import { BaseHomePageLocators } from '../../locators/base/base.homePage.locators';
import { expect, Page } from '@playwright/test';
import { BaseActions } from './BaseActions';

export abstract class BaseHomePageActions extends BaseActions {
  protected homePageLocators: BaseHomePageLocators;
  protected page: Page;

  constructor(homePageLocators: BaseHomePageLocators, page: Page) {
    super();
    this.homePageLocators = homePageLocators;
    this.page = page;
  }

  // #region Functions for both Desktop and Mobile
  
  async selectMakeFromDropdown(makeText: string): Promise<ActionResult> {
    try {
      await this.homePageLocators.makeDropdown().waitFor({ state: 'visible', timeout: 10000 });
      await this.homePageLocators.makeDropdown().selectOption({ label: makeText });
      return { success: true };
    } catch (error) {
      console.error(`Failed to select make with text ${makeText}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickModelDropdown(): Promise<ActionResult> {
    try {
      await this.homePageLocators.modelCombobox().waitFor({ state: 'visible', timeout: 10000 });
      await this.homePageLocators.modelCombobox().click();
      console.log('Clicked model dropdown');
      return { success: true };
    } catch (error) {
      console.error('Failed to click model dropdown:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async selectModelFromDropdown(modelText: string): Promise<ActionResult> {
    try {
      await this.typeInModelDropdown(modelText);
      await this.page.waitForTimeout(500);
      await this.homePageLocators.modelCombobox().press('Enter');
      return { success: true };
    } catch (error) {
      console.error(`Failed to select model ${modelText}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async typeInModelDropdown(modelText: string): Promise<ActionResult> {
    try {
      // Wait for model dropdown to be visible AND enabled
      await this.homePageLocators.modelCombobox().waitFor({ state: 'visible', timeout: 10000 });
      
      // Check if element is enabled, wait up to 5 seconds for it to become enabled
      const maxWaitTime = 5000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWaitTime) {
        const isDisabled = await this.homePageLocators.modelCombobox().getAttribute('disabled');
        if (isDisabled === null) {
          // Element is enabled, proceed with interaction
          break;
        }
        console.log('Model dropdown is disabled, waiting for it to become enabled...');
        await this.page.waitForTimeout(500);
      }
      
      // Final check if still disabled
      const isStillDisabled = await this.homePageLocators.modelCombobox().getAttribute('disabled');
      if (isStillDisabled !== null) {
        throw new Error('Model dropdown remained disabled - make selection might be required first');
      }
      
      await this.homePageLocators.modelCombobox().clear();
      await this.homePageLocators.modelCombobox().fill(modelText);
      return { success: true };
    } catch (error) {
      console.error(`Failed to type in model dropdown ${modelText}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async enterPostalCode(postalCode: string): Promise<ActionResult> {
    try {
      await this.homePageLocators.postalCodeInput().waitFor({ state: 'visible', timeout: 5000 });
      await this.homePageLocators.postalCodeInput().clear();
      await this.homePageLocators.postalCodeInput().fill(postalCode);
      await this.page.waitForTimeout(3000);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Postal code input not available or failed: ${errorMessage}`);
      return { success: false, message: errorMessage };
    }
  }

  async waitUntilLoadingSpinnerDisappear(): Promise<ActionResult> {
    try {
      await this.homePageLocators.loadingSpinner().waitFor({ state: 'visible', timeout: 2000 });
      await this.homePageLocators.loadingSpinner().waitFor({ state: 'hidden', timeout: 10000 });
      console.log('Loading spinner disappeared');
      return { success: true };
    } catch (spinnerError) {
      console.log('Loading spinner not found or already hidden');
      return { success: true }; // Consider this as success since spinner might not appear
    }
  }

  async clickResultFoundButton(): Promise<ActionResult> {
    try {
      await this.homePageLocators.resultFoundButton().waitFor({ state: 'visible', timeout: 2000 });
      await this.waitUntilLoadingSpinnerDisappear();
      await this.homePageLocators.resultFoundButton().click();
      console.log('Clicked Result Found button');
      return { success: true };
    } catch (error) {
      console.error('Failed to click Result Found button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async selectModel(model: string): Promise<ActionResult> {
    try {
      await this.typeInModelDropdown(model);
      const itemCount = await this.homePageLocators.modelList().count();
      for (let i = 0; i < itemCount; i++) {
        const listItem = this.homePageLocators.modelListItem(i);
        if (await listItem.textContent().then(text => text?.trim()) === model) {
          await listItem.click({ force: true });
          break;
        }
        await this.homePageLocators.modelCombobox().press('ArrowDown');
      }
      return { success: true };
    } catch (error) {
      console.error(`Failed to select model ${model}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }
  
  // #endregion

  //#region EN-Desktop and FR-Desktop Specific Actions (must be overridden by desktop)  
  //#endregion 

  // #region EN-Mobile and FR-Mobile Specific Actions (must be overridden by mobile)
  
  // #endregion
}
