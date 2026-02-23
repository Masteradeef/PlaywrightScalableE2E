import { test, expect } from '@playwright/test';
import { FilterType, Language, PageType } from '../../src/utils/types/project.types';
import { ActionProxy } from '../../src/actions/ActionProxy';
import { ProjectContextManager } from '../../src/utils/config/project-context';
import { CookieHelper } from '../../src/utils/helpers/cookieHelper';
import { DesktopHomePageActions } from '../../src/actions/desktop/desktop.homePage.actions';
import { MobileHomePageActions } from '../../src/actions/mobile/mobile.homePage.actions';
import { DesktopListPageActions } from '../../src/actions/desktop/desktop.listPage.actions';
import { MobileListPageActions } from '../../src/actions/mobile/mobile.listPage.actions';
import { DesktopSharedActions } from '../../src/actions/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../src/actions/mobile/mobile.shared.actions';
import testDataRaw from '../data/test-data.json';

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
    homePageActions = ActionProxy.createActions(page, PageType.HomePage);
    listPageActions = ActionProxy.createActions(page, PageType.ListPage);
    sharedActions = ActionProxy.createActions(page, PageType.Shared);
    
    // Navigate to home page
    await sharedActions.navigateToUrl('/');
  });

  test('Home Page - Test 1 : should search vehicle by Make, Model, and Postal Code From Home Page', async () => {
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
});
