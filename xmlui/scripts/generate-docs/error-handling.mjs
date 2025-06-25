import { logger, ErrorWithSeverity, LOGGER_LEVELS, processError } from "./logger.mjs";
import { ERROR_HANDLING, ERROR_MESSAGES } from "./constants.mjs";

/**
 * Standardized error handling utilities for documentation generation scripts
 */

/**
 * Handles errors and exits gracefully with appropriate exit codes
 * @param {Error | ErrorWithSeverity | string} error - The error to handle
 * @param {number} exitCode - Optional exit code (defaults to GENERAL_ERROR)
 * @param {string} context - Optional context about where the error occurred
 */
export function handleFatalError(error, exitCode = ERROR_HANDLING.EXIT_CODES.GENERAL_ERROR, context = null) {
  if (context) {
    logger.error(`Error in ${context}:`);
  }
  
  processError(error);
  process.exit(exitCode);
}

/**
 * Handles non-fatal errors that should be logged but don't stop execution
 * @param {Error | ErrorWithSeverity | string} error - The error to handle
 * @param {string} context - Optional context about where the error occurred
 */
export function handleNonFatalError(error, context = null) {
  if (context) {
    logger.warn(`Warning in ${context}:`);
  }
  
  if (error instanceof ErrorWithSeverity) {
    logger.log(error.severity, error.message);
  } else if (error instanceof Error) {
    logger.warn(error.message);
  } else {
    logger.warn(error);
  }
}

/**
 * Validates required dependencies and throws appropriate errors
 * @param {Object} dependencies - Object with dependency checks
 * @throws {ErrorWithSeverity} If any required dependency is missing
 */
export function validateDependencies(dependencies) {
  for (const [name, value] of Object.entries(dependencies)) {
    if (value === undefined || value === null) {
      throw new ErrorWithSeverity(
        ERROR_MESSAGES[`NO_${name.toUpperCase()}`] || `Missing required dependency: ${name}`,
        LOGGER_LEVELS.error
      );
    }
  }
}

/**
 * Wraps async operations with standardized error handling
 * @param {Function} operation - The async operation to execute
 * @param {string} operationName - Name of the operation for logging
 * @param {number} exitCode - Exit code to use if operation fails
 * @returns {Promise<any>} The result of the operation
 */
export async function withErrorHandling(operation, operationName, exitCode = ERROR_HANDLING.EXIT_CODES.GENERAL_ERROR) {
  try {
    return await operation();
  } catch (error) {
    handleFatalError(error, exitCode, operationName);
  }
}

/**
 * Wraps file operations with standardized error handling
 * @param {Function} fileOperation - The file operation to execute
 * @param {string} filePath - Path of the file being operated on
 * @param {string} operationType - Type of operation (read, write, delete, etc.)
 * @returns {Promise<any>} The result of the operation
 */
export async function withFileErrorHandling(fileOperation, filePath, operationType) {
  try {
    return await fileOperation();
  } catch (error) {
    const errorMessage = `${ERROR_MESSAGES.FILE_WRITE_ERROR}: ${filePath} (${operationType})`;
    throw new ErrorWithSeverity(errorMessage, LOGGER_LEVELS.error);
  }
}

/**
 * Creates a standardized error for missing metadata
 * @param {string} metadataType - Type of metadata that's missing
 * @returns {ErrorWithSeverity}
 */
export function createMetadataError(metadataType) {
  const message = ERROR_MESSAGES[`NO_${metadataType.toUpperCase()}`] || 
                 `${ERROR_MESSAGES.METADATA_LOAD_ERROR}: ${metadataType}`;
  return new ErrorWithSeverity(message, LOGGER_LEVELS.error);
}
