import { Page, Response } from '@playwright/test'

export interface NetworkResponse {
  url: string
  status: number
  request: any
}

export interface NetworkInterception {
  initializeNetworkListener: () => void
  getAllNetworkResponses: (urlPattern?: string) => NetworkResponse[]
  clearNetworkResponses: () => void
}

export const createNetworkInterception = (page: Page): NetworkInterception => {
  let networkResponses: NetworkResponse[] = []
  let isNetworkListenerInitialized = false

  const initializeNetworkListener = (): void => {
    if (!isNetworkListenerInitialized) {
      page.on('response', (response) => {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          request: response.request()
        })
      })
      isNetworkListenerInitialized = true
    }
  }

  const getAllNetworkResponses = (urlPattern?: string): NetworkResponse[] => {
    initializeNetworkListener()
    
    if (!urlPattern) {
      return [...networkResponses]
    }
    
    return networkResponses.filter(response => response.url.includes(urlPattern))
  }

  const clearNetworkResponses = (): void => {
    networkResponses = []
  }

  return {
    initializeNetworkListener,
    getAllNetworkResponses,
    clearNetworkResponses
  }
}

/**
 * Creates a promise that waits for a network response matching the given URL pattern.
 * Works across all frames (including iframes).
 * Must be called BEFORE the action that triggers the network request.
 * 
 * @param page - Playwright Page instance
 * @param urlPattern - Substring to match against the response URL
 * @param timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns A promise that resolves with the matching Response
 */
export const waitForNetworkResponse = (page: Page, urlPattern: string, timeout: number = 30000): Promise<Response> => {
  return page.waitForResponse(
    response => response.url().includes(urlPattern),
    { timeout }
  )
}















