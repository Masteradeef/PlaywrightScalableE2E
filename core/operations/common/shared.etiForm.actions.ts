import { VINMakeAndModelTabType, PaintConditionType, BodyWorkMechanicalConditionType, HasYourCarEverBeenInAnAccidentType } from '../../helpers/definitions/project.types';
import { BaseETIFormLocators } from '../../selectors/common/shared.etiForm.locators';
import { Page } from '@playwright/test';
import { BaseActions } from './SharedActions';

export interface ETIFormData {
  // Step 1: Vehicle Selection
  tab: VINMakeAndModelTabType;
  vin?: string;           // Required when tab is VIN
  make?: string;          // Required when tab is MakeAndModel
  model?: string;         // Required when tab is MakeAndModel
  year?: string;          // Required when tab is MakeAndModel
  trim: string;
  // Step 2: Vehicle Condition
  paintCondition: PaintConditionType;
  bodyWorkMechanicalCondition: BodyWorkMechanicalConditionType;
  hasYourCarEverBeenInAnAccident: HasYourCarEverBeenInAnAccidentType;
  kilometers: string;  
  // Step 3: Contact Information
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  location: string;
}

export abstract class BaseETIFormActions extends BaseActions {
  protected etiFormLocators: BaseETIFormLocators;
  protected page: Page;

  constructor(etiFormLocators: BaseETIFormLocators, page: Page) {
    super();
    this.etiFormLocators = etiFormLocators;
    this.page = page;
  }

