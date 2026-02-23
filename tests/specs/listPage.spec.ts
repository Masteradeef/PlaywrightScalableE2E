import { test, expect } from '@playwright/test';
import { FilterType, Language, PageType, RadiusType } from '../../src/utils/types/project.types';
import { validateVehicleResults, monitorAndValidateApiResponse } from '../../src/utils/helpers/apiHelpers';
import { ActionProxy } from '../../src/actions/ActionProxy';
import { ProjectContextManager } from '../../src/utils/config/project-context';
import { CookieHelper } from '../../src/utils/helpers/cookieHelper';
import { DesktopListPageActions } from '../../src/actions/desktop/desktop.listPage.actions';
import { MobileListPageActions } from '../../src/actions/mobile/mobile.listPage.actions';
import { DesktopSharedActions } from '../../src/actions/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../src/actions/mobile/mobile.shared.actions';
import testData from '../data/test-data.json';

// Get language from project context - will be initialized in beforeAll
let language: Language;

let listPageActions: DesktopListPageActions | MobileListPageActions;
let sharedActions: DesktopSharedActions | MobileSharedActions;
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
    listPageActions = ActionProxy.createActions(page, PageType.ListPage);
    sharedActions = ActionProxy.createActions(page, PageType.Shared);
    // loginActions = ActionProxy.createActions(page, PageType.Login);
    
    // Navigate to list page
    await sharedActions.navigateToUrl('/lst');
  });

  test('List Page - Test 1 : should search by Make, Model, Trim, and Price', async () => {
    // Direct access to objects - automatically uses desktop or mobile!
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
    
    // Get test data from JSON file
    const searchCriteria = testData.listPage.Test1;
    console.log('Using test data:', searchCriteria);
    
    // These methods will automatically call desktop or mobile versions
      await listPageActions.fillLocation(
        FilterType.Location,
        searchCriteria.location,
        RadiusType.FiftyKm
      );

    await listPageActions.selectMakeModelTrimFilter(
      searchCriteria.make, 
      searchCriteria.model, 
      searchCriteria.trim
    );
    
    await listPageActions.fillPrice(
      searchCriteria.priceFrom, 
      searchCriteria.priceTo
    );
    
    // await listPageActions.clickSeeResultsButton();
    
    const resultsCount = await listPageActions.getResultsCount();
    expect(resultsCount.success).toBe(true);
    expect(resultsCount.data).toBeGreaterThan(0);
  });

  test('List Page - Test 2 : search by Make, Model on list page and go to detail page', async () => {    
    // Direct access to objects - automatically uses desktop or mobile!
    console.log(`Testing on: ${context.language} ${context.device} ${context.browser}`);
    
    // Get test data from JSON file
    const searchCriteria = testData.listPage.Test2;
    console.log('Using test data:', searchCriteria);

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
  })
  
});