import { ActionResult } from '../../utils/types/project.types';
import { BaseFavouritesPageLocators } from '../../locators/base/base.favouritesPage.locators';
import { Page } from '@playwright/test';
import { BaseActions } from './BaseActions';

export abstract class BaseFavouritesPageActions extends BaseActions {
  protected favouritesPageLocators: BaseFavouritesPageLocators;
  protected page: Page;

  constructor(favouritesPageLocators: BaseFavouritesPageLocators, page: Page) {
    super();
    this.favouritesPageLocators = favouritesPageLocators;
    this.page = page;
  }

  // #region Functions for both Desktop and Mobile
  
  async removeAllFromFavourites(): Promise<ActionResult> {
    try {
      const buttonsCount = await this.favouritesPageLocators.removeFromFavouritesButtons().count();
      for (let i = buttonsCount - 1; i >= 0; i--) {
        const button = this.favouritesPageLocators.removeFromFavouritesButtons().nth(i);
        if (await button.isVisible()) {
          await button.click();
          await this.page.waitForTimeout(500);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to remove all from favourites:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async removeFromFavouritesByIndex(index: number): Promise<ActionResult> {
    try {
      const button = this.favouritesPageLocators.removeFromFavouritesButtons().nth(index);
      if (await button.isVisible()) {
        await button.click();
      }
      return { success: true };
    } catch (error) {
      console.error(`Failed to remove from favourites at index ${index}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async getFavouritesCount(): Promise<number> {
    try {
      return await this.favouritesPageLocators.removeFromFavouritesButtons().count();
    } catch (error) {
      console.error('Failed to get favourites count:', error);
      return 0;
    }
  }

  async isRemoveButtonVisible(index?: number): Promise<boolean> {
    try {
      if (index !== undefined) {
        return await this.favouritesPageLocators.removeFromFavouritesButtons().nth(index).isVisible();
      }
      const count = await this.favouritesPageLocators.removeFromFavouritesButtons().count();
      return count > 0;
    } catch (error) {
      console.error('Failed to check if remove button is visible:', error);
      return false;
    }
  }

  async getEmptyFavouritesText(): Promise<string | null> {
    try {
      if (await this.favouritesPageLocators.emptyFavouritesMessage().isVisible()) {
        return await this.favouritesPageLocators.emptyFavouritesMessage().textContent();
      }
      return null;
    } catch (error) {
      console.error('Failed to get empty favourites text:', error);
      return null;
    }
  }

  async isEmptyFavouritesMessageVisible(): Promise<boolean> {
    try {
      return await this.favouritesPageLocators.emptyFavouritesMessage().isVisible();
    } catch (error) {
      console.error('Failed to check if empty favourites message is visible:', error);
      return false;
    }
  }

  async getFavoriteItemMakeModelText(index?: number): Promise<string | null> {
    try {
      const targetElement = index !== undefined 
        ? this.favouritesPageLocators.favoriteItemMakeModel().nth(index) 
        : this.favouritesPageLocators.favoriteItemMakeModel().first();
      await targetElement.waitFor({ state: 'visible', timeout: 5000 });
      return await targetElement.textContent();
    } catch (error) {
      console.log(`Favorite item make/model element ${index !== undefined ? `at index ${index}` : ''} not found or not visible`);
      return null;
    }
  }

  async isListingDisplayedInFavourite(titleText: string, dealerText: string, index?: number): Promise<boolean> {
    index = index !== undefined ? index : 0;
    try {
      const actualTitle = await this.getFavoriteItemMakeModelText(index).then(text => text?.trim() || null);
      const actualDealer = await this.getFavoriteItemDealerInfoText(index).then(text => text?.trim() || null);
      const titleMatches = titleText?.includes(actualTitle!) || false;
      const dealerMatches = dealerText?.includes(actualDealer!) || false;
      return titleMatches && dealerMatches;
    } catch (error) {
      console.log('Error checking if listing is displayed in favourites:', error);
      return false;
    }
  }

  async cleanUpFavourites(expectedEmptyText: string): Promise<ActionResult> {
    try {
      let emptyFavouritesText = await this.getEmptyFavouritesText();
      let attempts = 0;
      const maxAttempts = 5;
      
      while (emptyFavouritesText !== expectedEmptyText && attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1}: Favourites text is "${emptyFavouritesText}", expected "${expectedEmptyText}". Cleaning up...`);
        await this.removeAllFromFavourites();
        emptyFavouritesText = await this.getEmptyFavouritesText();
        await this.page.waitForTimeout(2000);
        attempts++;
      }
      
      if (emptyFavouritesText === expectedEmptyText) {
        console.log('Favourites successfully cleaned up. Empty text matches expected:', emptyFavouritesText);
        return { success: true };
      } else {
        console.log(`Failed to clean favourites after ${maxAttempts} attempts. Current text: "${emptyFavouritesText}"`);
        return { success: false, message: `Failed to clean favourites. Current text: "${emptyFavouritesText}"` };
      }
    } catch (error) {
      console.error('Failed to clean up favourites:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  // #endregion

  //#region Abstract functions to be implemented by child classes (Desktop and Mobile)  
  abstract getFavoriteItemDealerInfoText(index?: number): Promise<string | null>;
  //#endregion
}
