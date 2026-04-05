import { BaseFavouritesPageLocators } from '../common/shared.favouritesPage.locators';
import { Locator, Page } from '@playwright/test';

export class MobileFavouritesPageLocators extends BaseFavouritesPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Mobile and FR-Mobile specific locators that override abstract methods from base
  favoriteItemDealerInfo = (): Locator => this.page.locator('div[class*="FavoriteListItem_favoriteItemMobileFooter"] > div:first-child');
  // #endregion
}















