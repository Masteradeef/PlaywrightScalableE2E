import { Page, expect } from '@playwright/test';
import { BaseListPageActions } from '../base/base.listPage.actions';
import { DesktopListPageLocators } from '../../locators/desktop/desktop.listPage.locators';
import { FilterType, RadiusType } from '../../utils/types/project.types';

export class DesktopListPageActions extends BaseListPageActions {
  protected listPageLocators: DesktopListPageLocators;

  constructor(page: Page) {
    const locators = new DesktopListPageLocators(page);
    super(locators, page);
    this.listPageLocators = locators;
  }

  // #region Desktop-specific implementations of abstract methods  

  fillLocation = async (filterType: FilterType, value: string, radius: RadiusType): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Click the location filter first
        await this.clickFilter(filterType);
        
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
        
        // Click "See Results" button to apply the location filter
        await this.clickSeeResultsButton();
        
        // Add a small wait to ensure the form is stable before proceeding
        await this.page.waitForTimeout(1000);
        
        return true;
      },
      `Successfully filled location: ${value} with radius: ${radius}`,
      `Failed to fill location: ${value} with radius: ${radius}`
    );
  };

  selectMakeModelTrimFilter = async (make: string, model?: string, trim?: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Click Make/Model/Trim filter first
        await this.clickFilter(FilterType.MakeModelTrim);
        
        // Fill make
        if (make) {
          await this.listPageLocators.makeInput().waitFor({ state: 'visible', timeout: 15000 });
          await this.listPageLocators.makeInput().clear();
          await this.listPageLocators.makeInput().pressSequentially(make, { delay: 300 });
          await this.listPageLocators.suggestionItem(0).waitFor({ state: 'visible', timeout: 10000 });
          
          const itemCount = await this.listPageLocators.suggestionList().count();
          for (let i = 0; i < itemCount; i++) {
            const listItem = this.listPageLocators.suggestionItem(i);
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
          await this.listPageLocators.suggestionItem(0).waitFor({ state: 'visible', timeout: 10000 });
          
          const itemCount = await this.listPageLocators.suggestionList().count();
          for (let i = 0; i < itemCount; i++) {
            const listItem = this.listPageLocators.suggestionItem(i);
            const itemText = await listItem.textContent();
            if (itemText?.trim() === model) {
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
          
          await this.listPageLocators.trimInput().pressSequentially(trim, { delay: 500 });
          
          // Check if dropdown appears, if not, skip trim selection
          try {
            await this.listPageLocators.trimSuggestionListItemLabel(0).waitFor({ state: 'visible', timeout: 3000 });
          } catch (dropdownError) {
            return this; // Continue without trim selection
          }

          // Get the count of suggestion items in the dropdown
          const itemCount = await this.listPageLocators.trimSuggestionList().count();
          
          // Loop through items to find the matching trim value
          for (let i = 0; i < itemCount; i++) {
            const listItem = this.listPageLocators.trimSuggestionListItemLabel(i);
            const itemText = await listItem.textContent();
            
            if (itemText?.trim() === trim) {
              await this.listPageLocators.trimSuggestionListItem(i).click({ force: true, delay: 500 });
              
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
        
        // Click "See Results" button to apply the Make/Model/Trim filter
        await this.clickSeeResultsButton();
        return true;
      },
      `Successfully selected Make/Model/Trim: ${make}${model ? '/' + model : ''}${trim ? '/' + trim : ''}`,
      `Failed to select Make/Model/Trim: ${make}${model ? '/' + model : ''}${trim ? '/' + trim : ''}`
    );
  };

  fillPrice = async (fromPrice: string, toPrice: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Click price filter first
        await this.clickFilter(FilterType.Price);
        
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
        
        await this.waitUntilSpinnerDisappear();
        
        // Click "See Results" button to apply the price filter
        await this.clickSeeResultsButton();
        
        return true;
      },
      `Successfully filled price range: ${fromPrice} - ${toPrice}`,
      `Failed to fill price range: ${fromPrice} - ${toPrice}`
    );
  };

  fillVehicleCondition = async (condition: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        // Click vehicle condition filter
        await this.clickVehicleConditionFilter();
        
        // Verify filter form is visible
        const isFormVisible = await this.listPageLocators.vehicleConditionFilterForm().isVisible();
        expect(isFormVisible).toBe(true);
        
        // Try label first, then checkbox; error if not found
        const checkboxByRole = this.page.getByRole('checkbox', { name: condition });
        const labelByText = this.page.locator('label', { hasText: condition }).first();
        
        if (await labelByText.count() > 0) {
          await labelByText.scrollIntoViewIfNeeded();
          await labelByText.click({ force: true });
        } else if (await checkboxByRole.count() > 0) {
          const checkbox = checkboxByRole.first();
          try {
            await checkbox.scrollIntoViewIfNeeded();
            await checkbox.check({ force: true });
          } catch (checkboxError) {
            await checkbox.evaluate((el: HTMLInputElement) => {
              el.scrollIntoView({ block: 'center' });
              el.click();
            });
          }
        } else {
          throw new Error(`Vehicle condition option '${condition}' not found`);
        }
        
        // Click "See Results" button to apply the filter
        await this.clickSeeResultsButton();
        await this.page.waitForLoadState();
        
        return true;
      },
      `Successfully selected vehicle condition: ${condition}`,
      `Failed to select vehicle condition: ${condition}`
    );
  };

  // #endregion
}