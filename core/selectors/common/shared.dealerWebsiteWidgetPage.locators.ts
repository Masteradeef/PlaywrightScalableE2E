// shared.afterLeadPage.locators.ts
import { Page } from '@playwright/test';
import { BestContactTimeType, ICOQuestionnaireAnswerType, InteriorExteriorDamageType, SellTimeframeType, TyreConditionType, YesNoType } from '../../helpers/definitions/project.types';

export abstract class BaseDealerWebsiteWidgetPageLocators {
  constructor(protected page: Page) {}

  // #region Concrete locator shared across all DWW pages (EN-Desktop, EN-Mobile, FR-Desktop, FR-Mobile)  
  carDetailsTab = () => this.page.frameLocator('#icoFrame').locator('label[for="DRILLDOWN"]').or(
    this.page.frameLocator('#icoFrame').getByText(/Car Details|Détails de la voiture/i)
  );
  
  yearDropdown = () => this.page.frameLocator('#icoFrame').locator('select[id="year"]');
  yearDropdownOption = (option: string) => this.yearDropdown().locator(`option[value="${option}"]`);

  makeDropdown = () => this.page.frameLocator('#icoFrame').locator('select[id="make"]');
  makeDropdownOption = (option: string) => this.makeDropdown().locator(`option[value="${option}"]`);
  
  modelDropdown = () => this.page.frameLocator('#icoFrame').locator('select[id="model"]');
  modelDropdownOption = (option: string) => this.modelDropdown().locator(`option[value="${option}"]`);
  
  trimDropdown = () => this.page.frameLocator('#icoFrame').locator('select[id="trim"]');
  trimDropdownOption = (option: string) => this.trimDropdown().locator(`option[value="${option}"]`);
  
  nextVehicleDetailsButton = () => this.page.frameLocator('#icoFrame').getByRole('button', { name: /Go to next step|Next: Vehicle's Details|Étape suivante : Caractéristiques du véhicule/i });
  
  colorSpan = (color: string) => this.page.frameLocator('#icoFrame').locator('span').filter({ hasText: new RegExp(color, 'i') });
  selectOptions = (option: string) => this.page.frameLocator('#icoFrame').locator(`label:has-text("${option}")`).first();

  kilometersInput = () => this.page.frameLocator('#icoFrame').locator('input[id="condition-question-kilometers_mileage"]');
  postalCodeInput = () => this.page.frameLocator('#icoFrame').locator('input[id="condition-question-zipcode_postalcode"]');

  answerQuestionnaire = (question: ICOQuestionnaireAnswerType, answer: YesNoType | InteriorExteriorDamageType | TyreConditionType | SellTimeframeType | BestContactTimeType) => {
    switch (true) {
      case question === ICOQuestionnaireAnswerType.AreYouTheOriginalOwner:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-is_original_owner"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'))
      case question === ICOQuestionnaireAnswerType.AreYouStillMakingPaymentsOnYourVehicle:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-is_still_making_payments"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'))
      case question === ICOQuestionnaireAnswerType.AreYouInterestedInBuyingAReplacementVehicle:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-is_interested_in_replacement_vehicle"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));
      case question === ICOQuestionnaireAnswerType.WasYourCarEverInAnAccident:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-1001000"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));
      case question.includes('CARFAX'):
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-4003000"]')
          .locator('..')
          .getByRole('radio', { name: new RegExp(answer, 'i') });
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyMechanicalIssues:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-4007000"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyIlluminatedWarningLights:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-4008000"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));  
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyModifications:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-4009000"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyOdors:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-4010000"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyOtherIssues:
        return this.page.frameLocator('#icoFrame').locator('[data-test="condtionQuestion-4010001"]')
          .locator('..')
          .getByLabel(new RegExp(answer, 'i'));
      //Dropdown questions
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyExistingExteriorDamage:
        return this.page.frameLocator('#icoFrame').locator('select[id="condition-question-4004000"]')
          .locator('option').filter({ hasText: new RegExp(answer, 'i') })
      case question === ICOQuestionnaireAnswerType.DoesYourCarHaveAnyExistingInteriorDamage:
        return this.page.frameLocator('#icoFrame').locator('select[id="condition-question-4005000"]')
          .locator('option').filter({ hasText: new RegExp(answer, 'i') })
      case question === ICOQuestionnaireAnswerType.WhatIsTheConditionOfYourCarsFrontTires:
        return this.page.frameLocator('#icoFrame').locator('select[id="condition-question-4006000"]')
          .locator('option').filter({ hasText: new RegExp(answer, 'i') })
      case question === ICOQuestionnaireAnswerType.WhatIsTheConditionOfYourCarsRearTires:
        return this.page.frameLocator('#icoFrame').locator('select[id="condition-question-4006001"]')
          .locator('option').filter({ hasText: new RegExp(answer, 'i') })
      case question === ICOQuestionnaireAnswerType.WhenDoPlanToSellYourVehicle:
        return this.page.frameLocator('#icoFrame').locator('select[id="condition-question-current_vehicle_expected_sale_timeframe"]')
          .locator('option').filter({ hasText: new RegExp(answer.split('|').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') })
      case question === ICOQuestionnaireAnswerType.BestTimeToContactMe:
        return this.page.frameLocator('#icoFrame').locator('select[id="condition-question-preferred_time_to_contact"]')
          .locator('option').filter({ hasText: new RegExp(answer.split('|').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') })
      default:
        throw new Error(`No locator defined for question: ${question} and answer: ${answer}`);
    }
  };

  nextVehicleConditionButton = () => this.page.frameLocator('#icoFrame').getByRole('button', { name: /Go to next step|Next: Vehicle's Condition|Suivant : État de votre véhicule/i });
  nextYourInformationButton = () => this.page.frameLocator('#icoFrame').getByRole('button', { name: /Next: Your Information|Suivant : Vos informations|Next|Suivant|Your Information|Vos informations/i });
  firstNameInput = () => this.page.frameLocator('#icoFrame').getByLabel(/First Name|Prénom/i);
  lastNameInput = () => this.page.frameLocator('#icoFrame').getByLabel(/Last Name|Nom de famille/i);
  cellPhoneInput = () => this.page.frameLocator('#icoFrame').getByLabel(/Cell Phone|Téléphone/i);
  emailAddressInput = () => this.page.frameLocator('#icoFrame').getByLabel(/Email Address|Courrier/i);  
  termsAndConditionsCheckbox = () => this.page.frameLocator('#icoFrame').locator('input[data-test="condition-accept_autotrader_terms_and_conditions"]');
  getYourValueButton = () => this.page.frameLocator('#icoFrame').getByText(/Get Your Value|Obtenez votre valeur/i);
  offerDial = () => this.page.frameLocator('#icoFrame').locator('.dial-label');
  offerPrice = () => this.page.frameLocator('#icoFrame').locator('.price');
  // #endregion
}














