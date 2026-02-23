import { Page } from '@playwright/test';
import { BaseActions } from './BaseActions';
import { BaseSharedLocators } from '../../locators/base/base.shared.locators';
import { ActionResult } from '../../utils/types/project.types';

export abstract class BaseSharedActions extends BaseActions {
  protected sharedLocators: BaseSharedLocators;
  protected page: Page;

  constructor(sharedLocators: BaseSharedLocators, page: Page) {
    super();
    this.sharedLocators = sharedLocators;
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param url The URL to navigate to (can be relative or absolute)
   * @returns Promise that resolves to this for method chaining
   */
  navigateToUrl = async (url: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.goto(url);
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        
        // Try to accept cookies if banner is present
        try {
          await this.closeCookieBanner();
        } catch (error) {
          // Cookie banner might not be present, continue without error
          console.log('Cookie banner not found or already accepted');
        }
        
        return true;
      },
      `Successfully navigated to: ${url}`,
      `Failed to navigate to: ${url}`,
      35000
    );
  };

  /**
   * Navigate to a URL and wait for a specific element to be visible
   * @param url The URL to navigate to
   * @param selector CSS selector or test-id to wait for
   * @param timeout Timeout in milliseconds (default: 30000)
   * @returns Promise that resolves to this for method chaining
   */
  navigateToUrlAndWaitFor = async (url: string, selector: string, timeout: number = 30000): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.goto(url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(selector).waitFor({ state: 'visible', timeout });
        return true;
      },
      `Successfully navigated to ${url} and found element: ${selector}`,
      `Failed to navigate to ${url} or element not found: ${selector}`,
      timeout + 5000
    );
  };

  /**
   * Navigate to home page
   * @returns Promise that resolves to this for method chaining
   */
  navigateToHome = async (): Promise<this> => {
    return this.navigateToUrl('/');
  };  

  /**
   * Navigate back in browser history
   * @returns Promise that resolves to this for method chaining
   */
  navigateBack = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.goBack();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        return true;
      },
      'Successfully navigated back',
      'Failed to navigate back'
    );
  };

  /**
   * Navigate forward in browser history
   * @returns Promise that resolves to this for method chaining
   */
  navigateForward = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.goForward();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        return true;
      },
      'Successfully navigated forward',
      'Failed to navigate forward'
    );
  };

  /**
   * Reload the current page
   * @returns Promise that resolves to this for method chaining
   */
  reloadPage = async (): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        return true;
      },
      'Successfully reloaded page',
      'Failed to reload page'
    );
  };

  /**
   * Wait for page to be fully loaded (networkidle state)
   * @param timeout Timeout in milliseconds (default: 30000)
   * @returns Promise that resolves to this for method chaining
   */
  waitForPageLoad = async (timeout: number = 30000): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.waitForLoadState('domcontentloaded', { timeout });
        return true;
      },
      'Page fully loaded (domcontentloaded)',
      'Page failed to reach domcontentloaded state',
      timeout
    );
  };

  /**
   * Close cookie banner by waiting for it to appear and clicking the close button
   * Includes polling mechanism and verification that banner is closed
   * @param timeout Timeout in milliseconds (default: 10000)
   * @param pollingInterval Polling interval in milliseconds (default: 500)
   * @returns Promise that resolves to this for method chaining
   */
  closeCookieBanner = async (timeout: number = 10000, pollingInterval: number = 250): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        const cookieBanner = this.sharedLocators.cookieBanner();
        const closeButton = this.sharedLocators.cookieBannerCloseButton();
        
        // Wait for cookie banner to be displayed with polling
        const startTime = Date.now();
        let bannerDisplayed = false;
        
        while (Date.now() - startTime < timeout) {
          try {
            await cookieBanner.waitFor({ state: 'visible', timeout: pollingInterval });
            bannerDisplayed = true;
            console.log('Cookie banner is displayed');
            break;
          } catch (error) {
            // Continue polling
            await this.page.waitForTimeout(pollingInterval);
          }
        }
        
        if (!bannerDisplayed) {
          console.log('Cookie banner did not appear within timeout');
          return true; // Not an error, banner might not be shown
        }
        
        // Click close button to close the banner
        await closeButton.click();
        console.log('Clicked cookie banner close button');
        
        // Verify banner is closed by waiting for it to be hidden
        await cookieBanner.waitFor({ state: 'hidden', timeout: 5000 });
        console.log('Cookie banner is now closed');
        
        return true;
      },
      'Successfully closed cookie banner',
      'Failed to close cookie banner',
      timeout + 5000
    );
  };

  // #region Authentication and account management functions

  async fillEmailInput(email: string): Promise<ActionResult> {
    try {
      await this.sharedLocators.emailInput().fill(email);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearEmailInput(): Promise<ActionResult> {
    try {
      await this.sharedLocators.emailInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear email input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickContinueWithEmailButton(): Promise<ActionResult> {
    try {
      await this.sharedLocators.continueWithEmailButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click continue with email button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async fillPasswordInput(password: string): Promise<ActionResult> {
    try {
      await this.sharedLocators.passwordInput().fill(password);
      return { success: true };
    } catch (error) {
      console.error('Failed to fill password input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clearPasswordInput(): Promise<ActionResult> {
    try {
      await this.sharedLocators.passwordInput().clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear password input:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickSignInButton(): Promise<ActionResult> {
    try {
      await this.sharedLocators.signInButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click sign in button:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async signInSavedSearch(email: string, password: string): Promise<ActionResult> {
    try {
      await this.sharedLocators.emailInput().fill(email);
      await this.sharedLocators.continueWithEmailButton().click();
      await this.sharedLocators.passwordInput().fill(password);
      await this.sharedLocators.signInButton().click();
      await this.sharedLocators.myAccountLink().waitFor({ state: 'attached', timeout: 30000 });
      return { success: true };
    } catch (error) {
      console.error('Failed to sign in for saved search:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickMyAccountDropdown(): Promise<ActionResult> {
    try {
      await this.sharedLocators.myAccountDropdown().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click my account dropdown:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async isMyAccountDropdownVisible(timeout: number = 5000): Promise<boolean> {
    try {
      return await this.sharedLocators.myAccountDropdown().isVisible({ timeout });
    } catch (error) {
      return false;
    }
  }

  async isMyAccountLinkVisible(timeout: number = 5000): Promise<boolean> {
    try {
      await this.sharedLocators.myAccountLink().waitFor({ state: 'attached', timeout });
      const elementCount = await this.sharedLocators.myAccountLink().count();
      console.log(`Account link found in DOM: ${elementCount > 0}`);
      return elementCount > 0;
    } catch (error) {
      console.log('Account link not found in DOM within timeout');
      return false;
    }
  }

  async clickFavouritesMenu(): Promise<ActionResult> {
    try {
      await this.clickMyAccountDropdown();
      await this.sharedLocators.favouritesLink().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click favourites menu:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickFavouritesIcon(): Promise<ActionResult> {
    try {
      await this.sharedLocators.favouritesIcon().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click favourites icon:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickSkipIntroButton(): Promise<ActionResult> {
    try {
      if (await this.sharedLocators.skipIntroButton().isVisible({ timeout: 10000 })) {
        await this.sharedLocators.skipIntroButton().click();
        console.log('Skip intro button clicked');
      } else {
        console.log('Skip intro button not found or not visible');
      }
      return { success: true };
    } catch (error) {
      console.log('Skip intro button not present');
      return { success: true }; // Not an error if skip button doesn't appear
    }
  }

  async clickSavedSearchesMenu(): Promise<ActionResult> {
    try {
      await this.clickMyAccountDropdown();
      await this.sharedLocators.savedSearchesLink().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to click saved searches menu:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickDeleteButtonOnSavedSearches(): Promise<ActionResult> {
    try {
      await this.sharedLocators.savedSearchDeleteButton().click();
      console.log('Delete button clicked');
      return { success: true };
    } catch (error) {
      console.log('Delete button not found or not clickable');
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async isSavedSearchDeleted(timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForTimeout(2000);
      const isNoSavedSearchesVisible = await this.sharedLocators.noSavedSearchesText().isVisible({ timeout });
      if (isNoSavedSearchesVisible) {
        console.log('[INFO] Saved search is deleted ("no saved searches" message is visible).');
      } else {
        console.log('[INFO] Saved search still exists ("no saved searches" message is not visible).');
      }
      return isNoSavedSearchesVisible;
    } catch (error) {
      console.log('[WARN] Unable to determine saved search deletion state.', error);
      return false;
    }
  }

  async savedSearchSubscription(email: string): Promise<ActionResult> {
    try {
      await this.sharedLocators.savedSearchEmailInput().fill(email);
      await this.sharedLocators.savedSearchSubscriptionSendButton().click();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit saved search subscription:', error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async clickAcceptButton(): Promise<ActionResult> {
    try {
      if (await this.sharedLocators.acceptButton().isVisible({ timeout: 10000 })) {
        await this.sharedLocators.acceptButton().click();
      } else {
        console.log('Accept button not found or not visible');
      }
      return { success: true };
    } catch (error) {
      console.log('Accept button not present');
      return { success: true }; // Not an error if accept button doesn't appear
    }
  }
  
  // #endregion

  //#region Abstract functions to be implemented by child classes (Desktop and Mobile)  
  abstract clickLoginButton(): Promise<ActionResult>;
  abstract signIn(email: string, password: string): Promise<ActionResult>;
  //#endregion

  // #region Functions that are desktop-specific and may be overridden by child classes
  async isLoggedInTextVisible(timeout: number = 5000): Promise<boolean> {
    throw new Error('isLoggedInTextVisible is not available on this device type');
  }

  async getLoggedInText(timeout: number = 5000): Promise<string | null> {
    throw new Error('getLoggedInText is not available on this device type');
  }
  // #endregion

  // #region Functions that are mobile-specific and may be overridden by child classes
  async clickHamburgerMenu(): Promise<ActionResult> {
    throw new Error('clickHamburgerMenu is not available on this device type');
  }

  async clickLogInSignUpButton(): Promise<ActionResult> {
    throw new Error('clickLogInSignUpButton is not available on this device type');
  }

  async clickCloseMenuIcon(): Promise<ActionResult> {
    throw new Error('clickCloseMenuIcon is not available on this device type');
  }
  // #endregion
}
