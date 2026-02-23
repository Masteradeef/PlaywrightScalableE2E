import { ActionResult, FilterType, RadiusType } from '../../utils/types/project.types';
import { BaseListPageLocators } from '../../locators/base/base.listPage.locators';
import { expect, Page } from '@playwright/test';
import { BaseActions } from './BaseActions';
import { ProjectContextManager } from '../../utils/config/project-context';
import * as testData from '../../data/test-data.json';

export abstract class BaseListPageActions extends BaseActions {
  protected listPageLocators: BaseListPageLocators;
  protected page: Page;

  constructor(listPageLocators: BaseListPageLocators, page: Page) {
    super();
    this.listPageLocators = listPageLocators;
    this.page = page;
  }

  // #region Functions for both Desktop and Mobile
  
  /**
   * Gets the localized filter name based on the current project language
   * @param filterType The filter type enum value
   * @returns The localized filter name string
   */
  private getLocalizedFilterName(filterType: FilterType): string {
    try {
      const contextManager = ProjectContextManager.getInstance();
      const language = contextManager.getLanguage();
      
      // Map FilterType enum values to their corresponding keys in test data
      let filterKey: string;
      switch (filterType) {
        case FilterType.Location:
          filterKey = 'Location';
          break;
        case FilterType.MakeModelTrim:
          filterKey = 'MakeModelTrim';
          break;
        case FilterType.Price:
          filterKey = 'Price';
          break;
        default:
          console.warn(`Unknown filter type: ${filterType}`);
          return filterType;
      }
      
      // Access the localized filter names from test data
      let localizedName = (testData as any).testData.filters[language]?.[filterKey];
      
      // Override with actual French filter names from AutoHebdo.net
      if (language === 'fr') {
        switch (filterKey) {
          case 'Location':
            localizedName = 'Emplacement';
            break;
          case 'MakeModelTrim':
            localizedName = 'Marque, Modèle, Version';
            break;
          case 'Price':
            localizedName = 'Prix';
            break;
        }
      }
      
      if (!localizedName) {
        console.warn(`No localized filter name found for ${filterKey} in language ${language}, falling back to enum value`);
        return filterType;
      }
      
      console.log(`Using localized filter name: "${localizedName}" for ${filterKey} in ${language}`);
      return localizedName;
    } catch (error) {
      console.warn(`Error getting localized filter name, falling back to enum value: ${error}`);
      return filterType;
    }
  }

