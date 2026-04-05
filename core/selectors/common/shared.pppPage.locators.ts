// shared.manualListingCreation.locators.ts
import { Page } from '@playwright/test';

export abstract class BasePPPPageLocators {
  constructor(protected page: Page) {}

  MayBeLaterLink = () => this.page.getByTestId('productSelection-continueFree');
}














