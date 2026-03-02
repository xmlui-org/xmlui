/**
 * Enhanced configuration management for documentation generation scripts
 * Provides schema validation, standardized loading, and path resolution utilities
 */

import { readFile, access, constants as fsConstants } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve, dirname, isAbsolute } from "path";
import { fileURLToPath } from "url";
import { ErrorWithSeverity, LOGGER_LEVELS } from "./logger.mjs";
import { validateRequiredProperties } from "./pattern-utilities.mjs";
import { createScopedLogger } from "./logging-standards.mjs";

const logger = createScopedLogger("ConfigManager");

/**
 * Configuration schemas for validation
 */
export const CONFIG_SCHEMAS = {
  COMPONENTS: {
    required: ["excludeComponentStatuses"],
    optional: ["includeInternalComponents", "sortOrder", "customTemplates"],
    properties: {
      excludeComponentStatuses: {
        type: "array",
        itemType: "string",
        allowedValues: ["internal", "experimental", "deprecated", "stable", "in progress"]
      },
      includeInternalComponents: {
        type: "boolean",
        default: false
      },
      sortOrder: {
        type: "string",
        allowedValues: ["alphabetical", "status", "category"],
        default: "alphabetical"
      }
    }
  },
  
  EXTENSIONS: {
    required: [],
    optional: ["excludeComponentStatuses", "cleanFolder", "includeByName", "excludeByName"],
    properties: {
      excludeComponentStatuses: {
        type: "array",
        itemType: "string",
        default: []
      },
      cleanFolder: {
        type: "boolean",
        default: false
      },
      includeByName: {
        type: "array",
        itemType: "string",
        default: []
      },
      excludeByName: {
        type: "array",
        itemType: "string",
        default: []
      }
    }
  },

  DOCUMENTATION_GENERATOR: {
    required: ["outputFormat"],
    optional: ["includeExamples", "generateMetadata", "verboseLogging"],
    properties: {
      outputFormat: {
        type: "string",
        allowedValues: ["markdown", "html", "json"],
        default: "markdown"
      },
      includeExamples: {
        type: "boolean",
        default: true
      },
      generateMetadata: {
        type: "boolean", 
        default: true
      },
      verboseLogging: {
        type: "boolean",
        default: false
      }
    }
  }
};

/**
 * Standard configuration file locations
 */
export const CONFIG_LOCATIONS = {
  // Relative to script directory
  SCRIPT_RELATIVE: {
    COMPONENTS: "components-config.json",
    EXTENSIONS: "extensions-config.json",
    GENERATOR: "docs-generator-config.json"
  },
  
  // Relative to project root
  PROJECT_RELATIVE: {
    COMPONENTS: "docs/config/components-config.json",
    EXTENSIONS: "docs/config/extensions-config.json", 
    GENERATOR: "docs/config/docs-generator-config.json"
  },

  // Default locations to search
  SEARCH_PATHS: [
    // Current working directory
    "./",
    // Script directory
    "./scripts/generate-docs/",
    // Docs config directory
    "./docs/config/",
    // Project root config
    "./config/"
  ]
};

/**
 * Path resolution utilities
 */
export class PathResolver {
  constructor(basePath = null) {
    this.basePath = basePath || dirname(fileURLToPath(import.meta.url));
    this.projectRoot = this.findProjectRoot();
    this.workspaceRoot = this.findWorkspaceRoot();
  }

  /**
   * Find the project root by looking for package.json
   */
  findProjectRoot() {
    let currentDir = this.basePath;
    const maxDepth = 10;
    let depth = 0;

    while (depth < maxDepth) {
      try {
        const packageJsonPath = join(currentDir, "package.json");
        // Check if package.json exists
        if (existsSync(packageJsonPath)) {
          return currentDir;
        }
      } catch {
        // Continue searching
      }
      
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break; // Reached filesystem root
      currentDir = parentDir;
      depth++;
    }

    // Fallback: assume we're in a subdirectory of the project
    return join(this.basePath, "../../");
  }

  /**
   * Find the workspace root by looking for specific workspace indicators
   * In this case, look for a directory that contains both 'docs' and 'xmlui' subdirectories
   */
  findWorkspaceRoot() {
    let currentDir = this.projectRoot;
    const maxDepth = 5;
    let depth = 0;

    while (depth < maxDepth) {
      try {
        // Check if this directory contains both 'docs' and 'xmlui' (workspace structure)
        const docsPath = join(currentDir, "docs");
        const xmluiPath = join(currentDir, "xmlui");
        
        if (existsSync(docsPath) && existsSync(xmluiPath)) {
          return currentDir;
        }
      } catch {
        // Continue searching
      }
      
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break; // Reached filesystem root
      currentDir = parentDir;
      depth++;
    }

    // Fallback to project root if no workspace structure found
    return this.projectRoot;
  }

