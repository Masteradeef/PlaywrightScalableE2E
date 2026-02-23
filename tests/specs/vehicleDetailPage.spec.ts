import { test, expect } from '@playwright/test';
import { ActionProxy } from '../../src/actions/ActionProxy';
import { ProjectContextManager, getLangData, getTestData } from '../../src/utils/config/project-context';
import { CookieHelper } from '../../src/utils/helpers/cookieHelper';
import { DesktopSharedActions } from '../../src/actions/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../src/actions/mobile/mobile.shared.actions';
import { DesktopVehicleDetailPageActions } from '../../src/actions/desktop/desktop.vehicleDetailPage.actions';
import { MobileVehicleDetailPageActions } from '../../src/actions/mobile/mobile.vehicleDetailPage.actions';
import { DesktopFavouritesPageActions } from '../../src/actions/desktop/desktop.favouritesPage.actions';
import { MobileFavouritesPageActions } from '../../src/actions/mobile/mobile.favouritesPage.actions';
import { DesktopAfterLeadPageActions } from '../../src/actions/desktop/desktop.afterLeadPage.actions';
import { MobileAfterLeadPageActions } from '../../src/actions/mobile/mobile.afterLeadPage.actions';
import { DesktopListPageActions } from '../../src/actions/desktop/desktop.listPage.actions';
import { MobileListPageActions } from '../../src/actions/mobile/mobile.listPage.actions';
import { FavouriteAction } from '../../src/actions/base/base.vehicleDetailPage.actions';
import testDataRaw from '../data/test-data.json';
import { createNetworkInterception } from '../../src/utils/networkInterception';
import { cleanInbox, waitForMessage, getHTMLMessage, getTextMessage, MailtrapConfig, getDealerMessageId, getRawMessage, getHTMLMessageDealer, getRawMessageDealer, getTextMessageDealer, getDealerMessageIdByName } from '../../src/utils/emailClients/mailtrap';
import { Language, PageType, FilterType, RadiusType } from '../../src/utils/types/project.types';

const testData = structuredClone(testDataRaw);

// Get language from project context - will be initialized in beforeAll
let language: Language;

let vehicleDetailPageActions: DesktopVehicleDetailPageActions | MobileVehicleDetailPageActions;
let sharedActions: DesktopSharedActions | MobileSharedActions;
let favouritesPageActions: DesktopFavouritesPageActions | MobileFavouritesPageActions;
let afterLeadPageActions: DesktopAfterLeadPageActions | MobileAfterLeadPageActions;
let listPageActions: DesktopListPageActions | MobileListPageActions;
let context: any;
let cookieHelper: CookieHelper;