  async clickTab(tab: VINMakeAndModelTabType): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.clickTab(tab).waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.clickTab(tab).click({ timeout: 10000 });
      },
      `Successfully clicked ${tab} tab`,
      `Failed to click ${tab} tab`
    );
  }

  async fillVinInput(vin: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.vinInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.vinInput().fill(vin);
      },
      `Successfully entered VIN: ${vin}`,
      `Failed to enter VIN: ${vin}`
    );
  }

  async selectMake(make: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.makeDropdownInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.makeDropdownInput().click();
        // Wait for dropdown options to load before typing to filter
        await this.etiFormLocators.makeDropdownOptions().first().waitFor({ state: 'visible', timeout: 15000 });
        await this.etiFormLocators.makeDropdownInput().fill(make);
        await this.etiFormLocators.makeDropdownOptions(make).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.makeDropdownOptions(make).first().click({ timeout: 10000 });
      },
      `Successfully selected make: ${make}`,
      `Failed to select make: ${make}`
    );
  }

  async selectModel(model: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // click() waits for actionability including enabled state
        await this.etiFormLocators.modelDropdownInput().click({ timeout: 15000 });
        // Wait for dropdown options to load before typing to filter
        await this.etiFormLocators.modelDropdownOptions().first().waitFor({ state: 'visible', timeout: 15000 });
        await this.etiFormLocators.modelDropdownInput().fill(model);
        await this.etiFormLocators.modelDropdownOptions(model).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.modelDropdownOptions(model).first().click({ timeout: 10000 });
      },
      `Successfully selected model: ${model}`,
      `Failed to select model: ${model}`
    );
  }

  async selectYear(year: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // click() waits for actionability including enabled state
        await this.etiFormLocators.yearDropdownInput().click({ timeout: 15000 });
        // Wait for dropdown options to load before typing to filter
        await this.etiFormLocators.yearDropdownOptions().first().waitFor({ state: 'visible', timeout: 15000 });
        await this.etiFormLocators.yearDropdownInput().fill(year);
        await this.etiFormLocators.yearDropdownOptions(year).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.yearDropdownOptions(year).first().click({ timeout: 10000 });
      },
      `Successfully selected year: ${year}`,
      `Failed to select year: ${year}`
    );
  }

  async selectTrim(trim: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // click() waits for actionability including enabled state
        await this.etiFormLocators.trimDropdownInput().click({ timeout: 15000 });
        // Wait for dropdown options to load before typing to filter
        await this.etiFormLocators.trimDropdownOptions().first().waitFor({ state: 'visible', timeout: 15000 });
        await this.etiFormLocators.trimDropdownInput().fill(trim);
        await this.etiFormLocators.trimDropdownOptions(trim).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.trimDropdownOptions(trim).first().click({ timeout: 10000 });
      },
      `Successfully selected trim: ${trim}`,
      `Failed to select trim: ${trim}`
    );
  }

  async selectPaintCondition(condition: PaintConditionType): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.paintConditionDropdownButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.paintConditionDropdownButton().click({ timeout: 10000 });
        await this.etiFormLocators.paintConditionDropdownOptions(condition).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.paintConditionDropdownOptions(condition).first().click({ timeout: 10000 });
      },
      `Successfully selected paint condition: ${condition}`,
      `Failed to select paint condition: ${condition}`
    );
  }

  async selectBodyWorkMechanicalCondition(condition: BodyWorkMechanicalConditionType): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.bodyWorkMechanicalConditionDropdownButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.bodyWorkMechanicalConditionDropdownButton().click({ timeout: 10000 });
        await this.etiFormLocators.bodyWorkMechanicalConditionDropdownOptions(condition).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.bodyWorkMechanicalConditionDropdownOptions(condition).first().click({ timeout: 10000 });
      },
      `Successfully selected bodywork/mechanical condition: ${condition}`,
      `Failed to select bodywork/mechanical condition: ${condition}`
    );
  }

  async selectHasYourCarEverBeenInAnAccident(answer: HasYourCarEverBeenInAnAccidentType): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.hasYourCarEverBeenInAnAccidentDropdownButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.hasYourCarEverBeenInAnAccidentDropdownButton().click({ timeout: 10000 });
        await this.etiFormLocators.hasYourCarEverBeenInAnAccidentDropdownOptions(answer).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.hasYourCarEverBeenInAnAccidentDropdownOptions(answer).first().click({ timeout: 10000 });
      },
      `Successfully selected accident answer: ${answer}`,
      `Failed to select accident answer: ${answer}`
    );
  }

  async fillKilometers(kilometers: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.kilometersInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.kilometersInput().fill(kilometers);
      },
      `Successfully entered kilometers: ${kilometers}`,
      `Failed to enter kilometers: ${kilometers}`
    );
  }

  async clickContinueButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.continueButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.continueButton().click({ timeout: 10000 });
      },
      'Successfully clicked Continue button',
      'Failed to click Continue button'
    );
  }

  async fillFullName(fullName: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.fullNameInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.fullNameInput().fill(fullName);
      },
      `Successfully entered full name: ${fullName}`,
      `Failed to enter full name: ${fullName}`
    );
  }

  async fillPhoneNumber(phoneNumber: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.phoneNumberInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.phoneNumberInput().fill(phoneNumber);
      },
      `Successfully entered phone number: ${phoneNumber}`,
      `Failed to enter phone number: ${phoneNumber}`
    );
  }

  async fillEmailAddress(email: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.emailInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.emailInput().fill(email);
      },
      `Successfully entered email address: ${email}`,
      `Failed to enter email address: ${email}`
    );
  }

  async fillPostalCode(postalCode: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.postalCodeInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.postalCodeInput().fill(postalCode);
      },
      `Successfully entered postal code: ${postalCode}`,
      `Failed to enter postal code: ${postalCode}`
    );
  }

  async checkTermsAndConditions(check: boolean = true): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.termsAndConditionsInput().waitFor({ state: 'visible', timeout: 10000 });
        if (check) {
          await this.etiFormLocators.termsAndConditionsInput().check({ timeout: 10000 });
        } else {
          await this.etiFormLocators.termsAndConditionsInput().uncheck({ timeout: 10000 });
        }
      },
      `Successfully ${check ? 'checked' : 'unchecked'} Terms & Conditions checkbox`,
      `Failed to ${check ? 'check' : 'uncheck'} Terms & Conditions checkbox`
    );
  }

  async clickEditButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.editButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.editButton().click({ timeout: 10000 });
      },
      'Successfully clicked Edit button',
      'Failed to click Edit button'
    );
  }

  async clickCloseButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        await this.etiFormLocators.closeButton().waitFor({ state: 'visible', timeout: 10000 });
        await this.etiFormLocators.closeButton().click({ timeout: 10000 });
      },
      'Successfully clicked Close button',
      'Failed to click Close button'
    );
  }

  async getVehicleDetailsSummary(): Promise<string> {
    const text = await this.etiFormLocators.vehicleDetailsSummary().textContent({ timeout: 10000 });
    const summary = text?.trim() ?? '';
    console.log(`Vehicle details summary: ${summary}`);
    return summary;
  }

  async fillETIForm(data: ETIFormData): Promise<this> {
    await this.clickTab(data.tab);

    // Step 1: Vehicle Selection
    if (data.tab === VINMakeAndModelTabType.VIN) {
      if (!data.vin) throw new Error('VIN is required when using VIN tab');
      await this.fillVinInput(data.vin);      
    } else {
      if (!data.make || !data.model || !data.year) throw new Error('Make, Model, and Year are required when using Make & Model tab');
      await this.selectMake(data.make);
      await this.selectModel(data.model);
      await this.selectYear(data.year);            
    }

    await this.selectTrim(data.trim);
    await this.clickContinueButton();

    // Step 2: Vehicle Condition
    await this.selectPaintCondition(data.paintCondition);
    await this.selectBodyWorkMechanicalCondition(data.bodyWorkMechanicalCondition);
    await this.selectHasYourCarEverBeenInAnAccident(data.hasYourCarEverBeenInAnAccident);
    await this.fillKilometers(data.kilometers);    
    await this.clickContinueButton();

    // Step 3: Contact Information
    await this.fillFullName(data.fullName);
    await this.fillPhoneNumber(data.phoneNumber);
    await this.fillEmailAddress(data.emailAddress);
    await this.fillPostalCode(data.location);
    await this.checkTermsAndConditions();
    await this.clickContinueButton();

    console.log('Successfully filled ETI form');
    return this;
  }
}















