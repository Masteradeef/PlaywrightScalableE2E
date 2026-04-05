import { test, expect } from '@playwright/test';
import { OperationHandler } from '../../core/operations/OperationHandler';
import { ProjectContextManager, getLangData, getMobileTestData, getTestData } from '../../core/helpers/settings/projectContext';
import { CookieHelper } from '../../core/helpers/utilities/cookieHelper';
import { DesktopSharedActions } from '../../core/operations/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../core/operations/mobile/mobile.shared.actions';
import { DesktopVehicleDetailPageActions } from '../../core/operations/desktop/desktop.vehicleDetailPage.actions';
import { MobileVehicleDetailPageActions } from '../../core/operations/mobile/mobile.vehicleDetailPage.actions';
import { DesktopFavouritesPageActions } from '../../core/operations/desktop/desktop.favouritesPage.actions';
import { MobileFavouritesPageActions } from '../../core/operations/mobile/mobile.favouritesPage.actions';
import { DesktopAfterLeadPageActions } from '../../core/operations/desktop/desktop.afterLeadPage.actions';
import { MobileAfterLeadPageActions } from '../../core/operations/mobile/mobile.afterLeadPage.actions';
import { DesktopListPageActions } from '../../core/operations/desktop/desktop.listPage.actions';
import { MobileListPageActions } from '../../core/operations/mobile/mobile.listPage.actions';
import { DesktopETIFormActions } from '../../core/operations/desktop/desktop.etiForm.actions';
import { MobileETIFormActions } from '../../core/operations/mobile/mobile.etiForm.actions';
import { FavouriteAction } from '../../core/operations/common/shared.vehicleDetailPage.actions';
import { FilterType, RadiusType, VehicleConditionType, Language, PageType, VINMakeAndModelTabType, PaintConditionType, BodyWorkMechanicalConditionType, HasYourCarEverBeenInAnAccidentType, MarketplaceType } from '../../core/helpers/definitions/project.types';
import testDataRaw from '../inputdata/testdata.json';
import { createNetworkInterception, waitForNetworkResponse } from '../../core/helpers/networkCapture';
import { cleanInbox, waitForMessage, getHTMLMessage, getTextMessage, MailtrapConfig, getDealerMessageId, getRawMessage, getHTMLMessageDealer, getRawMessageDealer, getTextMessageDealer, getDealerMessageIdByName } from '../../core/helpers/mailClients/mailtrap';

const testData = structuredClone(testDataRaw);

// Get language from project context - will be initialized in beforeAll
let language: Language;

