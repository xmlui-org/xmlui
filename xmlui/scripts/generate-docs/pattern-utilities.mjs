/**
 * Common utilities for documentation generation scripts
 * Provides reusable functions for common patterns found across scripts
 */

import { writeFileSync } from "fs";
import { withFileErrorHandling } from "./error-handling.mjs";

/**
 * Common iteration utilities
 */

/**
 * Safely iterate over object entries with sorting and optional filtering
 * @param {Object} obj - Object to iterate over
 * @param {Function} callback - Callback function to execute for each entry
 * @param {Object} options - Options for iteration
 * @param {boolean} options.sort - Whether to sort entries by key (default: true)
 * @param {Function} options.filter - Optional filter function for entries
 * @param {Function} options.keyTransform - Optional key transformation function
 * @param {boolean} options.async - Whether to handle async callbacks (default: false)
 */
export async function iterateObjectEntries(obj, callback, options = {}) {
  const { sort = true, filter, keyTransform, async: isAsync = false } = options;
  
  if (!obj || typeof obj !== 'object') {
    return;
  }
  
  let entries = Object.entries(obj);
  
  if (sort) {
    entries = entries.sort(([a], [b]) => a.localeCompare(b));
  }
  
  if (filter) {
    entries = entries.filter(filter);
  }
  
  if (isAsync) {
    for (const [key, value] of entries) {
      const transformedKey = keyTransform ? keyTransform(key) : key;
      await callback(transformedKey, value, key);
    }
  } else {
    entries.forEach(([key, value]) => {
      const transformedKey = keyTransform ? keyTransform(key) : key;
      callback(transformedKey, value, key);
    });
  }
}

/**
 * Safely iterate over array with optional sorting and filtering
 * @param {Array} array - Array to iterate over
 * @param {Function} callback - Callback function to execute for each item
 * @param {Object} options - Options for iteration
 * @param {boolean} options.sort - Whether to sort array (default: false)
 * @param {Function} options.sortCompareFn - Custom sort compare function
 * @param {Function} options.filter - Optional filter function
 */
export function iterateArray(array, callback, options = {}) {
  const { sort = false, sortCompareFn, filter } = options;
  
  if (!Array.isArray(array)) {
    return;
  }
  
  let items = [...array]; // Create a copy to avoid mutation
  
  if (sort) {
    items = sortCompareFn ? items.sort(sortCompareFn) : items.sort();
  }
  
  if (filter) {
    items = items.filter(filter);
  }
  
  items.forEach((item, index) => {
    callback(item, index);
  });
}

/**
 * Theme variable processing utilities
 */

/**
 * Extract theme variables from a component's theme configuration
 * @param {Object} component - Component metadata
 * @param {string} themeSection - Theme section to extract ('light', 'dark', or null for base)
 * @returns {Object} Extracted theme variables
 */
export function extractThemeVars(component, themeSection = null) {
  const { themeVars, defaultThemeVars } = component;
  
  if (!themeVars && !defaultThemeVars) {
    return {};
  }
  
  if (themeSection) {
    // Extract specific theme section (light/dark)
    const sectionVars = defaultThemeVars?.[themeSection] ?? {};
    return Object.keys(sectionVars).reduce((acc, key) => {
      acc[key] = sectionVars[key] ?? null;
      return acc;
    }, {});
  } else {
    // Extract base theme variables (excluding light/dark sections)
    const themeVarKeys = [
      ...Object.keys(themeVars ?? {}),
      ...Object.keys(defaultThemeVars ?? {})
    ];
    
    const baseKeys = themeVarKeys.filter(key => !["light", "dark"].includes(key));
    
    return baseKeys.reduce((acc, key) => {
      acc[key] = defaultThemeVars?.[key] ?? null;
      return acc;
    }, {});
  }
}

/**
 * Process theme variables for all components
 * @param {Object} components - Component metadata collection
 * @param {Function} logger - Logger instance for progress reporting
 * @returns {Object} Processed theme variables with base, light, and dark sections
 */
