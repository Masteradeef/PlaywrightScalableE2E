import { ProjectContextManager } from '../../core/helpers/settings/projectContext';

/**
 * Global setup function that runs before all tests
 * This initializes the project context from environment variables
 */
async function globalSetup() {
  console.log('🚀 Starting global setup...');
  
  // Initialize project context from environment
  ProjectContextManager.initializeFromEnvironment();
  
  const contextManager = ProjectContextManager.getInstance();
  try {
    const context = contextManager.getContext();
    console.log(`📋 Project context initialized:`, {
      type: context.type,
      language: context.language,
      device: context.device,
      browser: context.browser
    });
  } catch (error) {
    console.warn('⚠️  Warning: Could not initialize project context from environment');
  }
  
  // Additional global setup logic can go here
  // Examples:
  // - Database setup
  // - Test data preparation
  // - External service configuration
  // - Authentication token setup
  
  console.log('✅ Global setup completed');
}

export default globalSetup;