let vehicleDetailPageActions: DesktopVehicleDetailPageActions | MobileVehicleDetailPageActions;
let sharedActions: DesktopSharedActions | MobileSharedActions;
let favouritesPageActions: DesktopFavouritesPageActions | MobileFavouritesPageActions;
let afterLeadPageActions: DesktopAfterLeadPageActions | MobileAfterLeadPageActions;
let listPageActions: DesktopListPageActions | MobileListPageActions;
let etiFormActions: DesktopETIFormActions | MobileETIFormActions;
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
    vehicleDetailPageActions = OperationHandler.createActions(page, PageType.VehicleDetailPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    favouritesPageActions = OperationHandler.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = OperationHandler.createActions(page, PageType.AfterLeadPage);
    
    // Navigate to home page and sign in
    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(
      getTestData(testData.credentials).username,
      getTestData(testData.credentials).password
    );
    
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
      getTestData(testData.saleLead).mobile
    );
    
    expect(await afterLeadPageActions.getSuccessMessageText(), 'Success message title should match expected text').toContain(getTestData(testData.saleLead).successMessageTitle);
    
    // Check if success message body contains the dynamic email address
    const actualSuccessMessageBody = await afterLeadPageActions.getSuccessMessageBodyText();
    const expectedConsumerMessageBody = getTestData(testData.saleLead).successMessageBody1 + consumerEmail + getTestData(testData.saleLead).successMessageBody2;
    expect(actualSuccessMessageBody, `Success message body should match expected text with dynamic email. Expected pattern: "${expectedConsumerMessageBody}". Actual: "${actualSuccessMessageBody}"`).toContain(expectedConsumerMessageBody);
    
    // Verify that /SaleLead API was called
    console.log(`API Endpoint being checked: "${getTestData(testData.saleLead).endPoint}"`);
    const saleLeadResponses = networkInterception.getAllNetworkResponses(getTestData(testData.saleLead).endPoint);
    expect(saleLeadResponses.length, 'At least one /SaleLead API call should have been made').toBeGreaterThan(0);
    expect(saleLeadResponses[0].status, 'First /SaleLead API call should return status 200').toBe(200);
    console.log('/SaleLead API call verified.');

    // Log request headers of /SaleLead API call
    const saleLeadRequestHeaders = await saleLeadResponses[0].request.allHeaders();
    console.log(`/SaleLead API request headers:\n${JSON.stringify(saleLeadRequestHeaders, null, 2)}`);

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
    
    const dealerEmailSubject = context.type.includes('fr')
      ? "Important: client potentiel g=C3=A9n=C3=A9r=C3=A9 par AutoHebdo.net"
      : getTestData(testData.saleLead).dealerEmailSubject;

    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have From email "${getTestData(testData.saleLead).fromEmail}".`).toContain(getTestData(testData.saleLead).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have To email "${getTestData(testData.saleLead).dealerEmailAddress}".`).toContain(getTestData(testData.saleLead).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have Subject "${dealerEmailSubject}".`).toContain(dealerEmailSubject);

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
      getTestData(testData.submitLead).mobile
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
    
    const vehicleTitle = getTestData(testData.submitLead).makeModel;
    const dealerName = getTestData(testData.submitLead).dealer;
    
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

    if (!workerInfo.project.name.includes('desktop')) {
      test.skip(true, 'Desktop-only suite');
    }
  });

  test.beforeEach(async ({ page }) => {
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();
    
    vehicleDetailPageActions = OperationHandler.createActions(page, PageType.VehicleDetailPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    favouritesPageActions = OperationHandler.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = OperationHandler.createActions(page, PageType.AfterLeadPage);
    
    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(
      getTestData(testData.credentials).username,
      getTestData(testData.credentials).password
    );
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
      getTestData(testData.submitLead).mobile
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
      getTestData(testData.saleLead).mobile
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

    const dealerEmailSubject = context.type.includes('fr')
      ? "Important: client potentiel g=C3=A9n=C3=A9r=C3=A9 par AutoHebdo.net"
      : getTestData(testData.saleLead).dealerEmailSubject;
    
    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have From email "${getTestData(testData.saleLead).fromEmail}".`).toContain(getTestData(testData.saleLead).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have To email "${getTestData(testData.saleLead).dealerEmailAddress}".`).toContain(getTestData(testData.saleLead).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Email does not have Subject "${dealerEmailSubject}".`).toContain(dealerEmailSubject);

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
    
    vehicleDetailPageActions = OperationHandler.createActions(page, PageType.VehicleDetailPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    favouritesPageActions = OperationHandler.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = OperationHandler.createActions(page, PageType.AfterLeadPage);
    listPageActions = OperationHandler.createActions(page, PageType.ListPage);
    
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
    //expect.soft(rawDealerMessageBody, `Dealer Email does not have Subject "${getTestData(testData.carfax).dealerEmailSubject}".`).toContain(getTestData(testData.carfax).dealerEmailSubject);
    
    // Get HTML message content for verification
    const dealerEmailBody = await getHTMLMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    const dealerEmailBody2 = `${getTestData(testData.carfax).dealerEmailBody2}${consumerEmail},`;
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody1}".`).toContain(getTestData(testData.carfax).dealerEmailBody1);    
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${dealerEmailBody2}".`).toContain(dealerEmailBody2);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody3}".`).toContain(getTestData(testData.carfax).dealerEmailBody3);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody4}".`).toContain(getTestData(testData.carfax).dealerEmailBody4);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody5}".`).toContain(getTestData(testData.carfax).dealerEmailBody5);
    expect.soft(dealerEmailBody, `Dealer Email template does not contain "${getTestData(testData.carfax).dealerEmailBody6}".`).toContain(getTestData(testData.carfax).dealerEmailBody6);
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
      // Set timeout: 2 mins for desktop, 3 mins for mobile
      test.setTimeout(context.device === 'mobile' ? 180_000 : 120_000);
      
      await sharedActions.navigateToUrl(c.listPageURL);

      if (context.device === 'mobile') {
        await listPageActions.clickFiltersButton();
      }
      await listPageActions.fillLocation(FilterType.Location, c.location, RadiusType.HundredKm);
      await listPageActions.selectMakeModelTrimFilter(c.make, c.model);
      await page.waitForTimeout(2000);
      
      await listPageActions.fillVehicleCondition(VehicleConditionType.CertifiedPreOwned);
      await page.waitForTimeout(2000);
      
      await listPageActions.clickOnFirstListing(10000);
      
      const certifiedPreOwnedText = await vehicleDetailPageActions.getcertifiedPreOwnedPillText();
      expect(certifiedPreOwnedText).toMatch(/certified pre-owned|véhicule certifié/i);

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

    if (!workerInfo.project.name.includes('mobile')) {
      test.skip(true, 'Mobile-only suite');
    }
  });

  test.beforeEach(async ({ page }) => {
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();
    
    vehicleDetailPageActions = OperationHandler.createActions(page, PageType.VehicleDetailPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    favouritesPageActions = OperationHandler.createActions(page, PageType.FavouritesPage);
    afterLeadPageActions = OperationHandler.createActions(page, PageType.AfterLeadPage);
    
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
      inboxId: getMobileTestData(testData.textLead).dealerInboxId
    };

    try {
      await cleanInbox(dealerMailtrap);
      console.log('Dealer inbox cleaned successfully');
    } catch (error) {
      console.warn('Failed to clean dealer inbox:', error);
    }

    const runId = `${Math.floor(Math.random() * 900) + 100}`;
    const consumerName = `${getMobileTestData(testData.textLead).name}${runId}`;
    const dealerEmail = getMobileTestData(testData.textLead).dealerEmailAddress;
    
    await sharedActions.navigateToUrl(getMobileTestData(testData.textLead).url);
    const currentTime = new Date(Date.now()).toISOString(); // UTC timestamp
    
    // Initialize network interception to track API calls
    const networkInterception = createNetworkInterception(page);
    networkInterception.initializeNetworkListener();
    
    const mobileActions = vehicleDetailPageActions as MobileVehicleDetailPageActions;
    await mobileActions.submitTextLead(
      consumerName,
      getMobileTestData(testData.textLead).mobile
    );
    
    expect(await afterLeadPageActions.getSuccessMessageText()).toEqual(getMobileTestData(testData.textLead).successMessageSMSBody);
    
    // Verify that /TextSeller API was called
    const textLeadResponses = networkInterception.getAllNetworkResponses(getMobileTestData(testData.textLead).endPoint);
    expect(textLeadResponses.length).toBeGreaterThan(0);
    expect(textLeadResponses[0].status).toBe(200);
    console.log(`${getMobileTestData(testData.textLead).endPoint} API call verified.`);
    // Verify dealer email receipt    
    console.log(`Current UTC time for dealer message filtering: ${currentTime}`);
    const dealerMessageId = await getDealerMessageIdByName(dealerMailtrap, dealerEmail, consumerName, getMobileTestData(testData.textLead).dealerEmailSubject, currentTime, { timeoutMs: 540_000 });

    if (!dealerMessageId) {
      throw new Error(`No dealer message found for email: ${dealerEmail} with Name: ${consumerName} and subject: "${getMobileTestData(testData.textLead).dealerEmailSubject}" after ${currentTime}`);
    }

    const dealerEmailSubject = context.type.includes('fr')
      ? "Important: client potentiel g=C3=A9n=C3=A9r=C3=A9 par AutoHebdo.net"
      : getMobileTestData(testData.textLead).dealerEmailSubject;

    // Verify email body content
    const rawDealerMessageBody = await getRawMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(rawDealerMessageBody, `Dealer Text Lead Email does not have From email "${getMobileTestData(testData.textLead).fromEmail}".`).toContain(getMobileTestData(testData.textLead).fromEmail);
    expect.soft(rawDealerMessageBody, `Dealer Text Lead Email does not have To email "${getMobileTestData(testData.textLead).dealerEmailAddress}".`).toContain(getMobileTestData(testData.textLead).dealerEmailAddress);
    expect.soft(rawDealerMessageBody, `Dealer Text Lead Email does not have Subject "${dealerEmailSubject}".`).toContain(dealerEmailSubject);
    
    // Get HTML message content for verification
    const dealerEmailBody = await getHTMLMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Title "${getMobileTestData(testData.textLead).dealerEmailTitle}".`).toContain(getMobileTestData(testData.textLead).dealerEmailTitle);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Consumer Name "${getMobileTestData(testData.textLead).name}".`).toContain(getMobileTestData(testData.textLead).name);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Consumer Phone Number "${getMobileTestData(testData.textLead).mobile}".`).toContain(getMobileTestData(testData.textLead).mobile);
    expect.soft(dealerEmailBody, `Dealer Text Lead Email template does not contain Consumer Message "${getMobileTestData(testData.textLead).dealerEmailMessage}".`).toContain(getMobileTestData(testData.textLead).dealerEmailMessage);
    
    const dealerTextBody = await getTextMessageDealer(dealerMailtrap.accountId, dealerMailtrap.inboxId, dealerMessageId);
    expect.soft(dealerTextBody, `Dealer Text Lead Email text body should contain "${getMobileTestData(testData.textLead).dealerEmailMessage}". Actual content: "${dealerTextBody}"`).toContain(getMobileTestData(testData.textLead).dealerEmailMessage);
    console.log('Dealer Text Lead Email is received and verified');
  });

  test('Detail Page - Test 11: should click on button and get Phone number on Vehicle Detail Page in Mobile', async () => {
    await sharedActions.navigateToUrl(getTestData(testData.submitLead).url);    
    expect(await vehicleDetailPageActions.isCallButtonClickable()).toBe(true);
    await vehicleDetailPageActions.clickCallButton();    
    expect(await vehicleDetailPageActions.getCallButtonPhoneNumber()).toEqual(getTestData(testData.submitLead).dealerPhoneNumber);
    await vehicleDetailPageActions.clickCloseCallTheSellerButton();
  });
});

test.describe('ETI Tests - An Anonymous user', () => {
  test.describe.configure({ mode: 'serial' });
  let sharedPage: import('@playwright/test').Page;
  let priceEstimationResponse: import('@playwright/test').Response;
  let priceEstimationResponsePromise: Promise<import('@playwright/test').Response>;

  test.beforeAll(async ({ browser }, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    if (workerInfo.project.name.includes('mobile')) {
      test.skip(true, 'There is a bug for mWeb: https://autoscout24.atlassian.net/browse/ICO-924');
    }

    // Create a shared page for all tests in this describe block
    sharedPage = await browser.newPage();

    cookieHelper = new CookieHelper(sharedPage);
    await cookieHelper.addAllCommonCookies();

    vehicleDetailPageActions = OperationHandler.createActions(sharedPage, PageType.VehicleDetailPage);
    etiFormActions = OperationHandler.createActions(sharedPage, PageType.ETIForm);
    sharedActions = OperationHandler.createActions(sharedPage, PageType.Shared);
    favouritesPageActions = OperationHandler.createActions(sharedPage, PageType.FavouritesPage);
    afterLeadPageActions = OperationHandler.createActions(sharedPage, PageType.AfterLeadPage);

    await sharedActions.navigateToUrl(getTestData(testData.ETI.Test12).url);
    await vehicleDetailPageActions.clickAddVehicleDataButton();

    // Set up network listener before filling the form
    priceEstimationResponsePromise = waitForNetworkResponse(sharedPage, testData.ETI.requestURL);

    await etiFormActions.fillETIForm({
      tab: VINMakeAndModelTabType.MakeAndModel,
      make: getTestData(testData.ETI.Test12).make,
      model: getTestData(testData.ETI.Test12).model,
      year: getTestData(testData.ETI.Test12).year,
      trim: getTestData(testData.ETI.Test12).trim,
      paintCondition: PaintConditionType.LikeNew,
      bodyWorkMechanicalCondition: BodyWorkMechanicalConditionType.CompletelyDamageFree,
      hasYourCarEverBeenInAnAccident: HasYourCarEverBeenInAnAccidentType.No,
      kilometers: getTestData(testData.ETI.Test12).kilometers,
      fullName: getTestData(testData.ETI.Test12).fullName,
      phoneNumber: getTestData(testData.ETI.Test12).phoneNumber,
      emailAddress: getTestData(testData.ETI.Test12).emailAddress,
      location: getTestData(testData.ETI.Test12).location
    });

    priceEstimationResponse = await priceEstimationResponsePromise;
    console.log(`API Endpoint being checked: "${testData.ETI.requestURL}"`);
    console.log(`/price-estimation API status: ${priceEstimationResponse.status()}`);
  });

  test.afterAll(async () => {
    await sharedPage?.close();
  });

  test('Detail Page - Test 12: should get ETI estimate from Vehicle Detail Page', async () => {
    test.setTimeout(480_000);

    // Verify that /price-estimation API was called with status 200
    expect(priceEstimationResponse.status(), `Expected /price-estimation API to return 200 but got ${priceEstimationResponse.status()}`).toBe(200);
    console.log('/price-estimation API call verified.');

    expect(await etiFormActions.getVehicleDetailsSummary()).toContain(getTestData(testData.ETI.Test12).year);
    expect(await etiFormActions.getVehicleDetailsSummary()).toContain(getTestData(testData.ETI.Test12).make);
    expect(await etiFormActions.getVehicleDetailsSummary()).toContain(getTestData(testData.ETI.Test12).model);
    // Normalize whitespace/separators to handle locale differences (EN: "50,000", FR: "60 000")
    const summary = (await etiFormActions.getVehicleDetailsSummary()).replace(/[\s,.\u00A0\u202F]/g, '');
    expect(summary).toContain(getTestData(testData.ETI.Test12).kilometers);
    await etiFormActions.clickCloseButton();
  });

  test('Detail Page - Test 13: should edit ETI and get estimate from Vehicle Detail Page', async () => {
    test.setTimeout(480_000);

    vehicleDetailPageActions.clickEditETIButton();
    priceEstimationResponsePromise = waitForNetworkResponse(sharedPage, testData.ETI.requestURL);

    await etiFormActions.fillETIForm({
      tab: VINMakeAndModelTabType.MakeAndModel,
      make: getTestData(testData.ETI.Test13).make,
      model: getTestData(testData.ETI.Test13).model,
      year: getTestData(testData.ETI.Test13).year,
      trim: getTestData(testData.ETI.Test13).trim,
      paintCondition: PaintConditionType.LikeNew,
      bodyWorkMechanicalCondition: BodyWorkMechanicalConditionType.CompletelyDamageFree,
      hasYourCarEverBeenInAnAccident: HasYourCarEverBeenInAnAccidentType.No,
      kilometers: getTestData(testData.ETI.Test13).kilometers,
      fullName: getTestData(testData.ETI.Test13).fullName,
      phoneNumber: getTestData(testData.ETI.Test13).phoneNumber,
      emailAddress: getTestData(testData.ETI.Test13).emailAddress,
      location: getTestData(testData.ETI.Test13).location
    });

    priceEstimationResponse = await priceEstimationResponsePromise;
    console.log(`API Endpoint being checked: "${testData.ETI.requestURL}"`);
    console.log(`/price-estimation API status: ${priceEstimationResponse.status()}`);

    expect(await etiFormActions.getVehicleDetailsSummary()).toContain(getTestData(testData.ETI.Test13).year);
    expect(await etiFormActions.getVehicleDetailsSummary()).toContain(getTestData(testData.ETI.Test13).make);
    expect(await etiFormActions.getVehicleDetailsSummary()).toContain(getTestData(testData.ETI.Test13).model);
    // Normalize whitespace/separators to handle locale differences (EN: "50,000", FR: "60 000")
    const summary = (await etiFormActions.getVehicleDetailsSummary()).replace(/[\s,.\u00A0\u202F]/g, '');
    expect(summary).toContain(getTestData(testData.ETI.Test13).kilometers);
    await etiFormActions.clickCloseButton();
  });

  test('Detail Page - Test 14: should delete ETI from Vehicle Detail Page', async () => {
    test.setTimeout(480_000);
    
    vehicleDetailPageActions.clickDeleteETIButton();    
    expect(await vehicleDetailPageActions.isAddVehicleDataButtonVisible(), 'Add Vehicle Data button should be visible').toBe(true);
  });
});

test.describe('Reverse proxy tests', () => {
  test.beforeAll(async ({}, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();
  });

  test.beforeEach(async ({ page }) => {
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addCommonLegacyCookies();
    
    vehicleDetailPageActions = OperationHandler.createActions(page, PageType.VehicleDetailPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
  });

  test('Detail Page - Test 15 : Verify Detail page URL for legacy Trader users bucketed to OMP', async () => {
    test.setTimeout(context.device === 'mobile' ? 360_000 : 300_000);
    const projectContext = ProjectContextManager.getInstance();
    console.log(`Testing on: ${projectContext.getLanguage()} ${projectContext.getDevice()} ${projectContext.getBrowser()}`);

     // Get test data from JSON file
    const reverseProxyUrl = testData.detailPage.Test15;
    console.log('Using test data:', reverseProxyUrl.legacyDetailPageURL);

    await sharedActions.navigateToLegacyUrl(reverseProxyUrl.legacyDetailPageURL);
    expect(await sharedActions.checkMarketplaceExperience()).toBe(MarketplaceType.LegacyTrader);
    const currentUrl = await sharedActions.getCurrentUrl();
    console.log('Current URL:', currentUrl);

    // Get ngVdpModel data and retrieve foreignId from adBasicInfo
    const ngVdpModel = await sharedActions.getNgVdpModel();
    expect(ngVdpModel).not.toBeNull();
    const adBasicInfo = sharedActions.retrieveDatalayerNodeValue(ngVdpModel, 'adBasicInfo');
    expect(adBasicInfo).not.toBeNull();
    const foreignId = adBasicInfo?.foreignId;
    console.log('foreignId from adBasicInfo:', foreignId);
    expect(foreignId).toBeDefined();

    // Clear cookies and add common cookies again to simulate the user being bucketed to OMP after landing on legacy page
    await cookieHelper.clearAllCookies();
    await cookieHelper.addAllCommonCookies();

    // Navigate to the same legacy URL again after cookie reset
    await sharedActions.navigateToUrl(reverseProxyUrl.legacyDetailPageURL);

    // Verify 'omoptin' cookie is applied and 'om' cookie is not available
    const omoptinCookie = await cookieHelper.getCookie('omoptin');
    expect(omoptinCookie).toBeDefined();
    console.log('omoptin cookie verified:', omoptinCookie);
    
    const omCookie = await cookieHelper.getCookie('om');
    expect(omCookie).toBeUndefined();
    console.log('om cookie is not available as expected');

    //Verify that URL is same and user is seeing OMP experience after cookies are applied
    const urlAfterCookies = await sharedActions.getCurrentUrl();
    console.log('URL after cookies:', urlAfterCookies);
    expect(urlAfterCookies.data).toBe(currentUrl.data);
    expect(urlAfterCookies.data).toContain('/a/');
    expect(await sharedActions.checkMarketplaceExperience()).toBe(MarketplaceType.OneMarketplace)

    // Get dataLayer and verify trader_listing_id matches foreignId from legacy page (A.K.A. verify that same listing is loaded for One Marketplace experience)
    const dataLayer = await sharedActions.getDataLayer();
    await sharedActions.verifyDatalayerNodeValue(dataLayer, 'trader_listing_id', foreignId);
    console.log('trader_listing_id matches foreignId:', foreignId);
  });
});


















