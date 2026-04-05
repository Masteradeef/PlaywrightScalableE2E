import { Page } from '@playwright/test';
import { BaseMLCPageActions } from '../common/shared.mlcPage.actions';
import { MobileMLCPageLocators } from '../../selectors/mobile/mobile.mlcPage.locators';
import { CAndRDropdownType, CAndRCheckboxType } from '../../helpers/definitions/project.types';

export class MobileMLCPageActions extends BaseMLCPageActions {
  protected mlcPageLocators: MobileMLCPageLocators;

  constructor(page: Page) {
    const locators = new MobileMLCPageLocators(page);
    super(locators, page);
    this.mlcPageLocators = locators;
  }

  // Override checkbox handling for mobile Safari with proper scrolling
  async checkCheckbox(label: CAndRCheckboxType, bool: boolean): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        const checkboxLocator = this.mlcPageLocators.checkboxByLabel(label);
        await checkboxLocator.waitFor({ state: 'visible', timeout: 10000 });
        
        // Scroll checkbox into view for mobile Safari before interacting
        await checkboxLocator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500); // Give time for scroll animation
        
        // Additional mobile Safari specific handling - ensure element is truly in viewport
        const boundingBox = await checkboxLocator.boundingBox();
        if (boundingBox) {
          const viewportSize = this.page.viewportSize();
          if (viewportSize && boundingBox.y > viewportSize.height - 100) {
            // Element is too close to bottom edge, scroll it more into center
            const elementHandle = await checkboxLocator.elementHandle();
            if (elementHandle) {
              await this.page.evaluate((element) => {
                element.scrollIntoView({ block: 'center', inline: 'center' });
              }, elementHandle);
              await this.page.waitForTimeout(500);
            }
          }
        }
        
        if (bool) {
          // Use tap for mobile Safari, fallback to click with force
          await checkboxLocator.tap().catch(() => checkboxLocator.check({ force: true }));
        } else {
          await checkboxLocator.tap().catch(() => checkboxLocator.uncheck({ force: true }));
        }
        
        // Wait for any UI updates after checkbox interaction
        await this.page.waitForTimeout(500);
      },
      `Successfully ${bool ? 'checked' : 'unchecked'} ${label} checkbox`,
      `Failed to ${bool ? 'check' : 'uncheck'} ${label} checkbox`,
      300000 // Increased timeout for mobile interactions
    );
  }

  // Override dropdown selection for mobile Safari with cascading dropdown support
  async selectFromDropDown(dropdown: CAndRDropdownType, option: string): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Use locator methods for dropdown container
        const autosuggestContainer = this.mlcPageLocators.dropdownContainer(dropdown);
        await autosuggestContainer.waitFor({ state: 'visible', timeout: 15000 });
        
        // Scroll to dropdown to ensure it's in viewport for mobile
        await autosuggestContainer.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        
        // Auto-detect interaction type using locator methods
        const inputElement = this.mlcPageLocators.dropdownInput(dropdown);
        const buttonElement = this.mlcPageLocators.dropdownButton(dropdown);
        
        const inputCount = await inputElement.count();
        const buttonCount = await buttonElement.count();
        
        // For dependent dropdowns, ensure previous selections are complete
        if (dropdown.includes('Model') && !dropdown.includes('year')) {
          // Wait for Model dropdown to be enabled after Brand selection
          await this.page.waitForTimeout(2000);
        } else if (dropdown.includes('year')) {
          // Wait for Model Year dropdown to be populated after Model selection  
          await this.page.waitForTimeout(3000);
        }
        
        // Click the appropriate interactive element to open dropdown with mobile-specific handling
        if (inputCount > 0) {
          // Try multiple interaction approaches for mobile Safari
          await inputElement.tap().catch(() => inputElement.click({ force: true }));
        } else if (buttonCount > 0) {
          await buttonElement.tap().catch(() => buttonElement.click({ force: true }));
        } else {
          throw new Error(`No interactive element found in ${dropdown} dropdown`);
        }
        
        // Extended wait time for mobile Safari to render dropdown options, especially for dependent dropdowns
        await this.page.waitForTimeout(2000);
        
        // For cascading dropdowns, try alternative approach if initial method fails
        let optionElement = this.mlcPageLocators.dropdownOption(dropdown, option);
        
        try {
          await optionElement.waitFor({ state: 'visible', timeout: 10000 });
        } catch (error) {
          // If dropdown options aren't visible, try clicking the dropdown again and wait longer
          console.log(`First attempt failed for ${dropdown}, trying alternative approach...`);
          
          if (inputCount > 0) {
            await inputElement.click({ force: true });
          } else if (buttonCount > 0) {
            await buttonElement.click({ force: true });
          }
          
          // Extended wait for mobile Safari
          await this.page.waitForTimeout(5000);
          
          // Try to find option again with longer timeout
          await optionElement.waitFor({ state: 'visible', timeout: 20000 });
        }
        
        // Scroll option into view for mobile before clicking
        await optionElement.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);
        
        await optionElement.tap().catch(() => optionElement.click({ force: true }));
        
        // Wait for selection to complete and for any cascading updates
        await this.page.waitForTimeout(2000);
        
        // For Brand/Model selections, wait for dependent dropdown to update
        if (dropdown.includes('Brand') || (dropdown.includes('Model') && !dropdown.includes('year'))) {
          await this.page.waitForTimeout(3000);
        }
        
        return true;
      },
      `Successfully selected option: ${option} from ${dropdown}`,
      `Failed to select option: ${option} from ${dropdown}`
    );
  }

  // Override fillEquipment for mobile Safari with extended timeout
  async fillEquipment(formFields: Array<
    | { field: CAndRCheckboxType; value: boolean }
  >): Promise<this> {
    return this.handleAsyncChainable(
      async () => {
        // Process form fields in the exact sequence they are provided
        for (const formField of formFields) {
          // Handle checkbox field (all fields in fillEquipment are checkboxes)
          const checkboxField = formField as { field: CAndRCheckboxType; value: boolean };
          await this.checkCheckbox(checkboxField.field, checkboxField.value);
          
          // Wait 500ms after each checkbox interaction
          await this.page.waitForTimeout(500);
        }
      },
      'Successfully populated all form fields',
      'Failed to populate form fields',
      300000 // Extended timeout for mobile Safari equipment processing
    );
  }
}














