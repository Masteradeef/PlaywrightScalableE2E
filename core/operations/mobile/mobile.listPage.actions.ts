import { Page, expect } from '@playwright/test';
import { BaseListPageActions } from '../common/shared.listPage.actions';
import { MobileListPageLocators } from '../../selectors/mobile/mobile.listPage.locators';
import { FilterType, RadiusType, VehicleConditionType } from '../../helpers/definitions/project.types';

export class MobileListPageActions extends BaseListPageActions {
  protected listPageLocators: MobileListPageLocators;

  constructor(page: Page) {
    const locators = new MobileListPageLocators(page);
    super(locators, page);
    this.listPageLocators = locators;
  }

  // #region Mobile-specific implementations of abstract methods
  fillLocation = async (filterType: FilterType, value: string, radius: RadiusType): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        
        // Click the location filter
        await this.clickLocationFilter();        
        // Fill the postal code/city input
        await this.listPageLocators.cityPostalCodeInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.cityPostalCodeInput().clear();
        await this.listPageLocators.cityPostalCodeInput().fill(value);
        
        // Select radius
        await this.listPageLocators.radiusInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.radiusInput().click();
        await this.listPageLocators.suggestionItem(0).waitFor({ state: 'visible', timeout: 5000 });
        
        const itemCount = await this.listPageLocators.suggestionList().count();
        for (let i = 0; i < itemCount; i++) {
          const listItem = this.listPageLocators.suggestionItem(i);
          const itemText = await listItem.textContent();
          
          if (itemText?.trim() === radius) {
            await listItem.click({ force: true });
            break;
          }
        }
        
        // Close filters on mobile
        await this.clickDoneButton();
        await this.waitUntilSeeResultsBtnSpinnerDisappear();
        
        return true;
      },
      `Successfully filled location: ${value} with radius: ${radius}`,
      `Failed to fill location: ${value} with radius: ${radius}`
    );
  };

  fillPrice = async (fromPrice: string, toPrice: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        
        // Click price filter
        await this.clickPriceFilter();        
        // Fill price from
        if (fromPrice) {
          await this.listPageLocators.priceFromInput().waitFor({ state: 'visible', timeout: 10000 });
          await this.listPageLocators.priceFromInput().clear();
          await this.listPageLocators.priceFromInput().fill(fromPrice);
        }
        
        // Fill price to
        if (toPrice) {
          await this.listPageLocators.priceToInput().waitFor({ state: 'visible', timeout: 10000 });
          await this.listPageLocators.priceToInput().clear();
          await this.listPageLocators.priceToInput().fill(toPrice);
        }
        
        // Close filters on mobile
        await this.clickDoneButton();
        await this.waitUntilSpinnerDisappear();
        
        return true;
      },
      `Successfully filled price range: ${fromPrice} - ${toPrice}`,
      `Failed to fill price range: ${fromPrice} - ${toPrice}`
    );
  };

  selectMakeModelTrimFilter = async (make: string, model?: string, trim?: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Wait for page to stabilize after previous filter operation
        await this.page.waitForTimeout(2000);
        
        
        // Click Make/Model/Trim filter
        await this.clickMakeModelTrimFilter();
        
        // Fill make
        if (make) {
          await this.listPageLocators.makeInput().waitFor({ state: 'visible', timeout: 15000 });
          await this.listPageLocators.makeInput().clear();
          await this.listPageLocators.makeInput().pressSequentially(make, { delay: 300 });
          await this.listPageLocators.suggestionItemMake(0).waitFor({ state: 'visible', timeout: 10000 });
          
          const itemCount = await this.listPageLocators.suggestionList().count();
          for (let i = 0; i < itemCount; i++) {
            const listItem = this.listPageLocators.suggestionItemMake(i);
            const itemText = await listItem.textContent();
            if (itemText?.trim().includes(make)) {
              await listItem.click({ force: true });
              break;
            }
          }
        }
        
        // Fill model if provided
        if (model) {
          await this.listPageLocators.modelInput().waitFor({ state: 'visible', timeout: 15000 });
          await this.listPageLocators.modelInput().clear();
          await this.listPageLocators.modelInput().pressSequentially(model, { delay: 300 });
          await this.listPageLocators.suggestionItemModel(0).waitFor({ state: 'visible', timeout: 10000 });
          
          const itemCount = await this.listPageLocators.suggestionList().count();
          for (let i = 0; i < itemCount; i++) {
            const listItem = this.listPageLocators.suggestionItemModel(i);
            const itemText = await listItem.textContent();
            if (itemText?.trim().includes(model)) {
              await listItem.click({ force: true });
              break;
            }
          }
        }
        
        // Fill trim if provided
        if (trim) {
          await this.listPageLocators.trimInput().waitFor({ state: 'visible', timeout: 10000 });
          
          await this.page.waitForFunction(
            () => {
              const input = document.querySelector('input[id^="trim-free-text-search-"][role="combobox"]') as HTMLInputElement;
              return input && !input.disabled;
            },
            { timeout: 10000 }
          );
          // Clear and focus the trim input first
          await this.listPageLocators.trimInput().clear();
          await this.listPageLocators.trimInput().click();
          
          // Type the trim with delays and trigger suggestions
          await this.listPageLocators.trimInput().pressSequentially(trim, { delay: 500 });
          
          // Wait a bit for suggestions to load, then check if suggestions appeared
          await this.page.waitForTimeout(2000);
          
          // Try to wait for suggestions, but handle if they don't appear
          try {
            await this.listPageLocators.trimSuggestionListItemLabel(0).waitFor({ state: 'visible', timeout: 5000 });
          } catch (error) {
            // If no suggestions, just press Enter to confirm the typed value
            await this.listPageLocators.trimInput().press('Enter');
            // Skip the suggestion selection and go directly to Done button
            await this.listPageLocators.trimDoneButton().waitFor({ state: 'visible', timeout: 5000 });
            await this.listPageLocators.trimDoneButton().click();
            return;
          }
          
          // Get the count of suggestion items in the dropdown
          const itemCount = await this.listPageLocators.trimSuggestionListItems().count();
          
          // Loop through items to find the matching trim value
          for (let i = 0; i < itemCount; i++) {
            const listItem = this.listPageLocators.trimSuggestionListItemLabel(i);
            const itemText = await listItem.textContent();
            
            if (itemText?.trim() === trim) {
              await this.listPageLocators.trimSuggestionListItems().nth(i).click({ force: true, delay: 500 });
              
              // Wait for spinner to disappear after selecting trim
              await this.page.waitForFunction(
                () => {
                  const spinner = document.querySelector('span.sr-spinner-wrapper') as HTMLElement;
                  return !spinner || 
                         window.getComputedStyle(spinner).display === 'none' || 
                         !spinner.offsetParent || 
                         spinner.style.visibility === 'hidden';
                },
                { timeout: 10000 }
              );
              
              await this.listPageLocators.trimDoneButton().waitFor({ state: 'visible', timeout: 5000 });
              await this.listPageLocators.trimDoneButton().click();
              break;
            }
            
            // Press down arrow to navigate to next item
            await this.listPageLocators.trimInput().press('ArrowDown');
            
            // If this is the last item and no match found, throw error
            if (i === itemCount - 1) {
              throw new Error(`Trim option '${trim}' not found in dropdown`);
            }
          }
        }
        
        // Close filters on mobile
        await this.clickDoneButton();
        await this.waitUntilSpinnerDisappear();
        
        return true;
      },
      `Successfully selected Make/Model/Trim: ${make}${model ? '/' + model : ''}${trim ? '/' + trim : ''}`,
      `Failed to select Make/Model/Trim: ${make}${model ? '/' + model : ''}${trim ? '/' + trim : ''}`
    );
  };

  fillVehicleCondition = async (condition: VehicleConditionType): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Click vehicle condition filter
        await this.clickVehicleConditionFilter();
        
        // Wait for filter form to appear
        await this.page.waitForTimeout(1000);

        const checkbox = this.listPageLocators.vehicleConditionFilterOption(condition);
        const labelByText = this.page.locator('label').filter({ hasText: new RegExp(`${condition}`, 'i') }).first();
        
        if (await labelByText.count() > 0) {
          await labelByText.scrollIntoViewIfNeeded();
          await labelByText.click({ force: true });
        } else if (await checkbox.count() > 0) {
          await checkbox.scrollIntoViewIfNeeded();
          await checkbox.check({ force: true });
        } else {
          throw new Error(`Vehicle condition option '${condition}' not found`);
        }
        
        // Mobile has a different structure and requires clicking Done button to apply filter
        await this.clickDoneButton();
        await this.clickSeeResultsButton();
        await this.page.waitForLoadState();
        
        return true;
      },
      `Successfully selected vehicle condition: ${condition}`,
      `Failed to select vehicle condition: ${condition}`
    );
  };
  // #endregion

  // #region Mobile-specific overrides
  clickFiltersButton = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Wait for any previous operations to complete
        await this.waitUntilSpinnerDisappear();
        
        // Wait for filters button to be available and clickable
        await this.listPageLocators.filtersButton().waitFor({ state: 'visible', timeout: 30000 });
        await this.listPageLocators.filtersButton().click();
        return true;
      },
      'Successfully clicked Filters button',
      'Failed to click Filters button',
      35000 // Increased timeout for mobile
    );
  };

  clickDoneButton = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.doneButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.doneButton().click();
        return true;
      },
      'Successfully clicked Done button',
      'Failed to click Done button'
    );
  };
  
