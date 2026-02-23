import { Page } from '@playwright/test'

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
