import { ProjectType, Language, Device, Browser, ProjectContext } from '../types/project.types';

export class ProjectContextManager {
  private static instance: ProjectContextManager;
  private currentContext: ProjectContext | null = null;

  private constructor() {}

  static getInstance(): ProjectContextManager {
    if (!ProjectContextManager.instance) {
      ProjectContextManager.instance = new ProjectContextManager();
    }
    return ProjectContextManager.instance;
  }

  setContext(projectType: ProjectType): void {
    this.currentContext = this.parseProjectType(projectType);
  }

  getContext(): ProjectContext {
    if (!this.currentContext) {
      // Try to get context from environment variable if not set
      const envProject = process.env.PLAYWRIGHT_PROJECT as ProjectType;
      if (envProject && Object.values(ProjectType).includes(envProject)) {
        this.setContext(envProject);
        return this.currentContext!;
      }
      throw new Error('Project context not set. Call setContext() first or ensure PLAYWRIGHT_PROJECT env variable is set.');
    }
    return this.currentContext;
  }

  getLanguage(): Language {
    return this.getContext().language;
  }

  getDevice(): Device {
    return this.getContext().device;
  }

  getBrowser(): Browser {
    return this.getContext().browser;
  }

  isDesktop(): boolean {
    return this.getDevice() === Device.DESKTOP;
  }

  isMobile(): boolean {
    return this.getDevice() === Device.MOBILE;
  }

  isEnglish(): boolean {
    return this.getLanguage() === Language.EN;
  }

  isFrench(): boolean {
    return this.getLanguage() === Language.FR;
  }

  private parseProjectType(projectType: ProjectType): ProjectContext {
    const parts = projectType.split('-');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid project type format: ${projectType}`);
    }

    const [language, device, browser] = parts;

    return {
      type: projectType,
      language: language as Language,
      device: device as Device,
      browser: browser as Browser
    };
  }

  /**
   * Initialize context from environment variable
   * This is typically called in global setup
   */
  static initializeFromEnvironment(): void {
    const envProject = process.env.PLAYWRIGHT_PROJECT as ProjectType;
    if (envProject && Object.values(ProjectType).includes(envProject)) {
      const manager = ProjectContextManager.getInstance();
      manager.setContext(envProject);
      console.log(`Project context initialized: ${envProject}`);
    } else {
      console.warn('PLAYWRIGHT_PROJECT environment variable not set or invalid');
    }
  }
}

/**
 * Helper to get language-specific data from any object with en/fr or EN/FR keys
 * @param data Object containing language-specific data
 * @returns The data for the current language
 */
export const getLangData = <T>(data: { en: T; fr: T } | { EN: T; FR: T }): T => {
  const language = ProjectContextManager.getInstance().getLanguage();
  return (data as any)[language];
};

/**
 * Helper to get device and language-specific data from any object with desktop/mobile and en/fr keys
 * @param data Object containing device and language-specific data
 * @returns The data for the current device and language
 */
export const getTestData = <T>(data: { desktop: { en: T; fr: T }; mobile: { en: T; fr: T } }): T => {
  const projectContext = ProjectContextManager.getInstance();
  const device = projectContext.getDevice();
  const language = projectContext.getLanguage();
  return (data as any)[device][language];
};