// #region Legacy Trader Mobile specific overrides 
    clickViewResultsButton = async (): Promise<this> => {
    await this.listPageLocators.viewResultsButton().waitFor({ state: 'visible', timeout: 10000 });
    await this.listPageLocators.viewResultsButton().click();
    return this;
  }
    // #endregion

  // #region Legacy Trader Mobile specific implementations of abstract methods
  fillLegacyCityPostalCode = async (value: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.legacyFiltersButton().click();
        await this.listPageLocators.legacyLocationFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.legacyLocationFilter().click({ force: true });
        await this.listPageLocators.legacyLocationInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.legacyLocationInput().clear();
        await this.listPageLocators.legacyLocationInput().pressSequentially(value);
        return true;
      },
      `Successfully filled legacy city/postal code: ${value}`,
      `Failed to fill legacy city/postal code: ${value}`
    );
  };

  getCityPostalCodeInputValue = async (): Promise<string | null> => {
  try {
    await this.clickFiltersButton();
    await this.clickLocationFilter();

    const input = this.listPageLocators.cityPostalCodeInput();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    const value = await input.inputValue();
    console.log(`[List Page] Retrieved location value: '${value}'`);
    await this.clickBackButton();

    return value;
  } catch (error) {
    console.warn('[List Page] Failed to retrieve City/Postal Code input value', error);
    return null;
  }
};

  clickBackButton = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.backIcon().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.backIcon().click();
        return true;
      },
      'Successfully clicked back icon',
      'Failed to click back icon'
    );
  };

  clickCloseFilterButton = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.closeFilterButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.closeFilterButton().click();
        return true;
      },
      'Successfully clicked close filter button',
      'Failed to click close filter button'
    );
  };
  // #endregion

// #endregion
}