test.describe('Vehicle Detail Page Tests - Logged-in User', () => {

  test.beforeAll(async ({}, workerInfo) => {
    // Initialize context for device detection (one time setup)
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();
  });

  test.beforeEach(async ({ page }) => {
    // Initialize cookie helper
    cookieHelper = new CookieHelper(page);
    
    // Add cookies before test starts
    await cookieHelper.addAllCommonCookies();
    
    // Create smart proxies that automatically use desktop or mobile implementations
    vehicleDetailPageActions = ActionProxy.createActions(page, PageType.VehicleDetailPage);
    sharedActions = ActionProxy.createActions(page, PageType.Shared);
    favouritesPageActions = ActionProxy.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = ActionProxy.createActions(page, PageType.AfterLeadPage);
    
    // Navigate to home page and sign in
    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(testData.credentials.username, testData.credentials.password);
    
    // Navigate to favourites and clean up
    await sharedActions.clickFavouritesIcon();
    await favouritesPageActions.cleanUpFavourites(getTestData(testData.submitLead).emptyFavouritesText);
  });

  test.afterEach(async () => {
    // Clean up favourites after test
    const isTextLikeLead = /text lead|xyz lead/i.test(test.info().title);
    if (isTextLikeLead) {
      await sharedActions.clickFavouritesIcon();
      await favouritesPageActions.cleanUpFavourites(getTestData(testData.submitLead).emptyFavouritesText);
    }
  });

  test('Detail Page - Test 1: should submit a General Inquiry sales lead by clicking Send Email button on Vehicle Detail Page', async ({ page, request }, testInfo) => {
    test.setTimeout(480_000);
    
    // Mailtrap configuration
    const consumerMailtrap: MailtrapConfig = {
      apiToken: process.env.MAILTRAP_API_TOKEN!,
      accountId: process.env.MAILTRAP_ACCOUNT_ID!,
      inboxId: getTestData(testData.saleLead).consumerInboxId
    };

    const dealerMailtrap: MailtrapConfig = {
      apiToken: process.env.MAILTRAP_API_TOKEN!,
      accountId: process.env.MAILTRAP_ACCOUNT_ID!,
      inboxId: getTestData(testData.saleLead).dealerInboxId
    };

    // Clean inboxes before test
    try {
      await cleanInbox(consumerMailtrap);
      console.log('Consumer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean consumer inbox:', error);
    }
    
    try {
      await cleanInbox(dealerMailtrap);
      console.log('Dealer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean dealer inbox:', error);
    }

    const runId = `${Math.floor(Math.random() * 900) + 100}`;
    const consumerEmail = `${getTestData(testData.saleLead).consumerUserId}${runId}${getTestData(testData.saleLead).domain}`;
    const dealerEmail = getTestData(testData.saleLead).dealerEmailAddress;
    console.log(`Using consumer email address: ${consumerEmail}`);

    await sharedActions.navigateToUrl(getTestData(testData.saleLead).url);
    
    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();
    
    const currentTime = new Date(Date.now()).toISOString(); // UTC timestamp
    console.log(`Current UTC time for dealer message filtering: ${currentTime}`);

    await vehicleDetailPageActions.submitGeneralInquiryLead(
      getTestData(testData.saleLead).name,
      consumerEmail,
      getTestData(testData.saleLead).phone
    );
    
    expect(await afterLeadPageActions.getSuccessMessageText(), 'Success message title should match expected text').toEqual(getTestData(testData.saleLead).successMessageTitle);
    
    // Check if success message body contains the dynamic email address
    const actualSuccessMessageBody = await afterLeadPageActions.getSuccessMessageBodyText();
    const expectedConsumerMessageBody = getTestData(testData.saleLead).successMessageBody1 + consumerEmail + getTestData(testData.saleLead).successMessageBody2;
    expect(actualSuccessMessageBody, `Success message body should match expected text with dynamic email. Expected pattern: "${expectedConsumerMessageBody}". Actual: "${actualSuccessMessageBody}"`).toEqual(expectedConsumerMessageBody);
    
    // Verify that /SaleLead API was called
    console.log(`API Endpoint being checked: "${getTestData(testData.saleLead).endPoint}"`);
    const saleLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.saleLead).endPoint);
    expect(saleLeadResponses.length, 'At least one /SaleLead API call should have been made').toBeGreaterThan(0);
    expect(saleLeadResponses[0].status, 'First /SaleLead API call should return status 200').toBe(200);
    console.log('/SaleLead API call verified.');
    console.log(`Looking for email sent to: ${consumerEmail}`);

    // Wait for consumer email using the simplified approach with email address
    const consumerMessage = await waitForMessage(
      consumerMailtrap,
      consumerEmail,
      getTestData(testData.saleLead).subject,
      { timeoutMs: 420_000 }
    );
    
    console.log(`Found consumer email: emailAddress=${consumerEmail}, subject="${consumerMessage.subject}"`);
    
    expect.soft(consumerMessage.subject, `Consumer email subject should contain "${getTestData(testData.saleLead).subject}". Actual: "${consumerMessage.subject}"`).toContain(getTestData(testData.saleLead).subject);
    expect.soft(consumerMessage.from_email, `Consumer email sender should contain "${getTestData(testData.saleLead).fromEmail}". Actual: "${consumerMessage.from_email}"`).toContain(getTestData(testData.saleLead).fromEmail);
    
    // Get HTML message content for verification
    const consumerEmailBody = await getHTMLMessage(consumerMailtrap, consumerEmail, getTestData(testData.saleLead).subject);
    
    // Verify email body content
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body1}".`).toContain(getTestData(testData.saleLead).body1);
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body2}".`).toMatch(new RegExp(getTestData(testData.saleLead).body2));
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body3}".`).toMatch(new RegExp(getTestData(testData.saleLead).body3));
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body4}".`).toContain(getTestData(testData.saleLead).body4);

    const consumerTextBody = await getTextMessage(consumerMailtrap, consumerEmail, getTestData(testData.saleLead).subject);
    expect.soft(consumerTextBody, `Email text body should contain "${getTestData(testData.saleLead).consumerTextEmailMessage}". Actual content: "${consumerTextBody}"`).toContain(getTestData(testData.saleLead).consumerTextEmailMessage);
    console.log('Consumer email is received and verified');

    const dealerMessageId = await getDealerMessageId(dealerMailtrap, dealerEmail, consumerEmail, getTestData(testData.saleLead).dealerEmailSubject, currentTime, { timeoutMs: 420_000 });

    if (!dealerMessageId) {
      throw new Error(`No dealer message found for email: ${dealerEmail} with Reply-To: ${consumerEmail} and subject: "${getTestData(testData.saleLead).dealerEmailSubject}" after ${currentTime}`);
    }
    
    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have From email "${getTestData(testData.saleLead).fromEmail}".`).toContain(getTestData(testData.saleLead).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have To email "${getTestData(testData.saleLead).dealerEmailAddress}".`).toContain(getTestData(testData.saleLead).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have Subject "${getTestData(testData.saleLead).dealerEmailSubject}".`).toContain(getTestData(testData.saleLead).dealerEmailSubject);

    // Get HTML message content for verification
    const dealerEmailBody = await getHTMLMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.saleLead).dealerEmailBody1}".`).toContain(getTestData(testData.saleLead).dealerEmailBody1);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain Name "${getTestData(testData.saleLead).name}".`).toContain(getTestData(testData.saleLead).name);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${consumerEmail}".`).toContain(consumerEmail);

    const dealerTextBody = await getTextMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerTextBody, `Dealer Email text body should contain "${getTestData(testData.saleLead).consumerTextEmailMessage}". Actual content: "${dealerTextBody}"`).toContain(getTestData(testData.saleLead).consumerTextEmailMessage);
    console.log('Dealer email is received and verified');
  });

  test('Detail Page - Test 2: should submit a General Inquiry sales lead from Dealer Info Section on Vehicle Detail Page', async ({ page }) => {
    await sharedActions.navigateToUrl(getTestData(testData.submitLead).url);
    
    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();
    
    await vehicleDetailPageActions.submitDealerInfoSectionLead(
      getTestData(testData.submitLead).name,
      getTestData(testData.submitLead).email,
      getTestData(testData.submitLead).phone
    );
    
    // Verify success message
    expect(await afterLeadPageActions.getSuccessMessageText()).toEqual(getTestData(testData.submitLead).successMessageTitle);
    expect(await afterLeadPageActions.getSuccessMessageBodyText()).toEqual(getTestData(testData.submitLead).successMessageBody);
    
    // Verify that /SaleLead API was called
    const saleLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.submitLead).saleLead);
    expect(saleLeadResponses.length).toBeGreaterThan(0);
    expect(saleLeadResponses[0].status).toBe(200);
  });

  test('Detail Page - Test 3: should see favourite listing on My Account Favourites page', async () => {
    await sharedActions.navigateToUrl(getTestData(testData.submitLead).url);
    await vehicleDetailPageActions.addOrRemoveFavourite(FavouriteAction.Add);
    
    const vehicleTitle = (await vehicleDetailPageActions.getVehicleTitleText()) || getTestData(testData.submitLead).makeModel;
    const dealerName = (await vehicleDetailPageActions.getDealerNameText()) || getTestData(testData.submitLead).dealer;
    
    await sharedActions.clickFavouritesIcon();
    expect(await favouritesPageActions.isListingDisplayedInFavourite(vehicleTitle!, dealerName!)).toBe(true);
  });
});

