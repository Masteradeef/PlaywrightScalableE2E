import { ActionResult, FilterType, LegacyRadiusType, RadiusType, VehicleConditionType } from '../../helpers/definitions/project.types';
import { BaseListPageLocators } from '../../selectors/common/shared.listPage.locators';
import { expect, Page } from '@playwright/test';
import { BaseActions } from './SharedActions';
import { ProjectContextManager } from '../../helpers/settings/projectContext';
import * as testData from '../../testdata/sampledata.json';

export abstract class BaseListPageActions extends BaseActions {
  protected listPageLocators: BaseListPageLocators;
  protected page: Page;
  private networkResponses: any[] = [];
  private isNetworkListening: boolean = false;

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
  };

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
  
  getResultsCountOnListPage = async (): Promise<number | null> => {
    try {
       // Ensure results have fully loaded before reading the header
       await this.waitUntilSpinnerDisappear();
      const titleText = await this.getListHeaderTitleTextOnListPage()
      if (!titleText) {
        console.log('No title text found')
        return null
      }
      const trimmedTitle = titleText.trim()
      // Extract the leading number regardless of locale, e.g.:
      // "133 results for ...", "133 résultats pour ...", "1 234 résultats", etc.
      const match = trimmedTitle.match(/^(\d[\d\s.,']*)/)
      if (match && match[1]) {
        const numericPart = match[1].replace(/[^\d]/g, '')
         if (numericPart.length > 0) {
           const count = parseInt(numericPart, 10)
           console.log(`Extracted results count: ${count} from title: "${trimmedTitle}"`)
           return count
         }
      }

        console.log(`Could not extract number from title: "${trimmedTitle}"`)
      return null
    } catch (error) {
      console.error('Failed to get results count:', error)
      return null
    }
  }  

  getListHeaderTitleTextOnListPage = async (): Promise<string | null> => {
    let hasWaitedForLoad = false  
    try {
      if (!hasWaitedForLoad) {
        await this.page.waitForLoadState('domcontentloaded')
        hasWaitedForLoad = true
      }
      await this.listPageLocators.listPageHeaderTitle().waitFor({ state: 'visible', timeout: 10000 })
      return await this.listPageLocators.listPageHeaderTitle().textContent()      
    } catch (error) {
      console.error('Failed to get list header title text:', error)
      return null
    }
  };

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

  getRadiusInputText = async (): Promise<string | null> => {
  try {
    await this.waitUntilSpinnerDisappear()
    await this.listPageLocators.radiusInput().waitFor({ state: 'visible', timeout: 10000 })
    const text = await this.listPageLocators.radiusInput().textContent()
    console.log(`Radius input text: ${text}`)
    return text
    } catch (error) {
    console.error('Failed to get radius input text:', error)
    return null
    }
  };

  getSaveSearchMsg = async (): Promise<ActionResult> => {
  return this.handleAsync(
    async () => {
      await this.listPageLocators
        .saveSearchMsg()
        .waitFor({ state: 'visible', timeout: 10000 });

      const text = (await this.listPageLocators.saveSearchMsg().textContent())?.trim();

      if (!text) {
        throw new Error('Save search message text is empty');
      }

      return text;
    },
    'Successfully got save search message text',
    'Failed to get save search message text'
    );
  };

  deleteAllSavedSearchesByApi = async (baseUrl: string
  ): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {
        const headers = {
          Accept: 'application/json',
          'Accept-Language': 'en-CA',
        };

        // 1) Fetch all saved-search subscriptions.
        const listRes = await this.page.request.get(baseUrl, {
          headers,
          failOnStatusCode: false,
        });
        const listText = await listRes.text();
        if (!listRes.ok()) {
          throw new Error(`List API failed (${listRes.status()}): ${listText}`);
        }

        const json = JSON.parse(listText) as { subscriptions?: Array<{ id?: string }> };
        const ids = (json.subscriptions ?? [])
          .map((s) => s.id?.trim())
          .filter((id): id is string => Boolean(id));

        // 2) Delete each saved search by ID.
        const results = await Promise.all(
          ids.map(async (id) => {
            const delRes = await this.page.request.delete(`${baseUrl}/${encodeURIComponent(id)}`, {
              headers,
              failOnStatusCode: false,
            });
            return { ok: delRes.ok() };
          })
        );

        // 3) Build success/failure summary for assertions and reporting.
        const failedCount = results.filter((r) => !r.ok).length;

        return {
          failedCount,
        };
      },
      'Successfully deleted saved searches via API',
      'Failed to delete saved searches via API'
    );
  };

  getMakeInputValue = async (): Promise<string | null> => {
    try {
      await this.clickMakeModelTrimFilter();
      await this.listPageLocators.makeInput().waitFor({ state: 'visible', timeout: 10000 })
      return await this.listPageLocators.makeInput().getAttribute('value')      
    } catch (error) {
      console.error('Failed to get make input value:', error)
      return null
    }
  };

  isSaveSearchButtonVisible = async (): Promise<boolean> => {
    return await this.listPageLocators.saveSearchButtonOnListPageLocator().isVisible();
  };

  isSaveSearchButtonDisabled = async (): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {
        await this.listPageLocators.saveSearchButtonOnListPageLocator().waitFor({ state: 'visible', timeout: 10000 });
        return await this.listPageLocators.saveSearchButtonOnListPageLocator().isDisabled();
  },
    'Successfully checked Save Search button disabled state',
    'Failed to check Save Search button disabled state'
    );
  };

  clickSaveSearchButtonOnListPage = async (timeout?: number): Promise<void> => {
      console.log('Clicking on Save Search button on List Page');
      const saveSearchButton = this.listPageLocators.saveSearchButtonOnListPageLocator();
      await saveSearchButton.click();

      await this.page.waitForLoadState();
      if (timeout) {
        await this.page.waitForTimeout(timeout);
      }
    };

  isSaveSearchPopupVisible = async (): Promise<boolean> => {
      await this.listPageLocators.saveSearchPopupModalLocator().waitFor({ state: 'visible', timeout: 10000 });
      return await this.listPageLocators.saveSearchPopupModalLocator().isVisible();
    };

  isSaveSearchNotificationVisible = async (): Promise<ActionResult> => {
  return this.handleAsync(
    async () => {
      await this.listPageLocators.saveSearchNotification().waitFor({ state: 'visible', timeout: 10000 });
      return await this.listPageLocators.saveSearchNotification().isVisible();
    },
    'Save search message is visible',
    'Failed to verify save search message visibility'
    );
  };

  isDeleteNotificationVisible = async (): Promise<ActionResult> => {
  return this.handleAsync(
    async () => {
      await this.listPageLocators.saveSearchDeleteNotification().waitFor({ state: 'visible', timeout: 10000 });
      return await this.listPageLocators.saveSearchDeleteNotification().isVisible();
    },
    'Save search delete message is visible',
    'Failed to verify save search delete message visibility'
    );
  };

  isViewSimilarListingsSectionVisible = async (): Promise<boolean> => {
      await this.listPageLocators.listPageSimilarListingsContainer().scrollIntoViewIfNeeded();
      const visible = await this.listPageLocators.listPageSimilarListingsContainer().isVisible();
      console.log('[DEBUG] isViewSimilarListingsSectionVisible:', visible);
      return visible;
    };

    isViewSimilarListingsTitleVisible = async (): Promise<boolean> => {
      const visible = await this.listPageLocators.listPageSimilarListingsTitle().isVisible();
      console.log('[DEBUG] isViewSimilarListingsTitleVisible:', visible);
      return visible;
    };

    doesExploreSimilarVehiclesTitleContainText = async (): Promise<boolean> => {
      if (await this.listPageLocators.listPageSimilarListingsTitle().isVisible()) {
        const text = (await this.listPageLocators.listPageSimilarListingsTitle().textContent())?.trim() || '';
        // Check for both English and French text
        const result = text.includes('Explore similar vehicles') || text.includes('Véhicules similaires');
        console.log('[DEBUG] doesExploreSimilarVehiclesTitleContainText: text="' + text + '", result=', result);
        return result;
      }
      console.log('[DEBUG] doesExploreSimilarVehiclesTitleContainText: title not visible');
      return false;
    };

    isSimilarListingsCardVisible = async (): Promise<boolean> => {
    if (await this.listPageLocators.similarListingsCard().isVisible()) {
      const cardTitleText = (await this.listPageLocators.similarListingsCardTitle().textContent())?.trim() || '';
      const result = cardTitleText !== '';
      
      console.log(
        '[DEBUG] isSimilarListingsCardVisible: cardTitleText="' +
          cardTitleText +
          '", result=' +
          result
      );
      
      return result;
    }
    
    console.log('[DEBUG] isSimilarListingsCardVisible: card not visible');
    return false;
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

  getCpoCount = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
       const cpoLocator = this.listPageLocators.CpoPillText();
       await cpoLocator.first().waitFor({ state: 'visible', timeout: 10000 });
       return cpoLocator.count();
      },
      'Successfully counted CPO filter on list page',
      'Failed to count CPO filter on list page'
    );
  };

  getDisplayValue = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
       const pageSizeValue = await this.listPageLocators.displayValue().inputValue();
       const pageSize = Number.parseInt(pageSizeValue, 10);
      },
      'Successfully fetched the display value from list page',
      'Failed to fetch the display value from list page'
    );
  };

  clickLocationFilter = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.locationFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.locationFilter().click({ timeout: 10000 });
      },
      'Successfully clicked location filter',
      'Failed to click location filter'
    );
  };

  clickMakeModelTrimFilter = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.makeModelTrimFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.makeModelTrimFilter().click({ timeout: 10000 });
      },
      'Successfully clicked make model trim filter',
      'Failed to click make model trim filter'
    );
  };

  clickPriceFilter = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.priceFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.priceFilter().click({ timeout: 10000 });
      },
      'Successfully clicked price filter',
      'Failed to click price filter'
    );
  };