  waitUntilResultSpinnerDisappear = async (timeout: number = 15000): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        try {
          await this.listPageLocators.resultSpinner().waitFor({ state: 'visible', timeout: 5000 })
          await this.listPageLocators.resultSpinner().waitFor({ state: 'hidden', timeout: 10000 })
        } catch (error) {
          // If spinner is not found, it might already be hidden, which is fine
          console.log('Result Spinner not found or already hidden, continuing...');
        }
      },
      'Result Spinner has disappeared',
      'Result Spinner did not disappear within timeout',
      timeout
    );
  }

  clickFilter = async (filterType: FilterType): Promise<this> => {
    // Get the localized filter name based on current project language
    const localizedFilterName = this.getLocalizedFilterName(filterType);
    
    // First handle the click operation
    await this.handleAsyncChainable(
      async () => {
        const totalFilters = await this.listPageLocators.filterList().count();
        let filterFound = false;
        
        for (let i = 0; i < totalFilters; i++) {
          const name = this.listPageLocators.filterName(i);
          const filterText = await name.textContent().then(text => text?.trim());
          
          if (filterText === localizedFilterName) {
            await this.listPageLocators.filter(i).click({ force: true });
            filterFound = true;
            break;
          }
        }
        
        if (!filterFound) {
          throw new Error(`Filter "${localizedFilterName}" not found among available filters`);
        }
        
        return true;
      },
      `Clicked filter "${localizedFilterName}" (${filterType}) using locator: ${this.listPageLocators.filterList().constructor.name}`,
      `Failed to click filter "${localizedFilterName}" (${filterType}) - locator: ${this.listPageLocators.filterList().constructor.name}`
    );
    
    // Then chain the spinner wait and return this for chaining
    return this.waitUntilSpinnerDisappear();
  };

  getListHeaderTitleText = async (): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {
        await this.listPageLocators.listHeaderTitle().waitFor({ state: 'visible', timeout: 10000 })
        const title = await this.listPageLocators.listHeaderTitle().textContent();
        return title;
      },
      'Successfully retrieved list header title',
      'Failed to get list header title'
    );
  }

  getResultsCount = async (): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {        
        await this.waitUntilResultSpinnerDisappear();
        const titleResult = await this.getListHeaderTitleText()
        if (!titleResult.success || !titleResult.data) {
          console.log('Could not retrieve title text');
          return null;
        }          
        const titleText = titleResult.data
        // Support both English "results" and French "résultats"
        const match = titleText.match(/^(\d+)\s+(results?|résultats?)/i)
          
        if (match && match[1]) {
          const count = parseInt(match[1], 10)          
          console.log(`Extracted results count from UI: ${count} from title: "${titleText.trim()}"`)
          return count          
        }
        console.log(`Could not extract number from title: "${titleText.trim()}"`)
        return null        
      },
      'Successfully retrieved results count',
      'Failed to get results count'
    );
  }

  clickSeeResultsButton = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.seeResultsButton().waitFor({ state: 'visible', timeout: 15000 });
        await this.listPageLocators.seeResultsButton().click({ timeout: 15000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        return true;
      },
      'Successfully clicked See Results button',
      'Failed to click See Results button',
      30000
    );
  };

  waitUntilSpinnerDisappear = async (timeout: number = 15000): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        try {
          await this.listPageLocators.filterSpinner().waitFor({ state: 'visible', timeout: 5000 })
          await this.listPageLocators.filterSpinner().waitFor({ state: 'hidden', timeout: 10000 })
        } catch (error) {
          // If spinner is not found, it might already be hidden, which is fine
          console.log('Filter Spinner not found or already hidden, continuing...');
        }
      },
      'Filter Spinner has disappeared',
      'Filter Spinner did not disappear within timeout',
      timeout
    );
  }

  waitUntilSeeResultsBtnSpinnerDisappear = async (timeout: number = 15000): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        try {
          await this.listPageLocators.seeResultsBtnSpinner().waitFor({ state: 'visible', timeout: 5000 })
          await this.listPageLocators.seeResultsBtnSpinner().waitFor({ state: 'hidden', timeout: 10000 })
        } catch (error) {
          // If spinner is not found, it might already be hidden, which is fine
          console.log('Apply Counter Spinner not found or already hidden, continuing...');
        }
      },
      'Apply Counter Spinner has disappeared',
      'Apply Counter Spinner did not disappear within timeout',
      timeout
    );
  }

  verifyListPageTitleContains = async (expectedTitle: string, minExpectedResults: number): Promise<void> => {
      
      console.log(`Verifying all listing titles contain ${expectedTitle}`);
      const titleCount = await this.listPageLocators.listingTitlesLocator().count();
      
      expect(titleCount).toBeGreaterThanOrEqual(minExpectedResults);
      console.log(`✅ Found ${titleCount} listings`);

      for (let i = 0; i < titleCount; i++) {
          const titleText = await this.listPageLocators.listingTitlesLocator().nth(i).textContent();
          const titleLower = titleText?.toLowerCase() || '';
          expect(titleLower).toContain(expectedTitle.toLowerCase());
          console.log(`✅ Listing ${i + 1}: ${titleText} contains "${expectedTitle}"`);
      }
  };

  clickOnFirstListing = async (pageLoadTimeout: number): Promise<void> => {
      console.log('Clicking on first listing title');
      const firstListing = this.listPageLocators.listingsLocator().first();
      await firstListing.click();
      
      // Wait for detail page to load
      await this.page.waitForLoadState();
      await this.page.waitForTimeout(pageLoadTimeout);
  };

  clickVehicleConditionFilter = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.vehicleConditionFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.vehicleConditionFilter().click({ timeout: 10000 });
      },
      'Successfully clicked vehicle condition filter',
      'Failed to click vehicle condition filter'
    );
  };

  //#region Abstract functions to be implemented by child classes (Desktop and Mobile)  
  abstract fillLocation(filterType: FilterType, value: string, radius: RadiusType): Promise<this>;
  abstract fillPrice(fromPrice: string, toPrice: string): Promise<this>;
  abstract selectMakeModelTrimFilter(make: string, model?: string, trim?: string): Promise<this>;
  abstract fillVehicleCondition(condition: string): Promise<this>;
  //#endregion

  // #region Functions that are mobile-specific and may be overridden by child classes
  clickFiltersButton = async (): Promise<this> => {
    throw new Error('clickFiltersButton is not available on this device type');
  };

  clickDoneButton = async (): Promise<this> => {
    throw new Error('clickDoneButton is not available on this device type');
  };
  // #endregion
  
}