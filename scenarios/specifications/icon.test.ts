import { test, expect } from '@playwright/test';
import { OperationHandler } from '../../core/operations/OperationHandler';
import { ProjectContextManager, getTestData } from '../../core/helpers/settings/projectContext';
import { CookieHelper } from '../../core/helpers/utilities/cookieHelper';
import { 
  Language, 
  ICOQuestionnaireAnswerType, 
  YesNoType, 
  InteriorExteriorDamageType, 
  TyreConditionType, 
  SellTimeframeType, 
  BestContactTimeType,
  PageType 
} from '../../core/helpers/definitions/project.types';
import { BaseDealerWebsiteWidgetPageActions } from '../../core/operations/common/shared.dealerWidgetPage.actions';
import { DesktopDealerWebsiteWidgetPageActions } from '../../core/operations/desktop/desktop.dealerWebsiteWidgetPage.actions';
import { MobileDealerWebsiteWidgetPageActions } from '../../core/operations/mobile/mobile.dealerWebsiteWidgetPage.actions';
import testDataRaw from '../inputdata/testdata.json';
import { DesktopSharedActions } from '../../core/operations/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../core/operations/mobile/mobile.shared.actions';
import { waitForNetworkResponse } from '../../core/helpers/networkCapture';
import { cleanInbox, getDealerMessageId, getHTMLMessage, getHTMLMessageDealer, getRawMessageDealer, MailtrapConfig, waitForMessage } from '../../core/helpers/mailClients/mailtrap';

const testData = structuredClone(testDataRaw);

// Get language from project context - will be initialized in beforeAll
let language: Language;
let dealerWebsiteWidgetPageActions: BaseDealerWebsiteWidgetPageActions;
let context: any;
let cookieHelper: CookieHelper;
let sharedActions: DesktopSharedActions | MobileSharedActions;
let consumerMailtrap: MailtrapConfig;

