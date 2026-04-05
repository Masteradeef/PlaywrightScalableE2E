import { test, expect } from '@playwright/test';
import { FilterType, Language, PageType } from '../../core/helpers/definitions/project.types';
import { OperationHandler } from '../../core/operations/OperationHandler';
import { ProjectContextManager } from '../../core/helpers/settings/projectContext';
import { CookieHelper } from '../../core/helpers/utilities/cookieHelper';
import { DesktopHomePageActions } from '../../core/operations/desktop/desktop.homePage.actions';
import { MobileHomePageActions } from '../../core/operations/mobile/mobile.homePage.actions';
import { DesktopListPageActions } from '../../core/operations/desktop/desktop.listPage.actions';
import { MobileListPageActions } from '../../core/operations/mobile/mobile.listPage.actions';
import { DesktopSharedActions } from '../../core/operations/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../core/operations/mobile/mobile.shared.actions';
import testDataRaw from '../inputdata/testdata.json';

const testData = structuredClone(testDataRaw);

// Get language from project context - will be initialized in beforeAll
let language: Language;

let homePageActions: DesktopHomePageActions | MobileHomePageActions;
let listPageActions: DesktopListPageActions | MobileListPageActions;
let sharedActions: DesktopSharedActions | MobileSharedActions;
let context: any;
let cookieHelper: CookieHelper;

