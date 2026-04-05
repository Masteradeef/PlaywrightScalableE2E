// shared.manualListingCreation.locators.ts
import { Page } from '@playwright/test';

export abstract class BaseListingsPageLocators {
  constructor(protected page: Page) {}

  makeModelListing = () => this.page.locator('h2.pssl-listings-car-details__header').first();
  trimListing = () => this.page.locator('h3.pssl-listings-car-details__sub-header').first();
  priceListing = () => this.page.locator('div.pssl-listings-car-details__header.pssl-listings-car-details-info__price').first();
  otherDetailsListing = () => this.page.locator('ul.pssl-listings-car-details-info__list').first();
  editButton = () => this.page.getByLabel('Edit').first();
  deleteButton = () => this.page.getByLabel('Delete').first();
  confirmDeleteButton = () => this.page.getByRole('button', { name: /Yes, delete|Oui, supprimer/ }).first();
}














