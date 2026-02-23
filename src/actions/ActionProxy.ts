import { Page } from '@playwright/test';
import { ProjectContextManager } from '../utils/config/project-context';
import { PageType } from '../utils/types/project.types';

// Import all desktop action classes
import { DesktopListPageActions } from './desktop/desktop.listPage.actions';
import { DesktopSharedActions } from './desktop/desktop.shared.actions';
import { DesktopHomePageActions } from './desktop/desktop.homePage.actions';
import { DesktopVehicleDetailPageActions } from './desktop/desktop.vehicleDetailPage.actions';
import { DesktopFavouritesPageActions } from './desktop/desktop.favouritesPage.actions';
import { DesktopAfterLeadPageActions } from './desktop/desktop.afterLeadPage.actions';
// import { DesktopLeadFormActions } from './desktop/desktop.leadForm.actions';

// Import all mobile action classes
import { MobileListPageActions } from './mobile/mobile.listPage.actions';
import { MobileSharedActions } from './mobile/mobile.shared.actions';
import { MobileHomePageActions } from './mobile/mobile.homePage.actions';
import { MobileVehicleDetailPageActions } from './mobile/mobile.vehicleDetailPage.actions';
import { MobileFavouritesPageActions } from './mobile/mobile.favouritesPage.actions';
import { MobileAfterLeadPageActions } from './mobile/mobile.afterLeadPage.actions';
// import { MobileLeadFormActions } from './mobile/mobile.leadForm.actions';

type ActionClass = new (page: Page) => any;

export class ActionProxy {
  private static instances: Map<string, any> = new Map();
  
  // Registry of all action classes - add new ones here as you create them
  private static actionRegistry: { [key: string]: { desktop: ActionClass, mobile: ActionClass } } = {
    listPage: {
      desktop: DesktopListPageActions,
      mobile: MobileListPageActions
    },
    shared: {
      desktop: DesktopSharedActions,
      mobile: MobileSharedActions
    },
    homePage: {
      desktop: DesktopHomePageActions,
      mobile: MobileHomePageActions
    },
    vehicleDetailPage: {
      desktop: DesktopVehicleDetailPageActions,
      mobile: MobileVehicleDetailPageActions
    },
    favouritesPage: {
      desktop: DesktopFavouritesPageActions,
      mobile: MobileFavouritesPageActions
    },
    afterLeadPage: {
      desktop: DesktopAfterLeadPageActions,
      mobile: MobileAfterLeadPageActions
    }
    // Add more action types here as you create them:
    // leadForm: {
    //   desktop: DesktopLeadFormActions,
    //   mobile: MobileLeadFormActions
    // }
  };
  
  /**
   * Generic method that creates smart proxies for any action type
   * @param page Playwright page object
   * @param actionType The type of action using PageType enum
   * @returns Proxy object that delegates to appropriate desktop/mobile implementation
   */
  static createActions(page: Page, actionType: PageType): any {
    // Initialize project context to detect device type
    ProjectContextManager.initializeFromEnvironment();
    const context = ProjectContextManager.getInstance().getContext();
    
    // Get the action classes for this type
    const actionClasses = this.actionRegistry[actionType];
    if (!actionClasses) {
      throw new Error(`Unsupported action type: ${actionType}. Available types: ${Object.keys(this.actionRegistry).join(', ')}`);
    }
    
    // Create the appropriate concrete implementation based on device
    const ActionClass = context.device === 'desktop' 
      ? actionClasses.desktop 
      : actionClasses.mobile;
    
    const implementation = new ActionClass(page);
    
    // Return a proxy that delegates all method calls to the implementation
    return new Proxy(implementation, {
      get(target: any, prop: string | symbol) {
        const value = target[prop];
        
        // If it's a function, bind it to the target to preserve 'this' context
        if (typeof value === 'function') {
          return value.bind(target);
        }
        
        // For non-function properties, return as-is
        return value;
      }
    });
  }
  
  /**
   * Helper method to get all available action types
   * @returns Array of available action type names
   */
  static getAvailableActionTypes(): string[] {
    return Object.keys(this.actionRegistry);
  }
}