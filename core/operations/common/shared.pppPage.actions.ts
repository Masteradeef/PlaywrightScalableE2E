import { Page } from '@playwright/test';
import { BaseActions } from './SharedActions';
import { BasePPPPageLocators } from '../../selectors/common/shared.pppPage.locators';

export abstract class BasePPPPageActions extends BaseActions {
  protected pppPageLocators: BasePPPPageLocators;
  protected page: Page;

  constructor(pppPageLocators: BasePPPPageLocators, page: Page) {
    super();
    this.pppPageLocators = pppPageLocators;
    this.page = page;
  }

  clickMayBeLaterLink = async (): Promise<this> =>
    this.handleAsyncChainable(
      async () => {
        const locator = this.pppPageLocators.MayBeLaterLink();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
      },
      'Successfully clicked May Be Later link',
      'Failed to click May Be Later link'
    );

}