export function processComponentThemeVars(components, logger) {
  let baseVars = {};
  let lightVars = {};
  let darkVars = {};
  
  iterateObjectEntries(components, (componentKey, component) => {
    if (logger?.componentProcessing) {
      logger.componentProcessing(componentKey);
    }
    
    if (component.themeVars || component.defaultThemeVars) {
      // Extract base theme variables
      const componentBaseVars = extractThemeVars(component);
      baseVars = { ...baseVars, ...componentBaseVars };
      
      // Extract light theme variables
      const componentLightVars = extractThemeVars(component, 'light');
      lightVars = { ...lightVars, ...componentLightVars };
      
      // Extract dark theme variables
      const componentDarkVars = extractThemeVars(component, 'dark');
      darkVars = { ...darkVars, ...componentDarkVars };
    }
  });
  
  return {
    base: baseVars,
    light: lightVars,
    dark: darkVars
  };
}

/**
 * File writing utilities
 */

/**
 * Write a file with standardized error handling and logging
 * @param {string} filePath - Path to write the file
 * @param {string} content - Content to write
 * @param {Object} logger - Logger instance
 * @param {Object} options - Writing options
 * @param {string} options.operation - Description of the operation for logging
 * @returns {Promise<void>}
 */
export async function writeFileWithLogging(filePath, content, logger, options = {}) {
  const { operation = "file write" } = options;
  
  if (logger?.fileWritten) {
    logger.fileWritten(filePath);
  }
  
  await withFileErrorHandling(
    () => writeFileSync(filePath, content),
    filePath,
    "write"
  );
}

/**
 * Generate export statements from an array of items
 * @param {Array} items - Array of items with id and path properties
 * @param {Object} options - Generation options
 * @param {string} options.template - Template for export statement (default: 'export const {id} = "{path}";')
 * @returns {string} Generated export statements
 */
export function generateExportStatements(items, options = {}) {
  const { template = 'export const {id} = "{path}";' } = options;
  
  return items.reduce((acc, item) => {
    const statement = template
      .replace('{id}', item.id)
      .replace('{path}', item.path);
    acc += statement + '\n';
    return acc;
  }, '');
}

/**
 * Component metadata processing utilities
 */

/**
 * Process component section entries (props, apis, events) with common pattern
 * @param {Object} sectionData - Section data (props, apis, or events)
 * @param {Function} processingCallback - Callback to process each entry
 * @param {Object} options - Processing options
 * @param {Function} options.filter - Filter function for entries
 * @param {boolean} options.skipInternal - Skip internal entries (default: true)
 * @returns {Array} Processed entries
 */
export function processComponentSection(sectionData, processingCallback, options = {}) {
  const { filter, skipInternal = true } = options;
  
  if (!sectionData || Object.keys(sectionData).length === 0) {
    return [];
  }
  
  const results = [];
  
  iterateObjectEntries(sectionData, (entryName, entryData) => {
    // Skip internal entries if requested
    if (skipInternal && entryData.isInternal) {
      return;
    }
    
    // Apply custom filter if provided
    if (filter && !filter(entryName, entryData)) {
      return;
    }
    
    const result = processingCallback(entryName, entryData);
    if (result !== undefined) {
      results.push(result);
    }
  });
  
  return results;
}

/**
 * Duplicate handling utilities
 */

/**
 * Process duplicates with standardized logging
 * @param {Array} duplicates - Array of duplicate items
 * @param {Object} logger - Logger instance
 * @param {string} itemType - Type description for logging (e.g., "entries", "components")
 * @param {Function} duplicateFormatter - Function to format duplicate info for logging
 */
export function processDuplicatesWithLogging(duplicates, logger, itemType = "entries", duplicateFormatter = null) {
  if (!duplicates.length) {
    return;
  }
  
  if (logger?.warn) {
    logger.warn(`Duplicate ${itemType} found when collecting IDs and paths:`);
    duplicates.forEach((item) => {
      const formattedInfo = duplicateFormatter ? duplicateFormatter(item) : `ID: ${item.id} - Path: ${item.path}`;
      logger.warn(`Removed duplicate ${formattedInfo}`);
    });
  }
}

/**
 * Validation utilities
 */

/**
 * Validate that an object has required properties
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredProps - Array of required property names
 * @param {string} objName - Name of object for error messages
 * @throws {Error} If validation fails
 */
export function validateRequiredProperties(obj, requiredProps, objName = "object") {
  if (!obj || typeof obj !== 'object') {
    throw new Error(`${objName} is required and must be an object`);
  }
  
  const missingProps = requiredProps.filter(prop => !(prop in obj));
  if (missingProps.length > 0) {
    throw new Error(`${objName} is missing required properties: ${missingProps.join(', ')}`);
  }
}