test.describe('Vehicle Detail Page Tests - Desktop Only', () => {
  test.beforeAll(async ({}, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    if (!workerInfo.project.name.includes('Desktop')) {
      test.skip(true, 'Desktop-only suite');
    }
  });

  test.beforeEach(async ({ page }) => {
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();
    
    vehicleDetailPageActions = ActionProxy.createActions(page, PageType.VehicleDetailPage);
    sharedActions = ActionProxy.createActions(page, PageType.Shared);
    favouritesPageActions = ActionProxy.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = ActionProxy.createActions(page, PageType.AfterLeadPage);
    
    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(testData.credentials.username, testData.credentials.password);
    await sharedActions.clickFavouritesIcon();
    await favouritesPageActions.cleanUpFavourites(getTestData(testData.submitLead).emptyFavouritesText);
  });

  test.afterEach(async () => {
    await sharedActions.clickFavouritesIcon();
    await favouritesPageActions.cleanUpFavourites(getTestData(testData.submitLead).emptyFavouritesText);
  });

  test('Detail Page - Test 4: should submit a General Inquiry sales lead by clicking Contact Seller button on Vehicle Detail Page on Desktop', async ({ page }) => {
    await sharedActions.navigateToUrl(getTestData(testData.submitLead).url);
    
    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();
    
    const desktopActions = vehicleDetailPageActions as DesktopVehicleDetailPageActions;
    await desktopActions.submitContactSellerLead(
      getTestData(testData.submitLead).name,
      getTestData(testData.submitLead).email,
      getTestData(testData.submitLead).phone
    );
    
    // Verify success message
    expect(await afterLeadPageActions.getSuccessMessageText()).toEqual(getTestData(testData.submitLead).successMessageTitle);
    expect(await afterLeadPageActions.getSuccessMessageBodyText()).toEqual(getTestData(testData.submitLead).successMessageBody);
    
    // Verify that /SaleLead API was called
    const saleLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.submitLead).saleLead);
    expect(saleLeadResponses.length).toBeGreaterThan(0);
    expect(saleLeadResponses[0].status).toBe(200);
  });

  test('Detail Page - Test 5: should submit a Sales Lead from Gallery on Vehicle Detail Page', async ({ page, request }, testInfo) => {
    test.setTimeout(480_000);
    
    // Mailtrap configuration
    const consumerMailtrap: MailtrapConfig = {
      apiToken: process.env.MAILTRAP_API_TOKEN!,
      accountId: process.env.MAILTRAP_ACCOUNT_ID!,
      inboxId: getTestData(testData.saleLead).consumerInboxId
    };

    const dealerMailtrap: MailtrapConfig = {
      apiToken: process.env.MAILTRAP_API_TOKEN!,
      accountId: process.env.MAILTRAP_ACCOUNT_ID!,
      inboxId: getTestData(testData.saleLead).dealerInboxId
    };

    // Clean inboxes before test
    try {
      await cleanInbox(consumerMailtrap);
      console.log('Consumer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean consumer inbox:', error);
    }
    
    try {
      await cleanInbox(dealerMailtrap);
      console.log('Dealer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean dealer inbox:', error);
    }

    const runId = `${Math.floor(Math.random() * 900) + 100}`;
    const consumerEmail = `${getTestData(testData.saleLead).consumerUserId}${runId}${getTestData(testData.saleLead).domain}`;
    const dealerEmail = getTestData(testData.saleLead).dealerEmailAddress;
    console.log(`Using consumer email address: ${consumerEmail}`);

    await sharedActions.navigateToUrl(getTestData(testData.saleLead).url);
    
    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();
    
    const currentTime = new Date(Date.now()).toISOString(); // UTC timestamp
    console.log(`Current UTC time for dealer message filtering: ${currentTime}`);

    const desktopActions = vehicleDetailPageActions as DesktopVehicleDetailPageActions;
    await desktopActions.submitGalleryLead(
      getTestData(testData.saleLead).name,
      consumerEmail,
      getTestData(testData.saleLead).phone
    );
    
    expect(await afterLeadPageActions.getSuccessMessageText(), 'Success message title should match expected text').toEqual(getTestData(testData.saleLead).successMessageTitle);
    
    // Check if success message body contains the dynamic email address
    const actualSuccessMessageBody = await afterLeadPageActions.getSuccessMessageBodyText();
    const expectedConsumerMessageBody = getTestData(testData.saleLead).successMessageBody1 + consumerEmail + getTestData(testData.saleLead).successMessageBody2;
    expect(actualSuccessMessageBody, `Success message body should match expected text with dynamic email. Expected pattern: "${expectedConsumerMessageBody}". Actual: "${actualSuccessMessageBody}"`).toEqual(expectedConsumerMessageBody);
    
    // Verify that /SaleLead API was called
    console.log(`API Endpoint being checked: "${getTestData(testData.saleLead).endPoint}"`);
    const saleLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.saleLead).endPoint);
    expect(saleLeadResponses.length, 'At least one /SaleLead API call should have been made').toBeGreaterThan(0);
    expect(saleLeadResponses[0].status, 'First /SaleLead API call should return status 200').toBe(200);
    console.log('/SaleLead API call verified.');
    console.log(`Looking for email sent to: ${consumerEmail}`);

    // Wait for consumer email using the simplified approach with email address
    const consumerMessage = await waitForMessage(
      consumerMailtrap,
      consumerEmail,
      getTestData(testData.saleLead).subject,
      { timeoutMs: 420_000 }
    );
    
    console.log(`Found consumer email: emailAddress=${consumerEmail}, subject="${consumerMessage.subject}"`);
    
    expect.soft(consumerMessage.subject, `Consumer email subject should contain "${getTestData(testData.saleLead).subject}". Actual: "${consumerMessage.subject}"`).toContain(getTestData(testData.saleLead).subject);
    expect.soft(consumerMessage.from_email, `Consumer email sender should contain "${getTestData(testData.saleLead).fromEmail}". Actual: "${consumerMessage.from_email}"`).toContain(getTestData(testData.saleLead).fromEmail);
    
    // Get HTML message content for verification
    const consumerEmailBody = await getHTMLMessage(consumerMailtrap, consumerEmail, getTestData(testData.saleLead).subject);
    
    // Verify email body content
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body1}".`).toContain(getTestData(testData.saleLead).body1);
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body2}".`).toMatch(new RegExp(getTestData(testData.saleLead).body2));
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body3}".`).toMatch(new RegExp(getTestData(testData.saleLead).body3));
    expect.soft(consumerEmailBody, `Consumer Email template does not contain "${getTestData(testData.saleLead).body4}".`).toContain(getTestData(testData.saleLead).body4);

    const consumerTextBody = await getTextMessage(consumerMailtrap, consumerEmail, getTestData(testData.saleLead).subject);
    expect.soft(consumerTextBody, `Email text body should contain "${getTestData(testData.saleLead).consumerTextEmailMessage}". Actual content: "${consumerTextBody}"`).toContain(getTestData(testData.saleLead).consumerTextEmailMessage);
    console.log('Consumer email is received and verified');

    const dealerMessageId = await getDealerMessageId(dealerMailtrap, dealerEmail, consumerEmail, getTestData(testData.saleLead).dealerEmailSubject, currentTime, { timeoutMs: 420_000 });

    if (!dealerMessageId) {
      throw new Error(`No dealer message found for email: ${dealerEmail} with Reply-To: ${consumerEmail} and subject: "${getTestData(testData.saleLead).dealerEmailSubject}" after ${currentTime}`);
    }
    
    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have From email "${getTestData(testData.saleLead).fromEmail}".`).toContain(getTestData(testData.saleLead).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have To email "${getTestData(testData.saleLead).dealerEmailAddress}".`).toContain(getTestData(testData.saleLead).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have Subject "${getTestData(testData.saleLead).dealerEmailSubject}".`).toContain(getTestData(testData.saleLead).dealerEmailSubject);

    // Get HTML message content for verification
    const dealerEmailBody = await getHTMLMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.saleLead).dealerEmailBody1}".`).toContain(getTestData(testData.saleLead).dealerEmailBody1);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain Name "${getTestData(testData.saleLead).name}".`).toContain(getTestData(testData.saleLead).name);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${consumerEmail}".`).toContain(consumerEmail);

    const dealerTextBody = await getTextMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerTextBody, `Dealer Email text body should contain "${getTestData(testData.saleLead).consumerTextEmailMessage}". Actual content: "${dealerTextBody}"`).toContain(getTestData(testData.saleLead).consumerTextEmailMessage);
    console.log('Dealer email is received and verified');
  });
});

