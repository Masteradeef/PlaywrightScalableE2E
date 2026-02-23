import { BaseFavouritesPageActions } from '../base/base.favouritesPage.actions';
import { MobileFavouritesPageLocators } from '../../locators/mobile/mobile.favouritesPage.locators';
import { Page } from '@playwright/test';

export class MobileFavouritesPageActions extends BaseFavouritesPageActions {
  constructor(page: Page) {
    const locators = new MobileFavouritesPageLocators(page);
    super(locators, page);
  }

  // #region Mobile-specific implementations
  async getFavoriteItemDealerInfoText(index?: number): Promise<string | null> {
    try {
      const targetElement = index !== undefined 
        ? this.favouritesPageLocators.favoriteItemDealerInfo().nth(index) 
        : this.favouritesPageLocators.favoriteItemDealerInfo().first();
      await targetElement.waitFor({ state: 'visible', timeout: 5000 });
      
      // For mobile projects, use a different approach to get only the dealer name
      const innerHTML = await targetElement.innerHTML();
      // Split by <br> tag and take the first part, then strip any HTML tags
      const dealerName = innerHTML.split('<br>')[0].replace(/<[^>]*>/g, '').trim();
      return dealerName;
    } catch (error) {
      console.log(`Favorite item dealer info element ${index !== undefined ? `at index ${index}` : ''} not found or not visible`);
      return null;
    }
  }
  // #endregion
}