startFreshNetworkCapture = () => {
  this.networkResponses = [];
  this.initializeNetworkListener();
  console.log(`Network capture started fresh at ${new Date().toISOString()} | page: ${this.page.url()}`);
};

initializeNetworkListener = () => {
  if (!this.isNetworkListening) {
    this.page.on('response', async (response) => {
      try {
        const responseUrl = response.url();

        const responseData = {
          url: responseUrl,
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          body: null as any,
          timestamp: new Date().toISOString()
        };

        if (response.status() < 400) {
          try {
            const contentType = response.headers()['content-type'] || '';

            if (contentType.includes('application/json')) {
              responseData.body = await response.json();
            } else if (contentType.includes('text/')) {
              responseData.body = await response.text();
            } else {
              responseData.body = 'Binary or unsupported content type';
            }
          } catch {
            responseData.body = 'Could not parse response body';
          }
        }

        this.networkResponses.push(responseData);
      } catch (error) {
        console.warn('Error capturing network response:', error);
      }
    });

    this.isNetworkListening = true;
    console.log('Network listener initialized');
  }
};

private urlMatches = (
  rawUrl: string,
  urlPattern?: string,
  urlParams?: Record<string, string>
): boolean => {
  try {
    const parsedUrl = new URL(rawUrl);

    if (urlPattern) {
      const fullUrl = `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`;
      if (!fullUrl.includes(urlPattern) && !parsedUrl.pathname.includes(urlPattern)) {
        return false;
      }
    }

    if (urlParams) {
      for (const [key, expectedValue] of Object.entries(urlParams)) {
        const actualValue = parsedUrl.searchParams.get(key);
        if (actualValue !== String(expectedValue)) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
};

getAllNetworkResponses = (
  urlPattern?: string,
  urlParams?: Record<string, string>
): any[] => {
  this.initializeNetworkListener();

  if (!urlPattern && !urlParams) {
    return [...this.networkResponses];
  }

  return this.networkResponses.filter((response) =>
    this.urlMatches(response.url, urlPattern, urlParams)
  );
};

waitForNetworkResponse = async (
  urlPattern?: string,
  urlParams?: Record<string, string>,
  timeout: number = 60000
): Promise<any> => {
  this.initializeNetworkListener();

  console.log(
    `Waiting for network response. Pattern: ${urlPattern || 'any'}, Params: ${JSON.stringify(urlParams || {})}`
  );

  const response = await this.page.waitForResponse(
    async (response) => {
      if (response.status() >= 400) {
        return false;
      }

      return this.urlMatches(response.url(), urlPattern, urlParams);
    },
    { timeout }
  );

  let body: any = null;
  try {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else if (contentType.includes('text/')) {
      body = await response.text();
    } else {
      body = 'Binary or unsupported content type';
    }
  } catch {
    body = 'Could not parse response body';
  }

  const responseData = {
    url: response.url(),
    status: response.status(),
    statusText: response.statusText(),
    headers: response.headers(),
    body,
    timestamp: new Date().toISOString()
  };

  console.log(`[waitForNetworkResponse] Captured ${responseData.status} ${responseData.url}`);

  return responseData;
};

waitForResultsToSettle = async (timeout: number = 1500) => {
  await this.page.waitForTimeout(timeout);
};

callApiWithCustomSize = async (
  baseUrl: string,
  customSize: number,
  additionalParams?: Record<string, string>
): Promise<any> => {
  try {
    const url = new URL(baseUrl);
    const searchParams = new URLSearchParams(url.search);

    searchParams.set('size', customSize.toString());

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        searchParams.set(key, value);
      });
    }

    const newUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;

    console.log(`Making API call with custom size ${customSize}:`);
    console.log(`URL: ${newUrl}`);

    const response = await this.page.request.get(newUrl);

    const responseData = {
      url: newUrl,
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body: null as any
    };

    try {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('application/json')) {
        responseData.body = await response.json();
      } else if (contentType.includes('text/')) {
        responseData.body = await response.text();
      } else {
        responseData.body = 'Binary or unsupported content type';
      }
    } catch {
      responseData.body = 'Could not parse response body';
    }

    console.log(`API Response Status: ${responseData.status}`);

    if (responseData.body?.pageProps?.listings) {
      const vehicleCount = responseData.body.pageProps.listings.length;
      const totalResults = responseData.body.pageProps.numberOfResults || 0;
      console.log(`Vehicles returned: ${vehicleCount}`);
      console.log(`Total available: ${totalResults}`);
    }

    return responseData;
  } catch (error) {
    console.error(`Failed to call API with custom size ${customSize}:`, error);
    throw error;
  }
};