  /**
   * Resolve a path relative to different base locations
   */
  resolvePath(inputPath, relativeTo = "script") {
    if (isAbsolute(inputPath)) {
      return inputPath;
    }

    switch (relativeTo) {
      case "script":
        return resolve(this.basePath, inputPath);
      case "project":
        return resolve(this.projectRoot, inputPath);
      case "workspace":
        return resolve(this.workspaceRoot, inputPath);
      case "cwd":
        return resolve(process.cwd(), inputPath);
      default:
        return resolve(inputPath);
    }
  }

  /**
   * Resolve multiple possible paths and return the first that exists
   */
  async resolveFirstExisting(paths, relativeTo = "script") {
    for (const path of paths) {
      const resolvedPath = this.resolvePath(path, relativeTo);
      try {
        await access(resolvedPath, fsConstants.F_OK);
        return resolvedPath;
      } catch {
        // Path doesn't exist, continue
      }
    }
    return null;
  }

  /**
   * Get standard output paths for different types of generated content
   */
  getOutputPaths() {
    return {
      themes: this.resolvePath("dist/themes", "project"),
      components: this.resolvePath("website/content/docs/reference/components", "workspace"),
      extensions: this.resolvePath("website/content/docs/reference/extensions", "workspace"),
      pages: this.resolvePath("website/content/docs/pages", "workspace"),
      metadata: this.resolvePath("dist/metadata", "project"),
      downloads: this.resolvePath("website/public/downloads", "workspace")
    };
  }
}

/**
 * Configuration validator
 */
export class ConfigValidator {
  /**
   * Validate configuration against schema
   */
  static validateConfig(config, schema, configName = "configuration") {
    if (!config || typeof config !== "object") {
      throw new ErrorWithSeverity(
        `${configName} must be an object`,
        LOGGER_LEVELS.error
      );
    }

    // Check required properties
    validateRequiredProperties(config, schema.required, configName);

    // Validate individual properties
    this.validateProperties(config, schema.properties, configName);

    // Apply defaults for missing optional properties
    this.applyDefaults(config, schema.properties);

    return config;
  }

  /**
   * Validate individual properties against their schemas
   */
  static validateProperties(config, propertySchemas, configName) {
    for (const [propName, propSchema] of Object.entries(propertySchemas)) {
      if (!(propName in config)) continue; // Skip missing optional properties

      const value = config[propName];
      this.validateProperty(value, propSchema, `${configName}.${propName}`);
    }
  }

  /**
   * Validate a single property
   */
  static validateProperty(value, schema, propertyPath) {
    // Special handling for arrays since typeof [] === "object"
    if (schema.type === "array") {
      if (!Array.isArray(value)) {
        throw new ErrorWithSeverity(
          `${propertyPath} must be an array`,
          LOGGER_LEVELS.error
        );
      }

      if (schema.itemType) {
        value.forEach((item, index) => {
          if (typeof item !== schema.itemType) {
            throw new ErrorWithSeverity(
              `${propertyPath}[${index}] must be of type ${schema.itemType}`,
              LOGGER_LEVELS.error
            );
          }
        });
      }
    } else {
      // Type validation for non-arrays
      if (schema.type && typeof value !== schema.type) {
        throw new ErrorWithSeverity(
          `${propertyPath} must be of type ${schema.type}, got ${typeof value}`,
          LOGGER_LEVELS.error
        );
      }
    }

    // Allowed values validation
    if (schema.allowedValues) {
      const isValid = schema.type === "array" 
        ? value.every(v => schema.allowedValues.includes(v))
        : schema.allowedValues.includes(value);

      if (!isValid) {
        throw new ErrorWithSeverity(
          `${propertyPath} must be one of: ${schema.allowedValues.join(", ")}`,
          LOGGER_LEVELS.error
        );
      }
    }
  }

  /**
   * Apply default values for missing properties
   */
  static applyDefaults(config, propertySchemas) {
    for (const [propName, propSchema] of Object.entries(propertySchemas)) {
      if (!(propName in config) && "default" in propSchema) {
        config[propName] = propSchema.default;
      }
    }
  }
}

/**
 * Enhanced configuration loader
 */
export class ConfigurationManager {
  constructor(pathResolver = null) {
    this.pathResolver = pathResolver || new PathResolver();
  }

