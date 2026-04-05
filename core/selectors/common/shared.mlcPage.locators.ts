// shared.manualListingCreation.locators.ts
import { Page } from '@playwright/test';
import { CAndRCheckboxType, CAndRColorType, CAndRDropdownType, CAndRTextInputType, ListingTabType, UnknownYesNoType, CAndRQuestionnaireType, Language } from '../../helpers/definitions/project.types';
import { ProjectContextManager } from '../../helpers/settings/projectContext';

export abstract class BaseMLCPageLocators {
  constructor(protected page: Page) {}

  sidebarMenu = (tab: ListingTabType) => 
    this.page.getByRole('button', { name: `${tab}` });

  dropDownByLabel = (dropdown: CAndRDropdownType) => {
    // Get current project language from context
    const language = ProjectContextManager.getInstance().getLanguage();        
    const labelParts = dropdown.split('|');    
    // Choose the appropriate language part based on project context
    const localizedLabel = language === Language.FR 
      ? (labelParts[1]?.trim() || labelParts[0]) // French or fallback to English
      : labelParts[0]; // English (default)

    return this.page.locator(`label:has-text("${localizedLabel}") +div`);
  };
  dropdownContainer = (dropdown: CAndRDropdownType) => this.dropDownByLabel(dropdown).locator('.scr-autosuggest');  
  dropdownInput = (dropdown: CAndRDropdownType) => this.dropdownContainer(dropdown).locator('input.input');
  dropdownButton = (dropdown: CAndRDropdownType) => this.dropdownContainer(dropdown).locator('button.button-trigger');
  dropdownOption = (dropdown: CAndRDropdownType, option: string) => this.dropdownContainer(dropdown).locator(`[role="listbox"] [role="option"]:has-text("${option}")`).first();  
    
  inputLabelParent = (label: CAndRTextInputType) => {
    // Get current project language from context
    const language = ProjectContextManager.getInstance().getLanguage();        
    const labelParts = label.split('|');
    
    // Choose the appropriate language part based on project context
    const localizedLabel = language === Language.FR 
      ? (labelParts[1]?.trim() || labelParts[0]) // French or fallback to English
      : labelParts[0]; // English (default)
      
    // Use multiple fallback strategies for different DOM structures
    return this.page.locator(`label:has-text("${localizedLabel}")`).locator('..').locator('+div').or(
      this.page.locator(`label:has-text("${localizedLabel}")`).locator('..')
    ).or(
      this.page.locator(`label:has-text("${localizedLabel}")`).locator('xpath=following-sibling::*[1]')
    );
  };
  inputByLabel = (label: CAndRTextInputType) => {
    // Get current project language from context
    const language = ProjectContextManager.getInstance().getLanguage();        
    const labelParts = label.split('|');
    
    // Choose the appropriate language part based on project context
    const localizedLabel = language === Language.FR 
      ? (labelParts[1]?.trim() || labelParts[0]) // French or fallback to English
      : labelParts[0]; // English (default)
    
    // Use multiple strategies for different field layouts - select first match to avoid strict mode violations  
    return this.page.locator(`input:near(label:has-text("${localizedLabel}"))`).first().or(
      this.inputLabelParent(label).locator('input').first()
    ).or(
      this.page.locator(`label:has-text("${localizedLabel}") input`).first()
    ).or(
      this.page.locator(`label:has-text("${localizedLabel}") + input`).first()
    );
  };

  checkboxByLabel = (label: CAndRCheckboxType) => {
    // Get current project language from context
    const language = ProjectContextManager.getInstance().getLanguage();        
    const labelParts = label.split('|');
    
    // Choose the appropriate language part based on project context
    const localizedLabel = language === Language.FR 
      ? (labelParts[1]?.trim() || labelParts[0]) // French or fallback to English
      : labelParts[0]; // English (default)
      
    // Use more flexible selector with .first() to avoid strict mode violations
    return this.page.locator(`input[type="checkbox"]:near(label:has-text("${localizedLabel}"))`).first().or(
      this.page.locator(`label:has-text("${localizedLabel}") input[type="checkbox"]`).first()
    ).or(
      this.page.locator(`label:has-text("${localizedLabel}") + input[type="checkbox"]`).first()
    );
  };

  colorLabelParent = (colorType: CAndRColorType) => {
    // Get current project language from context
    const language = ProjectContextManager.getInstance().getLanguage();        
    const labelParts = colorType.split('|');
    
    // Choose the appropriate language part based on project context
    const localizedLabel = language === Language.FR 
      ? (labelParts[1]?.trim() || labelParts[0]) // French or fallback to English
      : labelParts[0]; // English (default)

    // Find the section by label and get the fieldset container
    return this.page.locator(`label:has-text("${localizedLabel}")`).locator('+ fieldset');
  };
  
  selectColorByLabel = (colorType: CAndRColorType, color: string) => {
    // Get current project language from context for color selection
    const language = ProjectContextManager.getInstance().getLanguage();
    
    // Split bilingual color names (e.g., "Black|Noir")
    const colorParts = color.split('|');
    
    // Choose the appropriate language part based on project context
    const localizedColor = language === Language.FR 
      ? (colorParts[1]?.trim() || colorParts[0]) // French or fallback to English
      : colorParts[0]; // English (default)
    
    // Click the label instead of input to avoid click interception by span elements
    return this.colorLabelParent(colorType)
      .locator(`div.sr-radio-button:has(label:has-text("${localizedColor}")) label`);
  };

  vehicleConditionRadioButton = (vehicleCondition: CAndRQuestionnaireType, answer: UnknownYesNoType) => {
    // Get current project language from context
    const language = ProjectContextManager.getInstance().getLanguage();
    
    // Split bilingual vehicle condition labels
    const conditionParts = vehicleCondition.split('|');
    const answerParts = answer.split('|');
    
    // Choose the appropriate language parts based on project context
    const localizedCondition = language === Language.FR 
      ? (conditionParts[1]?.trim() || conditionParts[0]) // French or fallback to English
      : conditionParts[0]; // English (default)
    
    const localizedAnswer = language === Language.FR 
      ? (answerParts[1]?.trim() || answerParts[0]) // French or fallback to English  
      : answerParts[0]; // English (default)
    
    // Find the question section and click the radio button label with exact text matching
    return this.page
      .locator(`text="${localizedCondition}"`)
      .locator('..')
      .getByText(localizedAnswer, { exact: true });
  };
  
  descriptionTextBox = () => this.page.locator('div#description');
  publishButton = () => this.page.getByTestId('publish-button');

}