validateVehicleResults = (
  apiResponse: any,
  expectedCount: number | null,
  expectedMake: string,
  expectedModel: string,
  minPrice: number,
  maxPrice: number
) => {
  const result = {
    pageHeaderCount: expectedCount,
    apiResultsCount: 0,
    countMatches: false,
    allCorrectMakeModel: true,
    allInPriceRange: true,
    overallPass: false,
    errors: [] as string[],
    priceOutOfRange: [] as any[]
  };

  try {
    const listings = apiResponse?.body?.pageProps?.listings || [];
    result.apiResultsCount = listings.length;

    if (expectedCount !== null) {
      result.countMatches = result.apiResultsCount === expectedCount;
      if (!result.countMatches) {
        result.errors.push(
          `Count mismatch: Page header shows ${expectedCount}, API returned ${result.apiResultsCount}`
        );
      }
    }

    listings.forEach((vehicle: any, index: number) => {
      const make = vehicle.vehicle?.make || 'Unknown';
      const model = vehicle.vehicle?.model || 'Unknown';
      const year = vehicle.vehicle?.modelYear || 'Unknown';
      const priceFormatted = vehicle.price?.priceFormatted || 'No price';

      if (make !== expectedMake || model !== expectedModel) {
        result.allCorrectMakeModel = false;
        result.errors.push(
          `Vehicle ${index + 1}: Expected ${expectedMake} ${expectedModel}, got ${make} ${model}`
        );
      }

      const priceMatch = priceFormatted.replace(/\s/g, '').match(/[\d,]+/);
      if (priceMatch) {
        const numericPrice = parseInt(priceMatch[0].replace(/[$,]/g, ''), 10);
        const normalizedMinPrice = parseInt(String(minPrice).replace(/[$,]/g, ''), 10);
        const normalizedMaxPrice = parseInt(String(maxPrice).replace(/[$,]/g, ''), 10);
        
        if (numericPrice < normalizedMinPrice || numericPrice > normalizedMaxPrice) {
          result.allInPriceRange = false;
          result.priceOutOfRange.push({
            make,
            model,
            year,
            price: priceFormatted,
            numericPrice
          });
        }
      } else {
        result.allInPriceRange = false;
        result.errors.push(`Vehicle ${index + 1}: Could not parse price "${priceFormatted}"`);
      }
    });

    result.overallPass =
      result.countMatches &&
      result.allCorrectMakeModel &&
      result.allInPriceRange;
  } catch (error) {
    result.errors.push(`Validation error: ${error}`);
  }

  return result;
};
// #endregion
  //#region Abstract functions to be implemented by child classes (Desktop and Mobile)  
  abstract fillLocation(filterType: FilterType, value: string, radius: RadiusType): Promise<this>;
  abstract fillPrice(fromPrice: string, toPrice: string): Promise<this>;
  abstract selectMakeModelTrimFilter(make: string, model?: string, trim?: string): Promise<this>;
  abstract getCityPostalCodeInputValue(): Promise<string | null>;
  abstract fillVehicleCondition(condition: VehicleConditionType): Promise<this>;
  //#endregion

  // #region Functions that are mobile-specific and may be overridden by child classes
  clickFiltersButton = async (): Promise<this> => {
    throw new Error('clickFiltersButton is not available on this device type');
  };

  clickDoneButton = async (): Promise<this> => {
    throw new Error('clickDoneButton is not available on this device type');
  };
  clickBackButton = async (): Promise<this> => {
    throw new Error('clickBackButton is not available on this device type');
  };
    // #region Legacy Trader functions 
    clickViewResultsButton = async (): Promise<this> => {
      // This method is only available on handheld/XS viewports
      // On desktop, it's a no-op and returns this for method chaining
      console.log('clickViewResultsButton: skipped (desktop viewport)');
      return this;
    };
    // #endregion


  // #endregion

  // #region Functions that are Desktop-specific and may be overridden by child classes
    clickCloseFilterButton = async (): Promise<this> => {
      throw new Error('clickCloseFilterButton is not available on this device type');
    }
    // #region Legacy Trader functions 
    // #endregion


  // #endregion

  // #region Legacy Trader functions 
    selectLegacyRadius = async (radius: LegacyRadiusType): Promise<this> => {
      return this.handleAsyncChainable(
        async () => {
          await this.listPageLocators.legacyRadiusFilter().waitFor({ state: 'visible', timeout: 10000 });
          await this.listPageLocators.legacyRadiusFilter().selectOption({ label: radius });
          await this.listPageLocators.applyLocationButton().click();
          return true;
        },
        `Successfully selected legacy radius: ${radius}`,
        `Failed to select legacy radius: ${radius}`
      );
    };

    fillLegacyMake = async (make: string): Promise<this> => {
      return this.handleAsyncChainable(
        async () => {
          await this.listPageLocators.legacyMakeFilter().waitFor({ state: 'visible', timeout: 10000 });
          await this.listPageLocators.legacyMakeFilter().click({ force: true });
          await this.listPageLocators.inputLegacyMakeSearch().pressSequentially(make, { delay: 300 });
          await this.page.keyboard.press('Enter');
          await this.listPageLocators.legacyMakeInput(make).click({ force: true });
          await this.page.waitForTimeout(3000);
        },
        `Successfully selected legacy make: ${make}`,
        `Failed to select legacy make: ${make}`
      );
    };

    fillLegacyModel = async (model: string): Promise<this> => {
      return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.legacyModelFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.legacyModelFilter().click({ force: true });
        await this.listPageLocators.legacyModelInput(model).waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.legacyModelInput(model).click({ force: true });
        return true;
      },
      `Successfully selected legacy model: ${model}`,
      `Failed to select legacy model: ${model}`
      );
    };

    fillLegacyTrim = async (trim: string): Promise<this> => {
      return this.handleAsyncChainable(
      async () => {
        await this.listPageLocators.legacyTrimFilter().waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.legacyTrimFilter().click({ force: true });
        await this.listPageLocators.legacyTrimInput(trim).waitFor({ state: 'visible', timeout: 10000 });
        await this.listPageLocators.legacyTrimInput(trim).check({ force: true });
        return true;
      },
      `Successfully selected legacy trim: ${trim}`,
      `Failed to select legacy trim: ${trim}`
      );
    };
  // #endregion
  // #region Legacy Trader abstract functions
  abstract fillLegacyCityPostalCode(value: string): Promise<this>;
  // #endregion
  
}















