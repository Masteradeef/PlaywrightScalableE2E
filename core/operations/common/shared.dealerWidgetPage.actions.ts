import { BestContactTimeType, ICOQuestionnaireAnswerType, InteriorExteriorDamageType, SellTimeframeType, TyreConditionType, YesNoType } from '../../helpers/definitions/project.types';
import { BaseDealerWebsiteWidgetPageLocators } from '../../selectors/common/shared.dealerWebsiteWidgetPage.locators';
import { Page } from '@playwright/test';
import { BaseActions } from './SharedActions';
import { BaseAfterLeadPageLocators } from '../../selectors/common/shared.afterLeadPage.locators';

export abstract class BaseDealerWebsiteWidgetPageActions extends BaseActions {
  protected dealerWebsiteWidgetPageLocators: BaseDealerWebsiteWidgetPageLocators;
  protected page: Page;

  constructor(dealerWebsiteWidgetPageLocators: BaseDealerWebsiteWidgetPageLocators, page: Page) {
    super();
    this.dealerWebsiteWidgetPageLocators = dealerWebsiteWidgetPageLocators;
    this.page = page;
  }

  // #region Functions for both Desktop and Mobile

  async clickCarDetailsTab(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.carDetailsTab().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.carDetailsTab().click({ timeout: 10000 });
      },
      'Successfully clicked car details tab',
      'Failed to click car details tab'
    );
  };
  
  async selectYear(year: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.yearDropdown().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.yearDropdown().selectOption(year);
      },
      `Successfully selected year: ${year}`,
      `Failed to select year: ${year}`
    );
  }

  async selectMake(make: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.makeDropdown().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.makeDropdown().selectOption(make);
      },
      `Successfully selected make: ${make}`,
      `Failed to select make: ${make}`
    );
  }

  async selectModel(model: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.modelDropdown().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.modelDropdown().selectOption(model);
      },
      `Successfully selected model: ${model}`,
      `Failed to select model: ${model}`
    );
  }

  async selectTrim(trim: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Wait for trim dropdown to be enabled and have options loaded
        await this.dealerWebsiteWidgetPageLocators.trimDropdown().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.trimDropdown().selectOption(trim);
      },
      `Successfully selected trim: ${trim}`,
      `Failed to select trim: ${trim}`
    );
  }

  async selectColor(color: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.colorSpan(color).waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.colorSpan(color).click();
      },
      `Successfully selected color: ${color}`,
      `Failed to select color: ${color}`
    );
  }

  async selectOption(option: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const optionLocator = this.dealerWebsiteWidgetPageLocators.selectOptions(option);
        await optionLocator.waitFor({ state: 'visible', timeout: 10000 });
        await optionLocator.click();
      },
      `Successfully selected option: ${option}`,
      `Failed to select option: ${option}`
    );
  }

  async enterKilometers(kilometers: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.kilometersInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.kilometersInput().fill(kilometers);
      },
      `Successfully entered kilometers: ${kilometers}`,
      `Failed to enter kilometers: ${kilometers}`
    );
  }

  async enterPostalCode(postalCode: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.postalCodeInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.postalCodeInput().fill(postalCode);
      },
      `Successfully entered postal code: ${postalCode}`,
      `Failed to enter postal code: ${postalCode}`
    );
  }

  async answerQuestionnaire(question: ICOQuestionnaireAnswerType, answer: YesNoType | InteriorExteriorDamageType | TyreConditionType | SellTimeframeType | BestContactTimeType): Promise<this> {
  return this.handleAsyncChainable(
    async () => {
      // Ensure all questions are visible
      const frame = this.page.frameLocator('#icoFrame');
      await frame.locator('body').evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(500);

      switch (question) {
        case ICOQuestionnaireAnswerType.AreYouTheOriginalOwner:
        case ICOQuestionnaireAnswerType.AreYouStillMakingPaymentsOnYourVehicle: 
        case ICOQuestionnaireAnswerType.AreYouInterestedInBuyingAReplacementVehicle:
        case ICOQuestionnaireAnswerType.WasYourCarEverInAnAccident:
        case ICOQuestionnaireAnswerType.DoesYourCarHaveABadHistoryReport:
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyMechanicalIssues:
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyIlluminatedWarningLights:
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyModifications:
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyOdors:
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyOtherIssues: {
          const locator = this.dealerWebsiteWidgetPageLocators.answerQuestionnaire(question, answer);
          await locator.waitFor({ state: 'visible', timeout: 10000 });
          await locator.click();
          break;
        }
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyExistingExteriorDamage: 
        case ICOQuestionnaireAnswerType.DoesYourCarHaveAnyExistingInteriorDamage:
        case ICOQuestionnaireAnswerType.WhatIsTheConditionOfYourCarsFrontTires:
        case ICOQuestionnaireAnswerType.WhatIsTheConditionOfYourCarsRearTires:
        case ICOQuestionnaireAnswerType.WhenDoPlanToSellYourVehicle:
        case ICOQuestionnaireAnswerType.BestTimeToContactMe:{
          const selectLocator = this.dealerWebsiteWidgetPageLocators.answerQuestionnaire(question, answer).locator('xpath=..');
          await selectLocator.waitFor({ state: 'visible', timeout: 10000 });
          const optionValue = await this.dealerWebsiteWidgetPageLocators.answerQuestionnaire(question, answer).getAttribute('value');
          await selectLocator.selectOption({ value: optionValue! });
          break;
      
        }
        default:
          throw new Error(`Unknown question type: ${question}`);
      }
      
      await this.page.waitForTimeout(500);
    },
    `Successfully answered question "${question}" with "${answer}"`,
    `Failed to answer question "${question}" with "${answer}"`
  );
}

  async clickNextVehicleDetailsButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.nextVehicleDetailsButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.nextVehicleDetailsButton().click();
      },
      'Successfully clicked Next: Vehicle\'s Details button',
      'Failed to click Next: Vehicle\'s Details button'
    );
  }

  async clickNextYourInformationButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.nextYourInformationButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.nextYourInformationButton().click();
      },
      'Successfully clicked Next: Your Information button',
      'Failed to click Next: Your Information button'
    );
  }

  async clickNextYourVehiclesConditionButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.nextVehicleConditionButton().waitFor({ state: 'visible', timeout: 10000 });        await this.dealerWebsiteWidgetPageLocators.nextVehicleConditionButton().scrollIntoViewIfNeeded();        await this.dealerWebsiteWidgetPageLocators.nextVehicleConditionButton().click();
      },
      'Successfully clicked Next: Your Vehicle\'s Condition button',
      'Failed to click Next: Your Vehicle\'s Condition button'
    );
  }

  async enterFirstName(firstName: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.firstNameInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.firstNameInput().fill(firstName);
      },
      `Successfully entered first name: ${firstName}`,
      `Failed to enter first name: ${firstName}`
    );
  }

  async enterLastName(lastName: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.lastNameInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.lastNameInput().fill(lastName);
      },
      `Successfully entered last name: ${lastName}`,
      `Failed to enter last name: ${lastName}`
    );
  }

  async enterCellPhone(cellPhone: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.cellPhoneInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.cellPhoneInput().fill(cellPhone);
      },
      `Successfully entered cell phone: ${cellPhone}`,
      `Failed to enter cell phone: ${cellPhone}`
    );
  }

  async enterEmailAddress(email: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.emailAddressInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.emailAddressInput().fill(email);
      },
      `Successfully entered email address: ${email}`,
      `Failed to enter email address: ${email}`
    );
  }

  async checkTermsConditions(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.termsAndConditionsCheckbox().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.termsAndConditionsCheckbox().check({ force: true });
      },
      'Successfully checked Terms & Conditions checkbox',
      'Failed to check Terms & Conditions checkbox'
    );
  }

  async clickGetYourValueButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.dealerWebsiteWidgetPageLocators.getYourValueButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.dealerWebsiteWidgetPageLocators.getYourValueButton().click();
      },
      'Successfully clicked Get Your Value button',
      'Failed to click Get Your Value button'
    );
  }

  async getMakeModelTrimFromOfferDial(): Promise<string> {
    await this.dealerWebsiteWidgetPageLocators.offerDial().waitFor({ state: 'visible', timeout: 10000 });
    const text = await this.dealerWebsiteWidgetPageLocators.offerDial().innerText();
    console.log(`Successfully retrieved make, model, and trim from offer dial: ${text}`);
    return text;
  }

  async getOfferPrice(): Promise<string> {
  const text = await this.dealerWebsiteWidgetPageLocators.offerPrice().textContent();
  return text?.trim() ?? '';
}
  // #endregion
}














