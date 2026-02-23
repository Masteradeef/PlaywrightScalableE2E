import { BaseFavouritesPageActions } from '../base/base.favouritesPage.actions';
import { DesktopFavouritesPageLocators } from '../../locators/desktop/desktop.favouritesPage.locators';
import { Page } from '@playwright/test';

export class DesktopFavouritesPageActions extends BaseFavouritesPageActions {
  constructor(page: Page) {
    const locators = new DesktopFavouritesPageLocators(page);
    super(locators, page);
  }

  // #region Desktop-specific implementations
  async getFavoriteItemDealerInfoText(index?: number): Promise<string | null> {
    try {
      const targetElement = index !== undefined 
        ? this.favouritesPageLocators.favoriteItemDealerInfo().nth(index) 
        : this.favouritesPageLocators.favoriteItemDealerInfo().first();
      await targetElement.waitFor({ state: 'visible', timeout: 5000 });
      return await targetElement.textContent();
    } catch (error) {
      console.log(`Favorite item dealer info element ${index !== undefined ? `at index ${index}` : ''} not found or not visible`);
      return null;
    }
  }
  // #endregion
}