test.describe('Vehicle Detail Page Tests - Anonymous User', () => {
  test.beforeAll(async ({}, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();
  });

  test.beforeEach(async ({ page }) => {
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();
    
    vehicleDetailPageActions = ActionProxy.createActions(page, PageType.VehicleDetailPage);
    sharedActions = ActionProxy.createActions(page, PageType.Shared);
    favouritesPageActions = ActionProxy.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = ActionProxy.createActions(page, PageType.AfterLeadPage);
    listPageActions = ActionProxy.createActions(page, PageType.ListPage);
    
    await sharedActions.navigateToUrl('/');
  });

  test('Detail Page - Test 6: should submit Request for CARFAX History Report from Vehicle Detail Page', async ({ page }) => {
    test.setTimeout(480_000);
    
    const dealerMailtrap: MailtrapConfig = {
      apiToken: process.env.MAILTRAP_API_TOKEN!,
      accountId: process.env.MAILTRAP_ACCOUNT_ID!,
      inboxId: getTestData(testData.carfax).dealerInboxId
    };

    try {
      await cleanInbox(dealerMailtrap);
      console.log('Dealer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean dealer inbox:', error);
    }

    const runId = `${Math.floor(Math.random() * 900) + 100}`;
    const consumerEmail = `${getTestData(testData.carfax).consumerUserId}${runId}${getTestData(testData.carfax).domain}`;
    const dealerEmail = getTestData(testData.carfax).dealerEmailAddress;

    await sharedActions.navigateToUrl(getTestData(testData.carfax).url);
    await vehicleDetailPageActions.clickRequestCARFAXHistoryReportLink();
    const currentTime = new Date(Date.now()).toISOString(); // UTC timestamp

    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();

    await vehicleDetailPageActions.fillNameInput(getTestData(testData.carfax).name);
    await vehicleDetailPageActions.fillEmailInput(consumerEmail);
    await vehicleDetailPageActions.clickEmailReportButton();
    
    expect(await vehicleDetailPageActions.getCARFAXSuccessMessageText()).toEqual(getTestData(testData.carfax).successMessage);
    expect(await vehicleDetailPageActions.isCloseButtonOnCARFAXHistoryReportVisible()).toBe(true);
    expect(await vehicleDetailPageActions.isBackToListingButtonOnCARFAXHistoryReportVisible()).toBe(true);

    // Verify that /CarFaxSalesLead API was called
    console.log(`API Endpoint being checked: "${getTestData(testData.carfax).endPoint}"`);
    const carfaxLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.carfax).endPoint);
    expect(carfaxLeadResponses.length, 'At least one /CarFaxSalesLead API call should have been made').toBeGreaterThan(0);
    expect(carfaxLeadResponses[0].status, 'First /CarFaxSalesLead API call should return status 200').toBe(200);
    console.log('/CarFaxSalesLead API call verified.');

    // Verify dealer email receipt    
    console.log(`Current UTC time for dealer message filtering: ${currentTime}`);
    const dealerMessageId = await getDealerMessageId(dealerMailtrap, dealerEmail, consumerEmail, getTestData(testData.carfax).dealerEmailSubject, currentTime, { timeoutMs: 420_000 });

    if (!dealerMessageId) {
      throw new Error(`No dealer message found for email: ${dealerEmail} with Reply-To: ${consumerEmail} and subject: "${getTestData(testData.carfax).dealerEmailSubject}" after ${currentTime}`);
    }

    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have From email "${getTestData(testData.carfax).fromEmail}".`).toContain(getTestData(testData.carfax).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have To email "${getTestData(testData.carfax).dealerEmailAddress}".`).toContain(getTestData(testData.carfax).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have Subject "${getTestData(testData.carfax).dealerEmailSubject}".`).toContain(getTestData(testData.carfax).dealerEmailSubject);
    
    // Get HTML message content for verification
    const dealerEmailBody = await getHTMLMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    const dealerEmailBody2 = `${getTestData(testData.carfax).dealerEmailBody2}${consumerEmail}, .`;
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody1}".`).toContain(getTestData(testData.carfax).dealerEmailBody1);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${dealerEmailBody2}".`).toContain(dealerEmailBody2);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody3}".`).toContain(getTestData(testData.carfax).dealerEmailBody3);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody4}".`).toContain(getTestData(testData.carfax).dealerEmailBody4);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody5}".`).toContain(getTestData(testData.carfax).dealerEmailBody5);
    console.log('Dealer email is received and verified');
  });

  test('Detail Page - Test 7: should see Price of the vehicle on Vehicle Detail Page', async () => {
    await sharedActions.navigateToUrl(getTestData(testData.submitLead).url);
    const priceText = await vehicleDetailPageActions.getVehiclePriceText();
    
    expect(priceText).not.toBe(null);
    expect(priceText).not.toBe('');
    expect(priceText?.trim()).not.toBe('');
  });

  test('Detail Page - Test 8: should see View Similar Listing section (Recommender) on Vehicle Detail Page', async () => {
    const similarListings = getLangData(testData.similarListings);
    const listingsToCheck = [
      similarListings.listing1,
      similarListings.listing2,
      similarListings.listing3,
      similarListings.listing4,
      similarListings.listing5
    ];
    
    const hasViewSimilarListings = await vehicleDetailPageActions.isViewSimilarListingsSectionVisible(listingsToCheck);
    expect(hasViewSimilarListings).toBe(true);
  });

  for (const c of testData.detailPage.Test9) {
    test(`Detail Page - Test 9: should verify CPO on Detail Page - ${c.make} ${c.model}`, async ({ page }) => {
      await sharedActions.navigateToUrl(c.listPageURL);
      await listPageActions.fillLocation(FilterType.Location, c.location, RadiusType.HundredKm);
      await listPageActions.selectMakeModelTrimFilter(c.make, c.model);
      await page.waitForTimeout(2000);
      
      await listPageActions.fillVehicleCondition('Certified pre-owned');
      await page.waitForTimeout(2000);
      
      await listPageActions.clickOnFirstListing(10000);
      
      const certifiedPreOwnedText = await vehicleDetailPageActions.getcertifiedPreOwnedPillText();
      expect(certifiedPreOwnedText).toBe('Certified pre-owned');

      // Handling new tab or new window when Learn more is clicked
      const popupPromise = page.waitForEvent('popup').catch(() => null);
      
      await vehicleDetailPageActions.clickLearnMoreButton();
      
      const newPage = await popupPromise;
      if (newPage) {
        await newPage.waitForLoadState('domcontentloaded');
        await expect(newPage).toHaveURL(new RegExp(getLangData(testData.CPOPage).url));
      } else {
        await expect(page).toHaveURL(new RegExp(getLangData(testData.CPOPage).url));
      }
      console.log('Learn more opened:', newPage ? newPage.url() : page.url());
    });
  }
});