test.describe('When a consumer sends DWW Lead ', () => {

  test.beforeAll(async ({}, workerInfo) => {
    // Initialize context for device detection
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    consumerMailtrap = {
        apiToken: process.env.MAILTRAP_API_TOKEN!,
        accountId: process.env.MAILTRAP_ACCOUNT_ID!,
        inboxId: getTestData(testData.ICO.Test1).consumerInboxId
    };
    
    // Clean inboxes before test
    try {
        await cleanInbox(consumerMailtrap);
        console.log('DWW Consumer inbox cleaned successfully');
    } catch (error) {
        console.warn('Failed to clean DWW consumer inbox:', error);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Initialize cookie helper
    cookieHelper = new CookieHelper(page);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);
    
    // Add cookies before test starts
    await cookieHelper.addAllCommonCookies();
    
    // Create smart proxy that automatically uses desktop or mobile implementation
    dealerWebsiteWidgetPageActions = OperationHandler.createActions(page, PageType.DealerWebsiteWidgetPage);
    
    // Navigate to ICO widget page (update with actual URL)
    const dealerEmail = getTestData(testData.ICO.Test1).url;
    await sharedActions.navigateToUrl(getTestData(testData.ICO.Test1).url);
  });

  test('DWW - Test 1: a consumer should receive a confirmation Email', async ({ page }) => {
    test.setTimeout(480_000); // 8 minutes timeout for this test due to email verification steps

    // Click on Car Details tab to start the process
    await dealerWebsiteWidgetPageActions.clickCarDetailsTab();
    
    // Fill Car details
    await dealerWebsiteWidgetPageActions.selectYear(getTestData(testData.ICO.Test1).year);
    await dealerWebsiteWidgetPageActions.selectMake(getTestData(testData.ICO.Test1).make);
    await dealerWebsiteWidgetPageActions.selectModel(getTestData(testData.ICO.Test1).model);
    await dealerWebsiteWidgetPageActions.selectTrim(getTestData(testData.ICO.Test1).trim);
    await dealerWebsiteWidgetPageActions.clickNextVehicleDetailsButton();

    // Enter Vehicle Details
    await dealerWebsiteWidgetPageActions.selectColor(getTestData(testData.ICO.Test1).color);
    await dealerWebsiteWidgetPageActions.selectOption(getTestData(testData.ICO.Test1).option1);
    await dealerWebsiteWidgetPageActions.enterKilometers(getTestData(testData.ICO.Test1).kilometers);
    await dealerWebsiteWidgetPageActions.enterPostalCode(getTestData(testData.ICO.Test1).postalCode);
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.AreYouTheOriginalOwner, 
      YesNoType.Yes
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.AreYouStillMakingPaymentsOnYourVehicle, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.AreYouInterestedInBuyingAReplacementVehicle, 
      YesNoType.No
    );

    await dealerWebsiteWidgetPageActions.clickNextYourVehiclesConditionButton();

    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.WasYourCarEverInAnAccident, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveABadHistoryReport, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyExistingExteriorDamage, 
      InteriorExteriorDamageType.None
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyExistingInteriorDamage, 
      InteriorExteriorDamageType.None
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.WhatIsTheConditionOfYourCarsFrontTires, 
      TyreConditionType.Excellent
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.WhatIsTheConditionOfYourCarsRearTires, 
      TyreConditionType.Good
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyMechanicalIssues, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyIlluminatedWarningLights, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyModifications, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyOdors, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.DoesYourCarHaveAnyOtherIssues, 
      YesNoType.No
    );
    await dealerWebsiteWidgetPageActions.clickNextYourInformationButton();
    
    // // Fill personal information
    await dealerWebsiteWidgetPageActions.enterFirstName(getTestData(testData.ICO.Test1).firstName);
    await dealerWebsiteWidgetPageActions.enterLastName(getTestData(testData.ICO.Test1).lastName);
    await dealerWebsiteWidgetPageActions.enterCellPhone(getTestData(testData.ICO.Test1).cellPhone);
    await dealerWebsiteWidgetPageActions.enterEmailAddress(getTestData(testData.ICO.Test1).emailAddress);
    
    // Answer contact preference
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.WhenDoPlanToSellYourVehicle, 
      SellTimeframeType.JustCurious
    );
    await dealerWebsiteWidgetPageActions.answerQuestionnaire(
      ICOQuestionnaireAnswerType.BestTimeToContactMe, 
      BestContactTimeType.Morning
    );
    await dealerWebsiteWidgetPageActions.checkTermsConditions();

    // Set up network listener before clicking Get Your Value button
    const tradeValueResponsePromise = waitForNetworkResponse(page, getTestData(testData.ICO.Test1).requestURL);
    await dealerWebsiteWidgetPageActions.clickGetYourValueButton();

    // Verify the trade value API was called with status 200
    const tradeValueResponse = await tradeValueResponsePromise;
    expect(tradeValueResponse.status(), `Expected trade value API to return 200 but got ${tradeValueResponse.status()}`).toBe(200);

    // Verify year, make, model, and trim on the offer dial
    const offerDialText = await dealerWebsiteWidgetPageActions.getMakeModelTrimFromOfferDial();
    const expectedYearMakeModel = `${getTestData(testData.ICO.Test1).year} ${getTestData(testData.ICO.Test1).make} ${getTestData(testData.ICO.Test1).model}`;
    const expectedTrim = `${getTestData(testData.ICO.Test1).trim}`;
    const expectedVehicle = `${expectedYearMakeModel} ${expectedTrim}`;    
    expect(offerDialText, `Expected offer dial to contain "${expectedVehicle}" but got "${offerDialText}"`).toContain(expectedVehicle);



    // Wait for consumer email using the simplified approach with email address
    const consumerMessage = await waitForMessage(
        consumerMailtrap,
        getTestData(testData.ICO.Test1).emailAddress,
        getTestData(testData.ICO.Test1).subject,
        { timeoutMs: 420_000 }
    );

    expect.soft(consumerMessage.subject, `Consumer email subject should contain "${getTestData(testData.ICO.Test1).subject}". Actual: "${consumerMessage.subject}"`).toContain(getTestData(testData.ICO.Test1).subject);
    expect.soft(consumerMessage.from_email, `Consumer email sender should contain "${getTestData(testData.ICO.Test1).fromEmail}". Actual: "${consumerMessage.from_email}"`).toContain(getTestData(testData.ICO.Test1).fromEmail);

    const consumerEmailBody = await getHTMLMessage(consumerMailtrap, getTestData(testData.ICO.Test1).emailAddress, getTestData(testData.ICO.Test1).subject);    
    const offerPrice = await dealerWebsiteWidgetPageActions.getOfferPrice();

    // Normalize whitespace (replace non-breaking spaces and other unicode spaces with regular spaces) for comparison
    const normalizeWhitespace = (str: string) => str.replace(/[\u00A0\u2007\u202F]/g, ' ');
    const normalizedEmailBody = normalizeWhitespace(consumerEmailBody);
    const normalizedOfferPrice = normalizeWhitespace(offerPrice);

    // Verify email body content
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain "${getTestData(testData.ICO.Test1).body1}".`).toContain(getTestData(testData.ICO.Test1).body1);
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain Name "${getTestData(testData.ICO.Test1).firstName}".`).toMatch(new RegExp(getTestData(testData.ICO.Test1).firstName));
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain "${getTestData(testData.ICO.Test1).body2}".`).toMatch(new RegExp(getTestData(testData.ICO.Test1).body2));
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain "${expectedYearMakeModel}".`).toMatch(new RegExp(expectedYearMakeModel));
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain "${expectedTrim}".`).toMatch(new RegExp(expectedTrim));    
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain offer price "${normalizedOfferPrice}".`).toContain(normalizedOfferPrice);
    expect.soft(normalizedEmailBody, `Consumer Email template does not contain "${getTestData(testData.ICO.Test1).dealerName}".`).toContain(getTestData(testData.ICO.Test1).dealerName);
  });
});

















