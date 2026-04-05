import { test, expect } from '@playwright/test';
import { FilterType, Language, LegacyRadiusType, PageType, RadiusType, VehicleConditionType, MarketplaceType } from '../../core/helpers/definitions/project.types';
import { validateVehicleResults, monitorAndValidateApiResponse } from '../../core/helpers/utilities/apiHelpers';
import { OperationHandler } from '../../core/operations/OperationHandler';
import { ProjectContextManager, getTestData } from '../../core/helpers/settings/projectContext';
import { CookieHelper } from '../../core/helpers/utilities/cookieHelper';
import { DesktopListPageActions } from '../../core/operations/desktop/desktop.listPage.actions';
import { MobileListPageActions } from '../../core/operations/mobile/mobile.listPage.actions';
import { DesktopSharedActions } from '../../core/operations/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../core/operations/mobile/mobile.shared.actions';
import testData from '../inputdata/testdata.json';
import { BaseHomePageActions } from '../../core/operations/common/shared.homePage.actions';

// Get language from project context - will be initialized in beforeAll
let language: Language;

let listPageActions: DesktopListPageActions | MobileListPageActions;
let sharedActions: DesktopSharedActions | MobileSharedActions;
let homePageActions: BaseHomePageActions;
let loginActions: any;
let context: any;
let cookieHelper: CookieHelper;