test.describe('Home Page Tests', () => {
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
    homePageActions = OperationHandler.createActions(page, PageType.HomePage);
    listPageActions = OperationHandler.createActions(page, PageType.ListPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    
    // Navigate to home page
    await sharedActions.navigateToUrl('/');
  });

  test.skip('Home Page - Test 1 : should search vehicle by Make, Model, and Postal Code From Home Page', async () => {
      console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
      
      // Get test data based on language
      const searchCriteria = testData.homePage.Test1;
      console.log('Using test data:', searchCriteria);
      
      // Select make from dropdown
      const makeResult = await homePageActions.selectMakeFromDropdown(searchCriteria.make);
      expect(makeResult.success).toBe(true);
      
      // Select model
      const modelResult = await homePageActions.selectModel(searchCriteria.model);
      expect(modelResult.success).toBe(true);
      
      // Enter postal code
      const postalCodeResult = await homePageActions.enterPostalCode(searchCriteria.location);
      expect(postalCodeResult.success).toBe(true);
      
      // Click search button
      const searchResult = await homePageActions.clickResultFoundButton();
      expect(searchResult.success).toBe(true);
      
      // Verify list page results
      const headerTitleResult = await listPageActions.getListHeaderTitleText();
      expect.soft(headerTitleResult.success).toBe(true);
      expect.soft(headerTitleResult.data).toContain(searchCriteria.searchResultsTitle);
      
      // Verify results count
      const resultsCount = await listPageActions.getResultsCount();
      expect(resultsCount.success).toBe(true);
      expect(resultsCount.data).toBeGreaterThan(0);

      // Retrieve dataLayer from browser console
      let dataLayer = await sharedActions.getDataLayer();

      // Verify 'postal_code' value from dataLayer
      console.log(`Verifying postal_code in dataLayer`);
      dataLayer = await sharedActions.verifyDatalayerNodeValue(
          dataLayer,
          'postal_code',
          testData.homePage.Test1.dataLayer.postal_code
      );
  });

  test('Home page : Test 2 : Postal code persistence across List and Detail page navigation', async ({ page }) => {
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
    
    const searchCriteria = testData.homePage.Test2;
    console.log('Using test data:', searchCriteria);
    
    // Search for postal code and navigate to list page
    const enterPostalCodeResult = await homePageActions.enterPostalCode(searchCriteria.postalCode);
    expect(enterPostalCodeResult.success).toBe(true);
    const clickResultFoundButtonResult = await homePageActions.clickResultFoundButton();
    expect(clickResultFoundButtonResult.success).toBe(true);
    await page.waitForTimeout(5000); // To handle SaSe popup 
    
    // Validate postal code persisted on list page location filter
    if (context.device === 'desktop') {
      await listPageActions.clickLocationFilter();
    }
    const postalCodeValue = await listPageActions.getCityPostalCodeInputValue();
    const normalizedPostalCodeValue = typeof postalCodeValue === 'string'
      ? postalCodeValue.replace(/\s+/g, '')
      : null;
    const extractedPostalCode = normalizedPostalCodeValue
      ? normalizedPostalCodeValue.match(/[A-Za-z0-9]{6}/)?.[0]
      : null;
    const expectedPostalCodeNormalized = searchCriteria.postalCode
      ? searchCriteria.postalCode.replace(/\s+/g, '')
      : null;
    console.log(`List page postal code validation: expected '${expectedPostalCodeNormalized}' | got '${extractedPostalCode}'`);
    expect(extractedPostalCode?.toLowerCase()).toBe(expectedPostalCodeNormalized?.toLowerCase());
    await listPageActions.clickCloseFilterButton();
    
    // Navigate back to home and verify postal code still persisted
    const { success: logoClickSuccessAfterList } = await sharedActions.clickAutoTraderLogo();
    expect(logoClickSuccessAfterList, 'Failed to navigate back to home via AutoTrader logo after list page').toBeTruthy();
    await homePageActions.verifyLocationPersistenceOnHome(searchCriteria.postalCode);
    console.log(`Home page postal code validation (after list): postal code persisted`);
    
    // Navigate to detail page and return, verify postal code persistence maintained
    const clickResultFoundButtonResultAfterDetail = await homePageActions.clickResultFoundButton();
    expect(clickResultFoundButtonResultAfterDetail.success).toBe(true);
    await listPageActions.clickOnFirstListing(10000);
    const { success: logoClickSuccessAfterDetail } = await sharedActions.clickAutoTraderLogo();
    expect(logoClickSuccessAfterDetail, 'Failed to navigate back to home via AutoTrader logo after detail page').toBeTruthy();
    await homePageActions.verifyLocationPersistenceOnHome(searchCriteria.postalCode);
    console.log(`Home page postal code validation (after detail): postal code persisted`);
  });

  test('Home page : Test 3 : City persistence across List and Detail page navigation', async ({ page }) => {
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
    
    const searchCriteria = testData.homePage.Test2;
    console.log('Using test data:', searchCriteria);

    // Navigating to List page and returning back and validating persistence
    await homePageActions.enterPostalCode(searchCriteria.postalCode);// entering postal code first as the new user is not able to directly enter city name without entering postal code first.
    await homePageActions.clickResultFoundButton();
    const { success: logoClickSuccessInitial } = await sharedActions.clickAutoTraderLogo();
    expect(logoClickSuccessInitial, 'Failed to navigate back to home via AutoTrader logo before city search').toBeTruthy();
    await homePageActions.enterPostalCode(searchCriteria.city);
    await homePageActions.clickResultFoundButton();
    await page.waitForTimeout(5000); // To handle SaSe popup
    
    // Validate city persisted on list page location filter
    if (context.device === 'desktop') {
      await listPageActions.clickLocationFilter();
    }
    const cityValue = await listPageActions.getCityPostalCodeInputValue();
    const extractedCity = typeof cityValue === 'string' 
      ? cityValue.split(',')[0].trim() 
      : null;
    console.log(`List page city validation: expected '${searchCriteria.city}' | got '${extractedCity}'`);
    expect(extractedCity?.toLowerCase()).toBe(searchCriteria.city?.toLowerCase());
    await listPageActions.clickCloseFilterButton();
    
    // Navigate back to home and verify city still persisted
    const { success: logoClickSuccessAfterListCity } = await sharedActions.clickAutoTraderLogo();
    expect(logoClickSuccessAfterListCity, 'Failed to navigate back to home via AutoTrader logo after list page (city)').toBeTruthy();
    await homePageActions.verifyLocationPersistenceOnHome(searchCriteria.city, false);
    console.log(`Home page city validation (after list): city persisted`);
    
    // Navigate to detail page and return, verify city persistence maintained
    await homePageActions.clickResultFoundButton();
    await listPageActions.clickOnFirstListing(10000);
    const { success: logoClickSuccessAfterDetailCity } = await sharedActions.clickAutoTraderLogo();
    expect(logoClickSuccessAfterDetailCity, 'Failed to navigate back to home via AutoTrader logo after detail page (city)').toBeTruthy();
    await homePageActions.verifyLocationPersistenceOnHome(searchCriteria.city, false);
    console.log(`Home page city validation (after detail): city persisted`);
  });
});

















