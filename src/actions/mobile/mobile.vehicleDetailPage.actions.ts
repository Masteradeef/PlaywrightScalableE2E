import { BaseVehicleDetailPageActions } from '../base/base.vehicleDetailPage.actions';
import { MobileVehicleDetailPageLocators } from '../../locators/mobile/mobile.vehicleDetailPage.locators';
import { Page } from '@playwright/test';
import { ActionResult } from '../../utils/types/project.types';

export class MobileVehicleDetailPageActions extends BaseVehicleDetailPageActions {
  constructor(page: Page) {
    const locators = new MobileVehicleDetailPageLocators(page);
    super(locators, page);
  }

  // #region Mobile-specific implementations
  
  // #endregion
}
