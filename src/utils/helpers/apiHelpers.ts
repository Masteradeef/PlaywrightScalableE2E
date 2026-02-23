import { Page, Response, APIResponse } from '@playwright/test';

/**
 * Interface for vehicle data validation
 */
export interface VehicleData {
  id?: string | number;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  location?: string;
  [key: string]: any;
}

/**
 * Interface for API validation result
 */
export interface ApiValidationResult {
  success: boolean;
  message: string;
  data?: any;
  count?: number;
  errors?: string[];
}

/**
 * Validates vehicle results from API response
 * @param response The API response to validate
 * @param expectedMinCount Minimum expected count of results
 * @param expectedMaxCount Maximum expected count of results
 * @returns Validation result with success status and details
 */
export async function validateVehicleResults(
  response: Response | APIResponse,
  expectedMinCount: number = 0,
  expectedMaxCount: number = 1000
): Promise<ApiValidationResult> {
  try {
    // Check if response is successful
    if (!response.ok()) {
      return {
        success: false,
        message: `API response failed with status: ${response.status()}`,
        data: await response.text()
      };
    }

    const responseBody = await response.json();
    
    // Validate response structure
    if (!responseBody || typeof responseBody !== 'object') {
      return {
        success: false,
        message: 'Invalid response format: expected JSON object',
        data: responseBody
      };
    }

    // Extract results array - try common property names
    let results: VehicleData[] = [];
    const possibleResultKeys = ['results', 'data', 'vehicles', 'items', 'listings'];
    
    for (const key of possibleResultKeys) {
      if (responseBody[key] && Array.isArray(responseBody[key])) {
        results = responseBody[key];
        break;
      }
    }

    // If no array found, check if the response itself is an array
    if (results.length === 0 && Array.isArray(responseBody)) {
      results = responseBody;
    }

    if (results.length === 0) {
      return {
        success: false,
        message: 'No results array found in response',
        data: responseBody,
        count: 0
      };
    }

    // Validate count is within expected range
    const actualCount = results.length;
    if (actualCount < expectedMinCount || actualCount > expectedMaxCount) {
      return {
        success: false,
        message: `Result count ${actualCount} is outside expected range [${expectedMinCount}, ${expectedMaxCount}]`,
        data: responseBody,
        count: actualCount
      };
    }

    // Validate each vehicle result has required structure
    const validationErrors: string[] = [];
    
    results.forEach((vehicle, index) => {
      if (!vehicle || typeof vehicle !== 'object') {
        validationErrors.push(`Vehicle at index ${index} is not a valid object`);
        return;
      }

      // Optional: Add specific field validation
      // if (!vehicle.id) {
      //   validationErrors.push(`Vehicle at index ${index} missing id`);
      // }
    });

    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Vehicle validation failed',
        data: responseBody,
        count: actualCount,
        errors: validationErrors
      };
    }

    return {
      success: true,
      message: `Successfully validated ${actualCount} vehicle results`,
      data: responseBody,
      count: actualCount
    };

  } catch (error) {
    return {
      success: false,
      message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      data: null
    };
  }
}

/**
 * Makes an API call and validates the response
 * @param page Playwright page object
 * @param url API endpoint URL
 * @param options Request options
 * @returns Validation result
 */
export async function callApiWithValidation(
  page: Page,
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    data?: any;
    expectedMinCount?: number;
    expectedMaxCount?: number;
  } = {}
): Promise<ApiValidationResult> {
  try {
    const {
      method = 'GET',
      headers = {},
      data,
      expectedMinCount = 0,
      expectedMaxCount = 1000
    } = options;

    const response = await page.request[method.toLowerCase() as 'get'](url, {
      headers,
      data
    });

    return await validateVehicleResults(response, expectedMinCount, expectedMaxCount);
  } catch (error) {
    return {
      success: false,
      message: `API call failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Monitors network requests and validates API responses
 * @param page Playwright page object
 * @param urlPattern Pattern to match API URLs
 * @param validationOptions Validation options
 * @returns Promise that resolves when a matching request is validated
 */
export async function monitorAndValidateApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  validationOptions: {
    expectedMinCount?: number;
    expectedMaxCount?: number;
    timeout?: number;
  } = {}
): Promise<ApiValidationResult> {
  const { expectedMinCount = 0, expectedMaxCount = 1000, timeout = 30000 } = validationOptions;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for API response matching ${urlPattern}`));
    }, timeout);

    const handleResponse = async (response: Response) => {
      const url = response.url();
      const matches = typeof urlPattern === 'string' 
        ? url.includes(urlPattern)
        : urlPattern.test(url);

      if (matches) {
        clearTimeout(timeoutId);
        page.off('response', handleResponse);
        
        try {
          const result = await validateVehicleResults(response, expectedMinCount, expectedMaxCount);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    };

    page.on('response', handleResponse);
  });
}

/**
 * Custom API call with size parameter
 * @param page Playwright page object
 * @param baseUrl Base API URL
 * @param size Number of results to request
 * @returns Validation result
 */
export async function callApiWithCustomSize(
  page: Page,
  baseUrl: string,
  size: number
): Promise<ApiValidationResult> {
  const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}size=${size}`;
  
  return await callApiWithValidation(page, url, {
    expectedMinCount: Math.min(1, size),
    expectedMaxCount: size
  });
}