test.describe('An anonymous user', () => {
  test.beforeAll(async ({}, workerInfo) => {
    // Initialize context for device detection (one time setup)
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
  });

  test.beforeEach(async ({ page }) => {
    
    // Initialize cookie helper
    cookieHelper = new CookieHelper(page);
    
    // Add cookies before test starts
    await cookieHelper.addAllCommonCookies();
    
    // Create smart proxies that automatically use desktop or mobile implementations
    listPageActions = OperationHandler.createActions(page, PageType.ListPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    // loginActions = OperationHandler.createActions(page, PageType.Login);
    
    // Navigate to list page
      await sharedActions.navigateToUrl('/lst');
  });

  test('List Page - Test 1 : should search by Make, Model, Trim, and Price', async () => {
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);

    const searchCriteria = testData.listPage.Test1;
    console.log('Using test data:', searchCriteria);

    const listApiPattern = '/lst.json';
    const expectedParams = {pricefrom: String(searchCriteria.priceFrom),priceto: String(searchCriteria.priceTo)};

    // Start fresh network capture BEFORE any actions that may trigger requests
    listPageActions.startFreshNetworkCapture();

    if (context.device === 'mobile') {
      await listPageActions.clickFiltersButton();
    }

    await listPageActions.fillLocation(FilterType.Location,searchCriteria.location,RadiusType.FiftyKm);
    await listPageActions.selectMakeModelTrimFilter(searchCriteria.make,searchCriteria.model,searchCriteria.trim);

    let latestListResponse: any = null;

    if (context.device === 'mobile') {
      const responsePromise = listPageActions.waitForNetworkResponse(listApiPattern,expectedParams);

      await listPageActions.fillPrice(searchCriteria.priceFrom, searchCriteria.priceTo);
      await listPageActions.clickSeeResultsButton();

      latestListResponse = await responsePromise;
    } else {
      const responsePromise = listPageActions.waitForNetworkResponse(listApiPattern,expectedParams);
      await listPageActions.fillPrice(searchCriteria.priceFrom, searchCriteria.priceTo);
      latestListResponse = await responsePromise;
      await listPageActions.waitForResultsToSettle();
    }

    const resultsCount = await listPageActions.getResultsCountOnListPage();

    expect(resultsCount,'Results count should be available from the page header before validating API results').not.toBeNull();
    expect(resultsCount as number,'Results count should be greater than 0 to validate API results').toBeGreaterThan(0);

    if (!latestListResponse) {
      console.log('No awaited response found, falling back to captured network buffer');

      let allResponses = listPageActions.getAllNetworkResponses(listApiPattern,expectedParams);

      if (allResponses.length === 0) {
        console.log(`No responses with exact params found, falling back to latest ${listApiPattern}`);
        allResponses = listPageActions.getAllNetworkResponses(listApiPattern);
      }

      expect(allResponses.length,`At least one ${listApiPattern} response should be captured to validate search results`).toBeGreaterThan(0);
      latestListResponse = allResponses[allResponses.length - 1];
    }

    const pageSize = resultsCount as number;

    const allResultsResponse = await listPageActions.callApiWithCustomSize(latestListResponse.url,pageSize);
    const validationResult = listPageActions.validateVehicleResults(
      allResultsResponse,
      resultsCount,
      searchCriteria.make,
      searchCriteria.model,
      +searchCriteria.priceFrom,
      +searchCriteria.priceTo
    );

    expect(validationResult.countMatches,`Count should match: Page header shows ${validationResult.pageHeaderCount}, API returned ${validationResult.apiResultsCount}`).toBe(true);
    expect(validationResult.allCorrectMakeModel,`All vehicles should be ${searchCriteria.make} ${searchCriteria.model}. Errors: ${validationResult.errors.filter((e: string) => e.includes('Expected')).join('; ')}`).toBe(true);
    expect(validationResult.allInPriceRange,`All vehicles should be in price range $${searchCriteria.priceFrom}-$${searchCriteria.priceTo}. Out of range vehicles: ${validationResult.priceOutOfRange.length}`).toBe(true);
    expect(validationResult.overallPass,`Overall validation should pass. Errors: ${validationResult.errors.join('; ')}`).toBe(true);

    if (validationResult.errors.length > 0) {
      console.log('\n❌ VALIDATION ERRORS:');
      validationResult.errors.forEach((error: string, index: number) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (validationResult.priceOutOfRange.length > 0) {
      console.log('\n⚠️ VEHICLES WITH PRICE ISSUES:');
      validationResult.priceOutOfRange.forEach((vehicle: any, index: number) => {
        console.log(
          `   ${index + 1}. ${vehicle.make} ${vehicle.model} ${vehicle.year} - ${vehicle.price} (${vehicle.numericPrice})`
        );
      });
    }

    console.log(`\n📊 SUMMARY: ${validationResult.overallPass ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}`);

    if (validationResult.apiResultsCount > 0) {
      console.log('\n=== Sample of Validated Vehicles ===');
      const listings = allResultsResponse.body.pageProps.listings;
      listings.slice(0, 5).forEach((vehicle: any, index: number) => {
        console.log(
          `  ${index + 1}. ${vehicle.vehicle?.make} ${vehicle.vehicle?.model} ${vehicle.vehicle?.modelYear} - ${vehicle.price?.priceFormatted}`
        );
      });

      if (listings.length > 5) {
        console.log(`  ... and ${listings.length - 5} more vehicles`);
      }
    }
  });

  test('List Page - Test 2 : search by Make, Model on list page and go to detail page', async () => {    
    // Direct access to objects - automatically uses desktop or mobile!
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
    
    // Get test data from JSON file
    const searchCriteria = testData.listPage.Test2;
    console.log('Using test data:', searchCriteria);
    if (context.device === 'mobile') {
        await listPageActions.clickFiltersButton();
      }
    await listPageActions.fillLocation(
      FilterType.Location,
      searchCriteria.location,
      RadiusType.Nationwide
    );

    await listPageActions.selectMakeModelTrimFilter(
      searchCriteria.make, 
      searchCriteria.model
    );
    await sharedActions.wait(2000); // Wait for 2 seconds to ensure stability
    if (context.device === 'mobile') {
      await listPageActions.clickSeeResultsButton();
    }
    // Verify that all listing titles contain the Make and Model
    await listPageActions.verifyListPageTitleContains(`${testData.listPage.Test2.make} ${testData.listPage.Test2.model}`, 1);
    console.log(`Vehicle: ${testData.listPage.Test2.make} ${testData.listPage.Test2.model}`);

    // Click on the first listing to go to the detail page
    await listPageActions.clickOnFirstListing(10000);
    console.log(`Navigated to detail page from first listing`);

    // Retrieve dataLayer from browser console
    let dataLayer = await sharedActions.getDataLayer();

    // Verify 'make' value from dataLayer
    console.log(`Verifying make in dataLayer`);
    dataLayer = await sharedActions.verifyDatalayerNodeValue(
      dataLayer,
      'make',
      testData.listPage.Test2.dataLayer.make
    );

    // Verify 'model' value from dataLayer
    console.log(`Verifying model in dataLayer`);
    await sharedActions.verifyDatalayerNodeValue(
      dataLayer,
      'model',
      testData.listPage.Test2.dataLayer.model
    );

    // Verify detail page URL path contains 'make-model' (case insensitive)
    await sharedActions.verifyUrlContains(testData.listPage.Test2.expectedUrlString);
    console.log(`Detail page URL: ${sharedActions.getCurrentUrl()}`);

     });

test.describe('An anonymous user : Saved Search Test', () => {
  test.beforeAll(async ({}, workerInfo) => {
    // Initialize context for device detection (one time setup)
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
  });

  test.beforeEach(async ({ page }) => {
    // Initialize cookie helper
    cookieHelper = new CookieHelper(page);

    // Add cookies before test starts
    await cookieHelper.addAllCommonCookies();

    // Create smart proxies that automatically use desktop or mobile implementations
    listPageActions = OperationHandler.createActions(page, PageType.ListPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    // loginActions = OperationHandler.createActions(page, PageType.Login);

    // Navigate to list page
    await sharedActions.navigateToUrl('/lst');
  });

  test.afterEach(async () => {
    //Verify created Save Search is delete from my account
    const searchCriteria = testData.listPage.Test4[context.language as Language];
    const result = await listPageActions.deleteAllSavedSearchesByApi(searchCriteria.deleteSavedSearchApiBaseUrl);
    expect(result.success).toBe(true);
    expect(result.data.failedCount).toBe(0);
  });

  test('List Page - Test 4 : Verify User is able to Save Search and Login in My Account', async ({ page }) => {

    page.setDefaultTimeout(120000);
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
    const searchCriteria = testData.listPage.Test4[context.language as Language];
    console.log('Using test data:', searchCriteria);

    if (context.device === 'mobile') {
      await listPageActions.clickFiltersButton();
    }

    await listPageActions.fillLocation(
      FilterType.Location,
      searchCriteria.location,
      RadiusType.Nationwide
    );

    await listPageActions.selectMakeModelTrimFilter(
      searchCriteria.make,
      searchCriteria.model
    );

    await sharedActions.wait(2000);

    if (context.device === 'mobile') {
      await listPageActions.clickSeeResultsButton();
    }

    expect(await listPageActions.isSaveSearchButtonVisible()).toBe(true);
    await listPageActions.clickSaveSearchButtonOnListPage(5000);
    expect(await listPageActions.isSaveSearchPopupVisible()).toBe(true);
    await sharedActions.savedSearchSubscription(searchCriteria.username);
    await sharedActions.wait(2000);

    await sharedActions.signIn(
      searchCriteria.username,
      searchCriteria.password
    );

    await sharedActions.wait(2000);
    await sharedActions.clickSavedSearchesMenu();
    await sharedActions.wait(2000);

    const isSearchSaved = await sharedActions.verifySavedSearchExists(
      `${searchCriteria.make} ${searchCriteria.model}`,
      10000
    );

    expect(isSearchSaved).toBe(true);
  });
});

  test('List Page - Test 5 : Verify the Recommender sections are displayed on List page', async () => {
    // Direct access to objects - automatically uses desktop or mobile!
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);

    await sharedActions.navigateToUrl(testData.similarListings[context.language as Language].similarListingsListPageURL)
    await sharedActions.wait(2000)
    // Assert the section is visible
    expect(await listPageActions.isViewSimilarListingsSectionVisible()).toBe(true);
    // Assert the section title is visible and contains expected text
    expect(await listPageActions.isViewSimilarListingsTitleVisible()).toBe(true);
    expect(await listPageActions.doesExploreSimilarVehiclesTitleContainText()).toBe(true);
    expect(await listPageActions.isSimilarListingsCardVisible()).toBe(true);
  })

  test('List Page - Test 6 : should search by Vehicle Condition CPO', async ({ page }) => {
    test.setTimeout(120_000);
    
    // Get test data from JSON file
    const searchCriteria = testData.listPage.Test6[context.language as Language];

    if (context.device === 'mobile') {
    await listPageActions.clickFiltersButton();
    }

    await listPageActions.fillLocation(FilterType.Location,searchCriteria.location,RadiusType.FiftyKm);
    await listPageActions.selectMakeModelTrimFilter(searchCriteria.make,searchCriteria.model);
    await sharedActions.wait(1000);
    await listPageActions.fillVehicleCondition(VehicleConditionType.CertifiedPreOwned);
    await sharedActions.wait(2000);

    //Getting count of CPO lisitngs on list Page
    const countCpoListings = await listPageActions.getCpoCount();

    //Getting the value from the Display tab that indicates how many cars are shown on the page
    const countDisplayValue = await listPageActions.getDisplayValue();

    //Assert CPO listing is diplayed
    expect(
      countCpoListings,
        `CPO count mismatch: expected ${countDisplayValue} (display dropdown), got ${countCpoListings}. ` +
          `lang=${context.language}, device=${context.device}, make=${searchCriteria.make}, model=${searchCriteria.model}`
      ).toBe(countDisplayValue);

    //Verify CPO pill is visible on Search Mask Tag after selecting CPO option from filter
    const cpoLocator = (listPageActions as any).listPageLocators.certifiedPreOwnedText();
    
    //Assert CPO pill is displayed on search mask filter Tags
    await expect(
      cpoLocator,
        `CPO pill not visible after selecting vehicle condition "${searchCriteria.cpoText}". ` +
          `lang=${context.language}, device=${context.device}`
    ).toBeVisible(); 
  })
  });

test.describe('A Logged in user', () => {
  test.beforeAll(async ({}, workerInfo) => {
    // Initialize context for device detection (one time setup)
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
  });

  test.beforeEach(async ({ page }) => {
    
    // Initialize cookie helper
    cookieHelper = new CookieHelper(page);
    
    // Add cookies before test starts
    await cookieHelper.addAllCommonCookies();
    
    // Create smart proxies that automatically use desktop or mobile implementations
    listPageActions = OperationHandler.createActions(page, PageType.ListPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    
    // Navigate to list page
    await sharedActions.navigateToUrl('/lst');
    await sharedActions.signIn(
      getTestData(testData.credentials).username,
      getTestData(testData.credentials).password
    );
    await sharedActions.wait(2000)
  });

  test.afterEach(async ({ page }) => {

    //Verify created Save Search is delete from my account
    const searchCriteria = testData.listPage.Test7[context.language as Language];
    const result = await listPageActions.deleteAllSavedSearchesByApi(searchCriteria.deleteSavedSearchApiBaseUrl);
    expect(result.success).toBe(true);
    expect(result.data.failedCount).toBe(0);
  });

  test('List Page - Test 7 : Login in My Account and Verify User is able to Save Search', async ({ page }) => {   
    test.setTimeout(120_000);
    
    // Get test data from JSON file
    const searchCriteria = testData.listPage.Test7[context.language as Language];

    console.log('Using test data:', searchCriteria);
    if (context.device === 'mobile') {
    await sharedActions.navigateToUrl(searchCriteria.listPageURL)
    await listPageActions.clickFiltersButton();
    }

    await listPageActions.fillLocation(FilterType.Location,searchCriteria.location,RadiusType.Nationwide);
    await listPageActions.selectMakeModelTrimFilter(searchCriteria.make, searchCriteria.model);
    await sharedActions.wait(2000); // Wait for 2 seconds to ensure stability
    if (context.device === 'mobile') {
      await listPageActions.clickSeeResultsButton();
    }

    // Check Save Search button is visible
    expect(await listPageActions.isSaveSearchButtonVisible()).toBe(true);

    // Click Save Search button
    await listPageActions.clickSaveSearchButtonOnListPage(5000);

    // Check Save Search Msg is visible
    const saveSearchnotification = await listPageActions.isSaveSearchNotificationVisible();
    expect(saveSearchnotification.data).toBe(true);

    //Verify Save Search Msg content
    const saveSearchMessage = await listPageActions.getSaveSearchMsg();
    expect((saveSearchMessage.data ?? '').trim()).toContain(searchCriteria.saveSearchMsg);
    
    const isDisabled = await listPageActions.isSaveSearchButtonDisabled();
    expect(isDisabled.data).toBe(true);
    
    await sharedActions.clickSavedSearchesMenu()
    await sharedActions.wait(2000)

    //Verify that the saved search appears in Saved Searches
    const isSearchSaved =  await sharedActions.verifySavedSearchExists(`${searchCriteria.make} ${searchCriteria.model}`, 5000);
    expect(isSearchSaved).toBe(true);
  })
});

test.describe('An anonymous user', () => {
  test.beforeAll(async ({}, workerInfo) => {
    // Initialize context for device detection (one time setup)
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
  });

  test.beforeEach(async ({ page }) => {
    
    // Initialize cookie helper
    cookieHelper = new CookieHelper(page);
    
    // Create smart proxies that automatically use desktop or mobile implementations
    listPageActions = OperationHandler.createActions(page, PageType.ListPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    homePageActions = OperationHandler.createActions(page, PageType.HomePage);
  });

  // This test will be skipped on mobile and will be removed once 100% traffic is on OMP and legacy Trader experience is removed
  test('List Page - Test 3 : Verify List page URL for legacy Trader users bucketed to OMP', async () => {
    if (context.device === 'mobile') {
      test.skip();
    };
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
     // Get test data from JSON file
    const searchCriteria = testData.listPage.Test3.LegacyTrader;
    console.log('Using test data:', searchCriteria);
    await sharedActions.navigateToUrl(searchCriteria.selectExperienceURL);
    await cookieHelper.clearAllCookies();
    await sharedActions.clickLegacyTraderExperienceButton();
    await sharedActions.wait(10000); // Wait for 10 seconds to ensure experience switch is processed
    const enterPostalCodeResult = await homePageActions.enterPostalCodeLegacy(searchCriteria.postalCode);
    expect(enterPostalCodeResult.success).toBeTruthy();
    const showMeCarsResult = await homePageActions.clickShowMeCarsBtnLegacy();
    expect(showMeCarsResult.success).toBeTruthy();
    expect(await sharedActions.checkMarketplaceExperience()).toBe(MarketplaceType.LegacyTrader);
    // Wait for page to fully load and form elements to be visible
    await sharedActions.wait(3000);
    await listPageActions.fillLegacyCityPostalCode(searchCriteria.postalCode);
    await sharedActions.wait(1000);
    await listPageActions.selectLegacyRadius(LegacyRadiusType.TwentyFiveKm);
    await listPageActions.fillLegacyMake(searchCriteria.make);
    await listPageActions.clickViewResultsButton();
    const currentUrl = await sharedActions.getCurrentUrl();
    console.log('Current URL:', currentUrl);
    //
    await cookieHelper.addAllCommonCookies();
    await cookieHelper.addHideWelcomePopupCookie();
    await sharedActions.reloadPage();
    const urlAfterCookies = await sharedActions.getCurrentUrl();
    console.log('URL after cookies:', urlAfterCookies);

    // Normalize URLs by removing trailing slashes for comparison
    const normalizeUrl = (url: string) => url.replace(/\/$/, '');
    expect(normalizeUrl(urlAfterCookies.data)).toBe(normalizeUrl(currentUrl.data));
    const expectedUrlPattern = searchCriteria[context.language as Language].listPageURL;
    expect(urlAfterCookies.data).toContain(expectedUrlPattern);
    expect(await sharedActions.checkMarketplaceExperience()).toBe(MarketplaceType.OneMarketplace);
    // Validate filters are still applied after cookie redirect
    if (context.device === 'mobile') {
        await listPageActions.clickFiltersButton();
      }
    await listPageActions.clickLocationFilter();
    const postalCode = await listPageActions.getCityPostalCodeInputValue();
    console.log('Postal code after redirect:', postalCode);
    // Extract only the postal code (first 6 alphanumeric characters)
  const extractedPostalCode = typeof postalCode === 'string' ? postalCode.match(/[A-Za-z0-9]{6}/)?.[0] : null;
  expect(extractedPostalCode,
    extractedPostalCode === searchCriteria.postalCode
      ? `Postal code matches: ${extractedPostalCode}`
      : `Postal code mismatch: got '${extractedPostalCode}', expected '${searchCriteria.postalCode}'`
  ).toBe(searchCriteria.postalCode);

    const radius = await listPageActions.getRadiusInputText();
    console.log('Radius after redirect:', radius);
    // Remove leading '+' from both actual and expected values
    const normalize = (val: string | null | undefined) => val ? val.replace(/^\+/, '').trim() : '';
    const normalizedRadius = normalize(radius);
    const normalizedExpectedRadius = normalize(LegacyRadiusType.TwentyFiveKm);
    expect(normalizedRadius,
      normalizedRadius === normalizedExpectedRadius
        ? `Radius matches: ${normalizedRadius}`
        : `Radius mismatch: got '${normalizedRadius}', expected '${normalizedExpectedRadius}'`
    ).toBe(normalizedExpectedRadius);
    await listPageActions.clickCloseFilterButton();
    const make = await listPageActions.getMakeInputValue();
    expect(make,
      make === searchCriteria.make
        ? `Make matches: ${make}`
        : `Make mismatch: got '${make}', expected '${searchCriteria.make}'`
    ).toBe(searchCriteria.make);
  });
});

















