import { BaseVehicleDetailPageActions } from '../common/shared.vehicleDetailPage.actions';
import { MobileVehicleDetailPageLocators } from '../../selectors/mobile/mobile.vehicleDetailPage.locators';
import { Page } from '@playwright/test';
import { ActionResult } from '../../helpers/definitions/project.types';

export class MobileVehicleDetailPageActions extends BaseVehicleDetailPageActions {
  constructor(page: Page) {
    const locators = new MobileVehicleDetailPageLocators(page);
    super(locators, page);
  }

  // #region Mobile-specific implementations
  async clickCloseCallTheSellerButton(): Promise<ActionResult> {
    try {
      await this.vehicleDetailPageLocators.closeCallTheSellerButton().waitFor({ state: 'visible', timeout: 5000 });
      await this.vehicleDetailPageLocators.closeCallTheSellerButton().click();
      return { success: true };
    } catch (error) {
      console.error('Error clicking Close Call The Seller button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }
  
  // #endregion
}















