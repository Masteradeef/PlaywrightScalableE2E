import { BaseFavouritesPageLocators } from '../base/base.favouritesPage.locators';
import { Locator, Page } from '@playwright/test';

export class DesktopFavouritesPageLocators extends BaseFavouritesPageLocators {
  constructor(page: Page) {
    super(page);
  }

  // #region EN-Desktop and FR-Desktop specific locators that override abstract methods from base
  favoriteItemDealerInfo = (): Locator => this.page.locator('div.FavoriteListItem_favoriteItemDealerInfo__UQthX > div:first-child');
  // #endregion
}
