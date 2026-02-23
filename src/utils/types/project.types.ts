export enum ProjectType {
  EN_DESKTOP_CHROME = 'en-desktop-chrome',
  EN_MOBILE_SAFARI = 'en-mobile-safari',
  FR_DESKTOP_CHROME = 'fr-desktop-chrome',
  FR_MOBILE_SAFARI = 'fr-mobile-safari'
}

export enum Language {
  EN = 'en',
  FR = 'fr'
}

export enum Device {
  DESKTOP = 'desktop',
  MOBILE = 'mobile'
}

export enum Browser {
  CHROME = 'chrome',
  SAFARI = 'safari'
}

export interface ProjectContext {
  type: ProjectType;
  language: Language;
  device: Device;
  browser: Browser;
}

export interface LocatorDefinition {
  selector: string;
  description?: string;
  timeout?: number;
}

export interface LocatorSet {
  [key: string]: LocatorDefinition | string;
}

export interface TestData {
  [key: string]: any;
}

export interface PageConfiguration {
  url: string;
  title: string;
  elements: LocatorSet;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export enum FilterType {
  Location = 'Location',
  MakeModelTrim = 'Make, Model, Trim',
  Price = 'Price'
}

export enum RadiusType {
  Provincial = 'Provincial',
  Nationwide = 'Nationwide',
  TwentyFiveKm = '25 km',
  FiftyKm = '50 km',
  HundredKm = '100 km',
  TwoFiftyKm = '250 km',
  FiveHundredKm = '500 km',
  ThousandKm = '1000 km'
}

export enum PageType {
  HomePage = 'homePage',
  ListPage = 'listPage',
  VehicleDetailPage = 'vehicleDetailPage',
  FavouritesPage = 'favouritesPage',
  AfterLeadPage = 'afterLeadPage',
  Shared = 'shared'
}