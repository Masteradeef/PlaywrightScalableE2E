import { Page } from '@playwright/test';
import { BaseActions } from './SharedActions';
import { BaseListingsPageLocators } from '../../selectors/common/shared.listingsPage.locators';

export abstract class BaseListingsPageActions extends BaseActions {
  protected listingsPageLocators: BaseListingsPageLocators;
  protected page: Page;

  constructor(listingsPageLocators: BaseListingsPageLocators, page: Page) {
    super();
    this.listingsPageLocators = listingsPageLocators;
    this.page = page;
  }

  getMakeModel = async (): Promise<string | null> => {
    const locator = this.listingsPageLocators.makeModelListing();
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return locator.innerText();
    } catch {
      return null;
    }
  };

  getTrim = async (): Promise<string> => {
    const locator = this.listingsPageLocators.trimListing();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    return locator.innerText();
  };

  getPrice = async (): Promise<string> => {
    const locator = this.listingsPageLocators.priceListing();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    const raw = await locator.innerText();
    return raw.replace(/[^0-9]/g, '');
  };

  getOtherDetails = async (): Promise<string> => {
    const locator = this.listingsPageLocators.otherDetailsListing();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    return locator.innerText();
  };

  clickEditButton = async (): Promise<this> =>
    this.handleAsyncChainable(
      async () => {
        const locator = this.listingsPageLocators.editButton();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
      },
      'Successfully clicked Edit button',
      'Failed to click Edit button'
    );

  clickDeleteButton = async (): Promise<this> =>
    this.handleAsyncChainable(
      async () => {
        const locator = this.listingsPageLocators.deleteButton();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
      },
      'Successfully clicked Delete button',
      'Failed to click Delete button'
    );  

  clickConfirmDelete = async (): Promise<this> =>
    this.handleAsyncChainable(
      async () => {
        const locator = this.listingsPageLocators.confirmDeleteButton();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
        await this.page.waitForTimeout(5000);
      },
      'Successfully clicked Confirm Delete button',
      'Failed to click Confirm Delete button'
    );
}















