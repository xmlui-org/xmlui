import { logger } from "./logger.mjs";

/**
 * Standardized logging utilities for documentation generation scripts
 * Provides consistent logging patterns and message formatting
 */

/**
 * Log levels in order of severity (lowest to highest)
 */
export const LOG_LEVELS = {
  INFO: "info",
  WARN: "warn", 
  ERROR: "error"
};

/**
 * Standard logging patterns for common operations
 */
export const LOGGING_PATTERNS = {
  // Operation start/completion
  OPERATION_START: (operation) => `Starting ${operation}...`,
  OPERATION_COMPLETE: (operation) => `Completed ${operation}`,
  OPERATION_FAILED: (operation, error) => `Failed ${operation}: ${error}`,
  
  // File operations
  FILE_PROCESSING: (filePath) => `Processing file: ${filePath}`,
  FILE_WRITTEN: (filePath) => `Written file: ${filePath}`,
  FILE_DELETED: (filePath) => `Deleted file: ${filePath}`,
  FILE_NOT_FOUND: (filePath) => `File not found: ${filePath}`,
  
  // Directory operations  
  DIRECTORY_CREATED: (dirPath) => `Created directory: ${dirPath}`,
  DIRECTORY_CLEANED: (dirPath) => `Cleaned directory: ${dirPath}`,
  
  // Component processing
  COMPONENT_PROCESSING: (componentName) => `Processing component: ${componentName}`,
  COMPONENT_SKIPPED: (componentName, reason) => `Skipped component ${componentName}: ${reason}`,
  
  // Package/Extension operations
  PACKAGE_LOADING: (packageName) => `Loading package: ${packageName}`,
  PACKAGE_LOADED: (packageName) => `Loaded package: ${packageName}`,
  PACKAGE_SKIPPED: (packageName, reason) => `Skipped package ${packageName}: ${reason}`,
  
  // Configuration
  CONFIG_LOADING: (configPath) => `Loading configuration from: ${configPath}`,
  CONFIG_LOADED: (configPath) => `Configuration loaded from: ${configPath}`,
  
  // Progress indicators
  PROGRESS: (current, total, operation) => `Progress: ${current}/${total} ${operation}`,
  
  // Validation
  VALIDATION_PASSED: (item) => `Validation passed: ${item}`,
  VALIDATION_FAILED: (item, reason) => `Validation failed for ${item}: ${reason}`,
  
  // Generic warnings and errors
  DEPRECATION_WARNING: (feature) => `DEPRECATED: ${feature} is deprecated and will be removed in a future version`,
  FEATURE_NOT_SUPPORTED: (feature) => `Feature not supported: ${feature}`,
  UNEXPECTED_CONDITION: (condition) => `Unexpected condition encountered: ${condition}`
};

/**
 * Standardized logging functions with consistent formatting
 */
export const standardLogger = {
  /**
   * Log an informational message
   */
  info: (message, ...additionalArgs) => {
    if (additionalArgs.length > 0) {
      logger.info(message, ...additionalArgs);
    } else {
      logger.info(message);
    }
  },

  /**
   * Log a warning message
   */
  warn: (message, ...additionalArgs) => {
    if (additionalArgs.length > 0) {
      logger.warn(message, ...additionalArgs);
    } else {
      logger.warn(message);
    }
  },

  /**
   * Log an error message
   */
  error: (message, ...additionalArgs) => {
    if (additionalArgs.length > 0) {
      logger.error(message, ...additionalArgs);
    } else {
      logger.error(message);
    }
  },

  /**
   * Log the start of an operation
   */
  operationStart: (operation) => {
    logger.info(LOGGING_PATTERNS.OPERATION_START(operation));
  },

  /**
   * Log the completion of an operation
   */
  operationComplete: (operation) => {
    logger.info(LOGGING_PATTERNS.OPERATION_COMPLETE(operation));
  },

  /**
   * Log a failed operation
   */
  operationFailed: (operation, error) => {
    logger.error(LOGGING_PATTERNS.OPERATION_FAILED(operation, error));
  },

  /**
   * Log file processing
   */
  fileProcessing: (filePath) => {
    logger.info(LOGGING_PATTERNS.FILE_PROCESSING(filePath));
  },

  /**
   * Log successful file write
   */
  fileWritten: (filePath) => {
    logger.info(LOGGING_PATTERNS.FILE_WRITTEN(filePath));
  },

  /**
   * Log component processing
   */
  componentProcessing: (componentName) => {
    logger.info(LOGGING_PATTERNS.COMPONENT_PROCESSING(componentName));
  },

  /**
   * Log skipped component
   */
  componentSkipped: (componentName, reason) => {
    logger.warn(LOGGING_PATTERNS.COMPONENT_SKIPPED(componentName, reason));
  },

  /**
   * Log package loading
   */
  packageLoading: (packageName) => {
    logger.info(LOGGING_PATTERNS.PACKAGE_LOADING(packageName));
  },

  /**
   * Log package loaded
   */
  packageLoaded: (packageName) => {
    logger.info(LOGGING_PATTERNS.PACKAGE_LOADED(packageName));
  },

  /**
   * Log skipped package
   */
  packageSkipped: (packageName, reason) => {
    logger.warn(LOGGING_PATTERNS.PACKAGE_SKIPPED(packageName, reason));
  },

  /**
   * Log configuration loading
   */
  configLoading: (configPath) => {
    logger.info(LOGGING_PATTERNS.CONFIG_LOADING(configPath));
  },

  /**
   * Log progress
   */
  progress: (current, total, operation) => {
    logger.info(LOGGING_PATTERNS.PROGRESS(current, total, operation));
  },

  /**
   * Log deprecation warning
   */
  deprecationWarning: (feature) => {
    logger.warn(LOGGING_PATTERNS.DEPRECATION_WARNING(feature));
  }
};

/**
 * Creates a scoped logger for a specific module/operation
 */
export function createScopedLogger(scope) {
  return {
    info: (message, ...args) => standardLogger.info(`[${scope}] ${message}`, ...args),
    warn: (message, ...args) => standardLogger.warn(`[${scope}] ${message}`, ...args),
    error: (message, ...args) => standardLogger.error(`[${scope}] ${message}`, ...args),
    operationStart: (operation) => standardLogger.operationStart(`${scope}: ${operation}`),
    operationComplete: (operation) => standardLogger.operationComplete(`${scope}: ${operation}`),
    operationFailed: (operation, error) => standardLogger.operationFailed(`${scope}: ${operation}`, error),
    
    // File operations
    fileProcessing: (filePath) => standardLogger.fileProcessing(filePath),
    fileWritten: (filePath) => standardLogger.fileWritten(filePath),
    
    // Component operations
    componentProcessing: (componentName) => standardLogger.componentProcessing(componentName),
    componentSkipped: (componentName, reason) => standardLogger.componentSkipped(componentName, reason),
    
    // Package operations
    packageLoading: (packageName) => standardLogger.packageLoading(packageName),
    packageLoaded: (packageName) => standardLogger.packageLoaded(packageName),
    packageSkipped: (packageName, reason) => standardLogger.packageSkipped(packageName, reason),
    
    // Configuration
    configLoading: (configPath) => standardLogger.configLoading(configPath),
    
    // Progress
    progress: (current, total, operation) => standardLogger.progress(current, total, operation),
    
    // Warnings
    deprecationWarning: (feature) => standardLogger.deprecationWarning(feature)
  };
}
