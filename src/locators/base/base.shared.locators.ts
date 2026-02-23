import { Locator, Page } from '@playwright/test';

export abstract class BaseSharedLocators {
  constructor(protected page: Page) {}

  // #region Cookie banner locators
  cookieBanner = () => this.page.locator('#cookie-banner');
  cookieBannerCloseButton = () => this.page.locator('button[class*="_cookie-banner-close"]');
  // #endregion

  // #region Authentication and navigation locators shared across all devices
  emailInput = () => this.page.locator('#email');
  passwordInput = () => this.page.getByTestId('password-field');
  continueWithEmailButton = () => this.page.locator('#social-sign-in button[type="submit"]');
  signInButton = () => this.page.locator('#sign-in button[type="submit"]');
  myAccountDropdown = () => this.page.locator('//button[@testid="hfo-desktop-drowndown-btn" and (contains(normalize-space(.),"My Account") or contains(normalize-space(.),"Mon compte"))]');
  favouritesLink = () => this.page.locator('.hfo-nav__submenu__items a[href$="/favorites"]');
  savedSearchesLink = () => this.page.locator('nav[aria-label="Main navigation"] a[href$="/account/searches"]');
  skipIntroButton = () => this.page.locator('button.welcome-popup__close-action[data-action="dismiss"]').filter({ hasText: /^(Skip intro|Sauter l'intro)$/ });
  myAccountLink = () => this.page.locator('.hfo-nav__submenu__items a[href$="/account"]');
  acceptButton = () => this.page.getByTestId('close-button');
  savedSearchDeleteButton = () => this.page.locator('div.sase-actions button[class$="action-button"]');
  noSavedSearchesText = () => this.page.locator('#sase-no-subscriptions');
  savedSearchEmailInput = () => this.page.locator('input[name="email"]');
  savedSearchSubscriptionSendButton = () => this.page.locator('button[type="submit"]');
  // #endregion

  // #region abstract locators to be implemented by both desktop and mobile 
  abstract loginButton(): Locator;
  abstract favouritesIcon(): Locator;
  // #endregion

  // #region EN-Desktop and FR-Desktop Specific Locators (must be overridden by desktop)  
  loggedInText = (): Locator => {
    throw new Error('loggedInText is not available on this device type');
  };
  // #endregion 

  // #region EN-Mobile and FR-Mobile Specific Locators (must be overridden by mobile)
  hamburgerMenu = (): Locator => {
    throw new Error('hamburgerMenu is not available on this device type');
  };

  logInSignUpButton = (): Locator => {
    throw new Error('logInSignUpButton is not available on this device type');
  };

  closeMenuIcon = (): Locator => {
    throw new Error('closeMenuIcon is not available on this device type');
  };
  // #endregion
}