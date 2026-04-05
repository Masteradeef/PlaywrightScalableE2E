import { CAndRCheckboxType, CAndRColorType, CAndRDropdownType, CAndRQuestionnaireType, CAndRTextInputType, ListingTabType, UnknownYesNoType } from '../../helpers/definitions/project.types';
import { BaseMLCPageLocators } from '../../selectors/common/shared.mlcPage.locators';
import { Page } from '@playwright/test';
import { BaseActions } from './SharedActions';

export abstract class BaseMLCPageActions extends BaseActions {
  protected mlcPageLocators: BaseMLCPageLocators;
  protected page: Page;

  constructor(mlcPageLocators: BaseMLCPageLocators, page: Page) {
    super();
    this.mlcPageLocators = mlcPageLocators;
    this.page = page;
  }

  async selectFromDropDown(dropdown: CAndRDropdownType, option: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        //const dropdown = dropdownLabel.includes('|') ? dropdownLabel.split('|')[0] : dropdownLabel;        
        
        // Use locator methods for dropdown container
        const autosuggestContainer = this.mlcPageLocators.dropdownContainer(dropdown);
        await autosuggestContainer.waitFor({ state: 'visible', timeout: 10000 });
        
        // Scroll dropdown into view before interaction
        await autosuggestContainer.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
        await this.page.waitForTimeout(500); // Brief pause after scrolling
        
        // Auto-detect interaction type using locator methods
        const inputElement = this.mlcPageLocators.dropdownInput(dropdown);
        const buttonElement = this.mlcPageLocators.dropdownButton(dropdown);
        
        const inputCount = await inputElement.count();
        const buttonCount = await buttonElement.count();
        
        // Click the appropriate interactive element to open dropdown
        if (inputCount > 0) {
          await inputElement.click({ force: true });
        } else if (buttonCount > 0) {
          await buttonElement.click({ force: true });
        } else {
          throw new Error(`No interactive element found in ${dropdown} dropdown`);
        }
        
        // Wait for dropdown options to appear
        await this.page.waitForTimeout(500);
        
        // Find and click the option using locator method
        const optionElement = this.mlcPageLocators.dropdownOption(dropdown, option);
        await optionElement.waitFor({ state: 'visible', timeout: 5000 });
        await optionElement.click();
        
        // Wait for selection to complete
        await this.page.waitForTimeout(500);
      },
      `Successfully selected option: ${option} from ${dropdown}`,
      `Failed to select option: ${option} from ${dropdown}`
    );
  }

  async enterInput(label: CAndRTextInputType,  input: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const inputLocator = this.mlcPageLocators.inputByLabel(label);
        await inputLocator.waitFor({ state: 'visible', timeout: 10000 });
        if (label === CAndRTextInputType.PostalCode) {
          await inputLocator.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
          await this.page.waitForTimeout(500);
          await inputLocator.clear();
          await inputLocator.pressSequentially(input, { delay: 100 });
          await this.page.waitForTimeout(1500);
          await inputLocator.press('Enter');
        } else {
          await inputLocator.fill(input);
        }
      },
      `Successfully entered ${label}: ${input}`,
      `Failed to enter ${label}: ${input}`
    );
  }

  async checkCheckbox(label: CAndRCheckboxType, bool: boolean): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const checkboxLocator = this.mlcPageLocators.checkboxByLabel(label);
        await checkboxLocator.waitFor({ state: 'visible', timeout: 10000 });
        await checkboxLocator.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
        await this.page.waitForTimeout(300);
        if (bool) {
          await checkboxLocator.check({ force: true });
        } else {
          await checkboxLocator.uncheck({ force: true });
        }
      },
      `Successfully ${bool ? 'checked' : 'unchecked'} ${label} checkbox`,
      `Failed to ${bool ? 'check' : 'uncheck'} ${label} checkbox`
    );
  }

  async selectColor(colorType: CAndRColorType, color: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const colorLocator = this.mlcPageLocators.selectColorByLabel(colorType, color);
        await colorLocator.waitFor({ state: 'visible', timeout: 10000 });
        await colorLocator.click();
      },
      `Successfully selected color: ${color}`,
      `Failed to select color: ${color}`
    );
  }

  async fillDescription(description: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const descriptionLocator = this.mlcPageLocators.descriptionTextBox();
        await descriptionLocator.waitFor({ state: 'visible', timeout: 10000 });
        
        // Try different approaches based on element type
        try {
          // First try the standard fill method (works for textarea and most inputs)
          await descriptionLocator.fill(description);
        } catch (error) {
          // If fill fails, try contenteditable approach
          await descriptionLocator.click();
          await descriptionLocator.clear();
          await descriptionLocator.type(description);
        }
      },
      `Successfully filled description: ${description}`,
      `Failed to fill description`
    );
  }

  async selectRadioButton(vehicleCondition: CAndRQuestionnaireType, answer: UnknownYesNoType): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const radioButtonLocator = this.mlcPageLocators.vehicleConditionRadioButton(vehicleCondition, answer);
        await radioButtonLocator.waitFor({ state: 'visible', timeout: 10000 });
        await radioButtonLocator.click();
      },
      `Successfully selected radio button: ${answer}`,
      `Failed to select radio button: ${answer}`
    );
  }

  async populateFormFields(formData: {
    dropdowns?: Array<{ field: CAndRDropdownType; value: string }>;
    inputs?: Array<{ field: CAndRTextInputType; value: string }>;
    checkboxes?: Array<{ field: CAndRCheckboxType; value: boolean }>;
    colors?: Array<{ field: CAndRColorType; value: string }>;
    radioButtons?: Array<{ field: CAndRQuestionnaireType; value: UnknownYesNoType }>;
  }): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Handle dropdown selections
        if (formData.dropdowns) {
          for (const dropdown of formData.dropdowns) {
            await this.selectFromDropDown(dropdown.field, dropdown.value);
          }
        }

        // Handle text inputs
        if (formData.inputs) {
          for (const input of formData.inputs) {
            await this.enterInput(input.field, input.value);
          }
        }

        // Handle checkbox selections
        if (formData.checkboxes) {
          for (const checkbox of formData.checkboxes) {
            await this.checkCheckbox(checkbox.field, checkbox.value);
          }
        }

        // Handle color selections
        if (formData.colors) {
          for (const color of formData.colors) {
            await this.selectColor(color.field, color.value);
          }
        }

        // Handle radio button selections
        if (formData.radioButtons) {
          for (const radioButton of formData.radioButtons) {
            await this.selectRadioButton(radioButton.field, radioButton.value);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async clickSidebarMenu(tab: ListingTabType): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const sidebarMenuLocator = this.mlcPageLocators.sidebarMenu(tab);
        await sidebarMenuLocator.waitFor({ state: 'visible', timeout: 10000 });
        await sidebarMenuLocator.click();
      },
      `Successfully clicked sidebar menu: ${tab}`,
      `Failed to click sidebar menu: ${tab}`
    );
  }

  async clickPublishButton(): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const publishButtonLocator = this.mlcPageLocators.publishButton();
        await publishButtonLocator.waitFor({ state: 'visible', timeout: 10000 });
        await publishButtonLocator.click();
      },
      'Successfully clicked publish button',
      'Failed to click publish button'
    );
  }  

  private isDropdownField(field: string): field is CAndRDropdownType {
    return Object.values(CAndRDropdownType).includes(field as CAndRDropdownType);
  }

  private isInputField(field: string): field is CAndRTextInputType {
    return Object.values(CAndRTextInputType).includes(field as CAndRTextInputType);
  }

  private isColorField(field: string): field is CAndRColorType {
    return Object.values(CAndRColorType).includes(field as CAndRColorType);
  }

  private isCheckboxField(field: string): field is CAndRCheckboxType {
    return Object.values(CAndRCheckboxType).includes(field as CAndRCheckboxType);
  }

  private isQuestionnaireField(field: string): field is CAndRQuestionnaireType {
    return Object.values(CAndRQuestionnaireType).includes(field as CAndRQuestionnaireType);
  }

  async fillVehicleData(formFields: Array<
    | { field: CAndRDropdownType; value: string }
    | { field: CAndRTextInputType; value: string }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isDropdownField(formField.field)) {
            await this.selectFromDropDown(formField.field, formField.value);
          } else if (this.isInputField(formField.field)) {
            await this.enterInput(formField.field, formField.value);
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async fillFeatures(formFields: Array<
    | { field: CAndRDropdownType; value: string }
    | { field: CAndRTextInputType; value: string }
    | { field: CAndRColorType; value: string }
    | { field: CAndRCheckboxType; value: boolean }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isDropdownField(formField.field)) {
            // Handle dropdown field
            const dropdownField = formField as { field: CAndRDropdownType; value: string };
            await this.selectFromDropDown(dropdownField.field, dropdownField.value);
          } else if (this.isInputField(formField.field)) {
            // Handle input field
            const inputField = formField as { field: CAndRTextInputType; value: string };
            await this.enterInput(inputField.field, inputField.value);
          } else if (this.isColorField(formField.field)) {
            // Handle color field
            const colorField = formField as { field: CAndRColorType; value: string };
            await this.selectColor(colorField.field, colorField.value);
          } else if (this.isCheckboxField(formField.field)) {
            // Handle checkbox field
            const checkboxField = formField as { field: CAndRCheckboxType; value: boolean };
            await this.checkCheckbox(checkboxField.field, checkboxField.value);
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async fillCondition(formFields: Array<
    | { field: CAndRDropdownType; value: string }
    | { field: CAndRTextInputType; value: string }
    | { field: CAndRColorType; value: string }
    | { field: CAndRCheckboxType; value: boolean }
    | { field: CAndRQuestionnaireType; value: UnknownYesNoType }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isDropdownField(formField.field)) {
            // Handle dropdown field
            const dropdownField = formField as { field: CAndRDropdownType; value: string };
            await this.selectFromDropDown(dropdownField.field, dropdownField.value);
          } else if (this.isInputField(formField.field)) {
            // Handle input field
            const inputField = formField as { field: CAndRTextInputType; value: string };
            await this.enterInput(inputField.field, inputField.value);
          } else if (this.isColorField(formField.field)) {
            // Handle color field
            const colorField = formField as { field: CAndRColorType; value: string };
            await this.selectColor(colorField.field, colorField.value);
          } else if (this.isCheckboxField(formField.field)) {
            // Handle checkbox field
            const checkboxField = formField as { field: CAndRCheckboxType; value: boolean };
            await this.checkCheckbox(checkboxField.field, checkboxField.value);
          } else if (this.isQuestionnaireField(formField.field)) {
            // Handle questionnaire field
            const questionnaireField = formField as { field: CAndRQuestionnaireType; value: UnknownYesNoType };
            await this.selectRadioButton(questionnaireField.field, questionnaireField.value);
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async fillEquipment(formFields: Array<
    | { field: CAndRCheckboxType; value: boolean }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isCheckboxField(formField.field)) {
            // Handle checkbox field
            const checkboxField = formField as { field: CAndRCheckboxType; value: boolean };
            await this.checkCheckbox(checkboxField.field, checkboxField.value);
            
            // Wait 500ms after each checkbox interaction
            await this.page.waitForTimeout(500);
            
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async fillDrivetrain(formFields: Array<
    | { field: CAndRDropdownType; value: string }
    | { field: CAndRTextInputType; value: string }    
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isDropdownField(formField.field)) {
            // Handle dropdown field
            const dropdownField = formField as { field: CAndRDropdownType; value: string };
            await this.selectFromDropDown(dropdownField.field, dropdownField.value);
          } else if (this.isInputField(formField.field)) {
            // Handle input field
            const inputField = formField as { field: CAndRTextInputType; value: string };
            await this.enterInput(inputField.field, inputField.value);
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async fillPrice(formFields: Array<
    | { field: CAndRTextInputType; value: string }
    | { field: CAndRCheckboxType; value: boolean }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isInputField(formField.field)) {
            // Handle input field
            const inputField = formField as { field: CAndRTextInputType; value: string };
            await this.enterInput(inputField.field, inputField.value);
          } else if (this.isCheckboxField(formField.field)) {
            // Handle checkbox field
            const checkboxField = formField as { field: CAndRCheckboxType; value: boolean };
            await this.checkCheckbox(checkboxField.field, checkboxField.value);
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }

  async fillContact(formFields: Array<
    | { field: CAndRTextInputType; value: string }    
    | { field: CAndRQuestionnaireType; value: UnknownYesNoType }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          if (this.isInputField(formField.field)) {
            // Handle input field
            const inputField = formField as { field: CAndRTextInputType; value: string };
            await this.enterInput(inputField.field, inputField.value);
          } else if (this.isQuestionnaireField(formField.field)) {
            // Handle questionnaire field
            const questionnaireField = formField as { field: CAndRQuestionnaireType; value: UnknownYesNoType };
            await this.selectRadioButton(questionnaireField.field, questionnaireField.value);
          } else {
            throw new Error(`Unknown field type for field: "${formField.field}"`);
          }
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields'
    );
  }
}














