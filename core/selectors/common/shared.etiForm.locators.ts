// shared.afterLeadPage.locators.ts
import { Page } from '@playwright/test';
import { BodyWorkMechanicalConditionType, HasYourCarEverBeenInAnAccidentType, PaintConditionType, VINMakeAndModelTabType } from '../../helpers/definitions/project.types';

export abstract class BaseETIFormLocators {
  constructor(protected page: Page) {}

  //vinTab = () => this.page.getByRole('button', { name: /VIN|NIV/i });
  //makeAndModelTab = () => this.page.getByRole('button', { name: /Make & Model|Marque et modèle/i });

  clickTab = (tab: VINMakeAndModelTabType) => {
    return this.page.getByRole('button', { name: new RegExp(tab, 'i') });
  };

  vinInput = () => this.page.getByTestId('vinInput');

  makeDropdownInput = () => this.page.locator('input#psuf-vehicle-insertion-form-select-make');
  makeDropdownButton = () => this.page.locator('div[data-autosuggest="psuf-vehicle-insertion-form-select-make"]').locator('button');
  makeDropdownOptions = (name?: string) => {
    const options = this.page.locator('ul#psuf-vehicle-insertion-form-select-make-suggestions li');
    return name ? options.filter({ hasText: name }) : options;
  };

  modelDropdownInput = () => this.page.locator('input#psuf-vehicle-insertion-form-select-model');
  modelDropdownButton = () => this.page.locator('div[data-autosuggest="psuf-vehicle-insertion-form-select-model"]').locator('button');
  modelDropdownOptions = (name?: string) => {
    const options = this.page.locator('ul#psuf-vehicle-insertion-form-select-model-suggestions li');
    return name ? options.filter({ hasText: name }) : options;
  };

  yearDropdownInput = () => this.page.locator('input#psuf-vehicle-insertion-form-select-year');
  yearDropdownButton = () => this.page.locator('div[data-autosuggest="psuf-vehicle-insertion-form-select-year"]').locator('button');
  yearDropdownOptions = (name?: string) => {
    const options = this.page.locator('ul#psuf-vehicle-insertion-form-select-year-suggestions li');
    return name ? options.filter({ hasText: name }) : options;
  };

  trimDropdownInput = () => this.page.locator('input#psuf-vehicle-insertion-form-select-trim');
  trimDropdownButton = () => this.page.locator('div[data-autosuggest="psuf-vehicle-insertion-form-select-trim"]').locator('button');
  trimDropdownOptions = (name?: string) => {
    const options = this.page.locator('ul#psuf-vehicle-insertion-form-select-trim-suggestions li');
    return name ? options.filter({ hasText: name }) : options;
  };

  paintConditionDropdownInput = () => this.page.locator('button#paintCondition-input');
  paintConditionDropdownButton = () => this.page.locator('div[data-autosuggest="paintCondition-input"]').locator('button.input-icon-button');
  paintConditionDropdownOptions = (name?: PaintConditionType) => {
    const options = this.page.locator('ul#paintCondition-input-suggestions li');
    return name ? options.filter({ hasText: new RegExp(name, 'i') }) : options;
  };

  bodyWorkMechanicalConditionDropdownInput = () => this.page.locator('button#bodyworkCondition-input');
  bodyWorkMechanicalConditionDropdownButton = () => this.page.locator('div[data-autosuggest="bodyworkCondition-input"]').locator('button.input-icon-button');
  bodyWorkMechanicalConditionDropdownOptions = (name?: BodyWorkMechanicalConditionType) => {
    const options = this.page.locator('ul#bodyworkCondition-input-suggestions li');
    return name ? options.filter({ hasText: new RegExp(name, 'i') }) : options;
  };

  hasYourCarEverBeenInAnAccidentDropdownInput = () => this.page.locator('button#accidentInvolved-input');
  hasYourCarEverBeenInAnAccidentDropdownButton = () => this.page.locator('div[data-autosuggest="accidentInvolved-input"]').locator('button.input-icon-button');
  hasYourCarEverBeenInAnAccidentDropdownOptions = (name?: HasYourCarEverBeenInAnAccidentType) => {
    const options = this.page.locator('ul#accidentInvolved-input-suggestions li');
    return name ? options.filter({ hasText: new RegExp(name, 'i') }) : options;
  };

  kilometersInput = () => this.page.locator('input#mileage');
  continueButton = () => this.page.getByRole('button', { name: /Continue|Continuer/i });
  backButton = () => this.page.getByRole('button', { name: /Back|Retour/i });

  fullNameInput = () => this.page.locator('input#canda-contact-info-name');
  phoneNumberInput = () => this.page.locator('input#canda-contact-info-phone');
  emailInput = () => this.page.locator('input#canda-contact-info-email');
  postalCodeInput = () => this.page.locator('input#postalCode');
  termsAndConditionsInput = () => this.page.locator('input[data-testid="explicit-legal-consent"]');
  
  editButton = () => this.page.getByRole('button', { name: /Edit|Modifier/i });
  vehicleDetailsSummary = () => this.page.locator('div[class*="CanadaTradeInPriceEstimation_priceEstimationVehicleDetails"]');
  closeButton = () => this.page.getByLabel('close button');
}
