  /**
   * Load and validate configuration from file
   */
  async loadConfig(configPath, schemaName = null, options = {}) {
    const {
      required = true,
      useSearchPaths = true,
      validate = true,
      transform = null
    } = options;

    let resolvedPath = configPath;

    // If path is not absolute and useSearchPaths is true, search for the file
    if (useSearchPaths && !isAbsolute(configPath)) {
      const searchPaths = [
        configPath,
        ...CONFIG_LOCATIONS.SEARCH_PATHS.map(basePath => join(basePath, configPath))
      ];
      
      resolvedPath = await this.pathResolver.resolveFirstExisting(searchPaths, "project");
      
      if (!resolvedPath) {
        if (required) {
          throw new ErrorWithSeverity(
            `Configuration file not found: ${configPath}. Searched in: ${searchPaths.join(", ")}`,
            LOGGER_LEVELS.error
          );
        } else {
          logger.warn(`Configuration file not found: ${configPath}, using defaults`);
          return {};
        }
      }
    }

    logger.configLoading(resolvedPath);

    try {
      // Check file accessibility
      await access(resolvedPath, fsConstants.R_OK);

      // Read and parse file
      const fileContents = await readFile(resolvedPath, "utf8");
      let config = JSON.parse(fileContents);

      // Apply transformation if provided
      if (transform && typeof transform === "function") {
        config = transform(config);
      }

      // Validate against schema if provided
      if (validate && schemaName && CONFIG_SCHEMAS[schemaName]) {
        config = ConfigValidator.validateConfig(config, CONFIG_SCHEMAS[schemaName], schemaName);
      }

      logger.info(`Configuration loaded successfully: ${resolvedPath}`);
      return config;

    } catch (error) {
      if (error instanceof ErrorWithSeverity) {
        throw error; // Re-throw validation errors
      }

      if (error.code === 'ENOENT') {
        throw new ErrorWithSeverity(
          `Configuration file not found: ${resolvedPath}`,
          LOGGER_LEVELS.error
        );
      } else if (error instanceof SyntaxError) {
        throw new ErrorWithSeverity(
          `Invalid JSON in configuration file: ${resolvedPath} - ${error.message}`,
          LOGGER_LEVELS.error
        );
      } else if (error.code === 'EACCES') {
        throw new ErrorWithSeverity(
          `Permission denied reading configuration file: ${resolvedPath}`,
          LOGGER_LEVELS.error
        );
      } else {
        throw new ErrorWithSeverity(
          `Error loading configuration from ${resolvedPath}: ${error.message}`,
          LOGGER_LEVELS.error
        );
      }
    }
  }

  /**
   * Load components configuration with defaults and validation
   */
  async loadComponentsConfig(configPath = null) {
    const defaultPath = configPath || CONFIG_LOCATIONS.SCRIPT_RELATIVE.COMPONENTS;
    
    const config = await this.loadConfig(defaultPath, "COMPONENTS", {
      transform: (rawConfig) => {
        // Transform excludeComponentStatuses to lowercase for consistency
        if (rawConfig.excludeComponentStatuses) {
          rawConfig.excludeComponentStatuses = rawConfig.excludeComponentStatuses.map(
            status => status.toLowerCase()
          );
        }
        return rawConfig;
      }
    });

    return config;
  }

  /**
   * Load extensions configuration with defaults and validation
   */
  async loadExtensionsConfig(configPath = null) {
    const defaultPath = configPath || CONFIG_LOCATIONS.SCRIPT_RELATIVE.EXTENSIONS;
    return await this.loadConfig(defaultPath, "EXTENSIONS");
  }

  /**
   * Load documentation generator configuration
   */
  async loadGeneratorConfig(configPath = null) {
    const defaultPath = configPath || CONFIG_LOCATIONS.SCRIPT_RELATIVE.GENERATOR;
    return await this.loadConfig(defaultPath, "DOCUMENTATION_GENERATOR", {
      required: false // Generator config is optional
    });
  }

  /**
   * Get all standard configurations
   */
  async loadAllConfigs() {
    const [components, extensions, generator] = await Promise.allSettled([
      this.loadComponentsConfig(),
      this.loadExtensionsConfig(),
      this.loadGeneratorConfig()
    ]);

    const result = {
      components: components.status === "fulfilled" ? components.value : null,
      extensions: extensions.status === "fulfilled" ? extensions.value : null,
      generator: generator.status === "fulfilled" ? generator.value : {}
    };

    // Log any configuration loading failures
    if (components.status === "rejected") {
      logger.warn(`Failed to load components config: ${components.reason.message}`);
    }
    if (extensions.status === "rejected") {
      logger.warn(`Failed to load extensions config: ${extensions.reason.message}`);
    }

    return result;
  }

  /**
   * Merge configuration with environment overrides
   */
  mergeWithEnvironment(config, envPrefix = "XMLUI_DOCS_") {
    const merged = { ...config };
    
    // Check for environment variable overrides
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(envPrefix)) {
        const configKey = key.slice(envPrefix.length).toLowerCase();
        
        try {
          // Try to parse as JSON first (for arrays/objects)
          merged[configKey] = JSON.parse(value);
        } catch {
          // Fall back to string value
          merged[configKey] = value;
        }
      }
    }

    return merged;
  }
}

// Create default instances for easy use
export const pathResolver = new PathResolver();
export const configManager = new ConfigurationManager(pathResolver);

// Backward compatibility: export the original loadConfig function
export default async function loadConfig(configPath) {
  return await configManager.loadConfig(configPath, null, {
    transform: (rawConfig) => {
      const { excludeComponentStatuses, ...data } = rawConfig;
      return {
        excludeComponentStatuses: excludeComponentStatuses?.map(status => status.toLowerCase()) || [],
        ...data,
      };
    }
  });
}
