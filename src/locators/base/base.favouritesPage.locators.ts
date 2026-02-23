// base.favouritesPage.locators.ts
import { Locator, Page } from '@playwright/test';

export abstract class BaseFavouritesPageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all favourites pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  removeFromFavouritesButtons = () => this.page.locator('button[aria-label="Remove from Favourites"]');
  emptyFavouritesMessage = () => this.page.locator('h2.EmptyFavorites_emptyFavoritesTitle___Zyiu');
  favoriteItemMakeModel = () => this.page.locator('a.Link_link__Ajn7I h2.FavoriteListItem_favoriteItemMakeModel__Wpa7b');
  // #endregion

  // #abstract locators to be implemented by both desktop and mobile
  abstract favoriteItemDealerInfo(): Locator;
  // #endregion
}
