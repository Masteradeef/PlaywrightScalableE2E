import { expect, Page } from '@playwright/test';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export abstract class BaseActions {
  protected page!: Page;

  constructor() {}

  /**
   * Generic async handler that wraps operations and provides consistent error handling
   */
  protected async handleAsync<T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    timeout: number = 30000
  ): Promise<ActionResult> {
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
        )
      ]);
      
      console.log(successMessage);
      return { success: true, message: successMessage, data: result };
    } catch (error) {
      const fullErrorMessage = `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(fullErrorMessage);
      return { success: false, message: fullErrorMessage };
    }
  }

  /**
   * Chainable async handler for operations that should return 'this' for method chaining
   */
  protected async handleAsyncChainable<T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    timeout: number = 30000
  ): Promise<this> {
    try {
      await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
        )
      ]);
      
      console.log(successMessage);
      return this;
    } catch (error) {
      const fullErrorMessage = `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(fullErrorMessage);
      throw new Error(fullErrorMessage);
    }
  }

  /**
   * Wait for a specified duration
   */
  wait = async (milliseconds: number): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
        return true;
      },
      `Waited for ${milliseconds}ms`,
      `Failed to wait for ${milliseconds}ms`
    );
  };

  /**
   * Navigate to a URL
   */
  navigate = async (url: string): Promise<this> => {
    return this.handleAsyncChainable(
      async () => {
        await this.page.goto(url);
        return true;
      },
      `Navigated to: ${url}`,
      `Failed to navigate to: ${url}`
    );
  };

  /**
   * Get the current page title
   */
  getTitle = async (): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {
        const title = await this.page.title();
        return title;
      },
      'Successfully retrieved page title',
      'Failed to get page title'
    );
  };

  /**
   * Get the current URL
   */
  getCurrentUrl = async (): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {
        const url = this.page.url();
        return url;
      },
      'Successfully retrieved current URL',
      'Failed to get current URL'
    );
  };

  /**
   * Take a screenshot
   */
  takeScreenshot = async (path?: string): Promise<ActionResult> => {
    return this.handleAsync(
      async () => {
        const screenshot = await this.page.screenshot({ 
          path, 
          fullPage: true 
        });
        return screenshot;
      },
      `Screenshot taken${path ? ` and saved to: ${path}` : ''}`,
      'Failed to take screenshot'
    );
  };

  /**
   * Get dataLayer object from web page
   */
  getDataLayer = async (): Promise<any[]> => {
      console.log('Retrieving dataLayer from browser console');
      const dataLayer = await this.page.evaluate(() => {
          return (window as any).dataLayer || [];
      });
      
      console.log(`✅ DataLayer retrieved with ${dataLayer.length} nodes`);
      return dataLayer;
  };

  /**
   * Verify dataLayer object contains expected value for a given field
   */
  verifyDatalayerNodeValue = async (dataLayer: any[], fieldName: string, expectedValue: string): Promise<any[]> => {
      console.log(`Verifying ${fieldName} with expected value "${expectedValue}"`);
      
      let currentDataLayer = dataLayer;
      let targetNode: any = null;
      let actualValue = '';
      let reloadCount = 0;
      const maxReloads = 5;
      
      // Helper function to find targetNode in dataLayer
      const findTargetNode = (dl: any[]): any => {
          for (let i = 0; i < dl.length; i++) {
              const node = dl[i];
              if (node && node[fieldName]) {
                  const value = node[fieldName]?.toLowerCase() || '';
                  if (value) {
                      return node;
                  }
              }
          }
          return null;
      };
      
      // Try to find targetNode with actualValue
      while (reloadCount <= maxReloads) {
          targetNode = findTargetNode(currentDataLayer);
          
          if (targetNode) {
              actualValue = targetNode[fieldName]?.toLowerCase() || '';
          }
          
          // If targetNode found with non-empty value, we're done
          if (targetNode && actualValue) {
              console.log(`✅ Found ${fieldName} in dataLayer: ${targetNode[fieldName]}`);
              break;
          }
          
          // If not found or value is empty, and we haven't exceeded max reloads
          if (reloadCount < maxReloads) {
              reloadCount++;
              console.log(`⚠️ ${fieldName} not found or value is empty (attempt ${reloadCount}/${maxReloads}), reloading page and retrieving dataLayer again...`);
              await this.page.reload({ waitUntil: 'load' });
              await this.page.waitForTimeout(2000);
              
              currentDataLayer = await this.page.evaluate(() => {
                  return (window as any).dataLayer || [];
              });
              
              console.log(`✅ DataLayer retrieved again with ${currentDataLayer.length} nodes`);
          } else {
              // Max reloads exceeded
              console.log(`⚠️ Max reloads (${maxReloads}) exceeded, could not find ${fieldName} with non-empty value`);
              break;
          }
      }
      
      expect(targetNode).toBeTruthy();
      expect(actualValue).toBe(expectedValue.toLowerCase());
      console.log(`✅ ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} verification: ${targetNode[fieldName]} matches expected "${expectedValue}"`);
      
      return currentDataLayer;
  };

  /**
   * Verify current URL contains expected string (i.e. URL path, query param, etc.)
   */
  verifyUrlContains = async (expectedString: string): Promise<void> => {     
      const currentUrl = this.page.url().toLowerCase();
      expect(currentUrl).toContain(expectedString.toLowerCase());
      console.log(`✅ URL verification: ${this.page.url()} contains "${expectedString}"`);
  };
}