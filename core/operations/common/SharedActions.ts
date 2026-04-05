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
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
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
   * Get ngVdpModel object from web page
   */
  getNgVdpModel = async (): Promise<any> => {
      console.log('Retrieving ngVdpModel from browser console');
      const ngVdpModel = await this.page.evaluate(() => {
          return (window as any).ngVdpModel || null;
      });
      
      if (ngVdpModel) {
          console.log(`✅ ngVdpModel retrieved successfully`);
      } else {
          console.log(`⚠️ ngVdpModel not found on page`);
      }
      return ngVdpModel;
  };

  /**
   * Retrieve value for a target node from dataLayer array or ngVdpModel object
   * @param data The dataLayer array or ngVdpModel object to search
   * @param fieldName The field name to search for
   * @returns The value found or null if not found
   */
  retrieveDatalayerNodeValue = (data: any[] | any, fieldName: string): any => {
      console.log(`Retrieving value for field "${fieldName}"`);
      
      // Helper function to recursively search for field in an object
      const findFieldInObject = (obj: any, field: string): any => {
          if (!obj || typeof obj !== 'object') {
              return null;
          }
          
          // Direct property access
          if (obj[field] !== undefined) {
              return obj[field];
          }
          
          // Recursively search nested objects
          for (const key of Object.keys(obj)) {
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                  const result = findFieldInObject(obj[key], field);
                  if (result !== null) {
                      return result;
                  }
              }
          }
          
          return null;
      };
      
      // If data is an array (dataLayer), iterate through nodes
      if (Array.isArray(data)) {
          for (const node of data) {
              const value = findFieldInObject(node, fieldName);
              if (value !== null) {
                  console.log(`✅ Found "${fieldName}" in dataLayer: ${JSON.stringify(value)}`);
                  return value;
              }
          }
      } else {
          // If data is an object (ngVdpModel), search directly
          const value = findFieldInObject(data, fieldName);
          if (value !== null) {
              console.log(`✅ Found "${fieldName}" in object: ${JSON.stringify(value)}`);
              return value;
          }
      }
      
      console.log(`⚠️ Field "${fieldName}" not found`);
      return null;
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
      expect(actualValue, `Expected ${fieldName} to be "${expectedValue.toLowerCase()}" but got "${actualValue}"`).toBe(expectedValue.toLowerCase());
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