test.describe('Vehicle Detail Page Tests - Mobile Only', () => {
  test.beforeAll(async ({}, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    if (!workerInfo.project.name.includes('iPhone') && !workerInfo.project.name.includes('mobile')) {
      test.skip(true, 'Mobile-only suite');
    }
  });

  test.beforeEach(async ({ page }) => {
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();
    
    vehicleDetailPageActions = ActionProxy.createActions(page, PageType.VehicleDetailPage);
    sharedActions = ActionProxy.createActions(page, PageType.Shared);
    favouritesPageActions = ActionProxy.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = ActionProxy.createActions(page, PageType.AfterLeadPage);
    
    await sharedActions.navigateToUrl('/');
  });

  test.afterEach(async ({}, testInfo) => {
    const isTargetLead = testInfo.title;
    if (!isTargetLead.includes('Text lead')) {
      await sharedActions.clickFavouritesIcon();
      await favouritesPageActions.cleanUpFavourites(getTestData(testData.submitLead).emptyFavouritesText);
    }
  });

  test('Detail Page - Test 10: should submit Text lead by clicking on Text button on Vehicle Detail Page in Mobile', async ({ page }) => {
    test.setTimeout(600_000);
    
    const dealerMailtrap: MailtrapConfig = {
      apiToken: process.env.MAILTRAP_API_TOKEN!,
      accountId: process.env.MAILTRAP_ACCOUNT_ID!,
      inboxId: getTestData(testData.textLead).dealerInboxId
    };

    try {
      await cleanInbox(dealerMailtrap);
      console.log('Dealer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean dealer inbox:', error);
    }

    const runId = `${Math.floor(Math.random() * 900) + 100}`;
    const consumerName = `${getTestData(testData.textLead).name}${runId}`;
    const dealerEmail = getTestData(testData.textLead).dealerEmailAddress;
    
    await sharedActions.navigateToUrl(getTestData(testData.textLead).url);
    const currentTime = new Date(Date.now()).toISOString(); // UTC timestamp
    
    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();
    
    const mobileActions = vehicleDetailPageActions as MobileVehicleDetailPageActions;
    await mobileActions.submitTextLead(
      consumerName,
      getTestData(testData.textLead).phone
    );
    
    expect(await afterLeadPageActions.getSuccessMessageText()).toEqual(getTestData(testData.textLead).successMessageSMSBody);
    
    // Verify that /TextSeller API was called
    const textLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.textLead).endPoint);
    expect(textLeadResponses.length).toBeGreaterThan(0);
    expect(textLeadResponses[0].status).toBe(200);
    console.log(`${getTestData(testData.textLead).endPoint} API call verified.`);

    // Verify dealer email receipt    
    console.log(`Current UTC time for dealer message filtering: ${currentTime}`);
    const dealerMessageId = await getDealerMessageIdByName(dealerMailtrap, dealerEmail, consumerName, getTestData(testData.textLead).dealerEmailSubject, currentTime, { timeoutMs: 540_000 });

    if (!dealerMessageId) {
      throw new Error(`No dealer message found for email: ${dealerEmail} with Name: ${consumerName} and subject: "${getTestData(testData.textLead).dealerEmailSubject}" after ${currentTime}`);
    }

    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Text Lead Email does not have From email "${getTestData(testData.textLead).fromEmail}".`).toContain(getTestData(testData.textLead).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Text Lead Email does not have To email "${getTestData(testData.textLead).dealerEmailAddress}".`).toContain(getTestData(testData.textLead).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Text Lead Email does not have Subject "${getTestData(testData.textLead).dealerEmailSubject}".`).toContain(getTestData(testData.textLead).dealerEmailSubject);
    
    // Get HTML message content for verification
    const dealerEmailBody = await getHTMLMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Title "${getTestData(testData.textLead).dealerEmailTitle}".`).toContain(getTestData(testData.textLead).dealerEmailTitle);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Consumer Name "${getTestData(testData.textLead).name}".`).toContain(getTestData(testData.textLead).name);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Consumer Phone Number "${getTestData(testData.textLead).phone}".`).toContain(getTestData(testData.textLead).phone);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Consumer Message "${getTestData(testData.textLead).dealerEmailMessage}".`).toContain(getTestData(testData.textLead).dealerEmailMessage);
    
    const dealerTextBody = await getTextMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerTextBody, `Dealer Text Lead Email text body should contain "${getTestData(testData.textLead).dealerEmailMessage}". Actual content: "${dealerTextBody}"`).toContain(getTestData(testData.textLead).dealerEmailMessage);
    console.log('Dealer Text Lead Email is received and verified');
  });

  test('Detail Page - Test 11: should click on button and get Phone number on Vehicle Detail Page in Mobile', async () => {
    await sharedActions.navigateToUrl(getTestData(testData.submitLead).url);
    
    expect(await vehicleDetailPageActions.isCallButtonClickable()).toBe(true);
    await vehicleDetailPageActions.clickCallButton();
    expect(await vehicleDetailPageActions.getCallButtonPhoneNumber()).toEqual(getTestData(testData.submitLead).dealerPhoneNumber);
  });
});



