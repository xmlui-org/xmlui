/**
 * Constants and configuration values for the documentation generation scripts
 * 
 * This file contains all the magic strings, configuration objects, and constants
 * that were extracted from multiple files in the documentation generation system:
 * - get-docs.mjs
 * - DocsGenerator.mjs
 * - MetadataProcessor.mjs
 * - utils.mjs
 * - generate-summary-files.mjs
 * - build-pages-map.mjs
 * - build-downloads-map.mjs
 * - logger.mjs
 * 
 * These constants can be imported and used by other documentation generation scripts
 * to ensure consistency and improve maintainability.
 */
import { fromKebabtoReadable } from "./utils.mjs";

export const COMPONENT_STATES = {
  INTERNAL: "internal",
  EXPERIMENTAL: "experimental",
  STABLE: "stable",
  DEPRECATED: "deprecated"
};

export const FILE_EXTENSIONS = {
  MARKDOWN: [".md", ".mdx"],
  METADATA: "_meta.json"
};

export const FOLDER_NAMES = {
  COMPONENTS: "components",
  EXTENSIONS: "extensions",
  COMPONENT_SAMPLES: "component-samples",
  CONTENT: "content",
  PAGES: "pages",
  SRC: "src",
  DIST: "dist",
  META: "meta"
};

export const CONFIG_FILES = {
  COMPONENTS: "components-config.json",
  EXTENSIONS: "extensions-config.json"
};

export const SUMMARY_CONFIG = {
  COMPONENTS: {
    title: "Components Overview",
    fileName: "_overview"
  },
  EXTENSIONS: {
    title: "Extension Overview", 
    fileName: "_overview"
  }
};

export const PACKAGE_PATTERNS = {
  XMLUI_PREFIX: "xmlui-",
  METADATA_SUFFIX: "-metadata.js"
};

export const FILE_NAMES = {
  COMPONENTS_METADATA: "componentsMetadata.ts"
};

export const LOG_MESSAGES = {
  GENERATING_EXTENSION_DOCS: "Generating extension package docs",
  LOADING_CONFIG: "Loading config",
  LOADING_EXTENSION_PACKAGES: "Loading extension packages",
  CLEANING_FOLDER: (folderName) => `Cleaning ${folderName} by removing previous doc files`,
  FILES_DELETED_SUCCESS: "All files have been successfully deleted",
  SKIPPING_INTERNAL_PACKAGE: "Skipping internal extension package:",
  LOADED_EXTENSION_PACKAGE: "Loaded extension package:",
  NO_DIST_FOLDER: (dir) => `No dist folder found for ${dir}`,
  NO_METADATA_OBJECT: (packageName) => `No meta object found for package: ${packageName}.\n Have you built the package?`,
  NO_COMPONENT_METADATA: (packageName) => `No component metadata found in meta object for package: ${packageName}. Check the "${FOLDER_NAMES.META}/${FILE_NAMES.COMPONENTS_METADATA}" file.`
};

export const ERROR_MESSAGES = {
  NO_CONFIG_PATH: "No config path provided",
  WRITE_META_FILE_ERROR: "Could not write _meta file: ",
  UNKNOWN_ERROR: "unknown error"
};

export const METADATA_PROPERTIES = {
  IS_HTML_TAG: "isHtmlTag"
};

export const TEMPLATE_STRINGS = {
  PACKAGE_HEADER: (packageName) => `# ${fromKebabtoReadable(packageName)} Package`
};

// From DocsGenerator.mjs
export const OUTPUT_FILES = {
  METADATA_JSON: "metadata.json",
  PAGES_MAP: "pages.js",
  DOWNLOADS_MAP: "downloads.js"
};

// From MetadataProcessor.mjs
export const METADATA_SECTIONS = {
  IMPORTS: "imports",
  DESCRIPTION: "description",
  CONTEXT_VARS: "contextVars",
  PROPS: "props",
  API: "apis",
  EVENTS: "events",
  STYLES: "styles"
};

export const DIRECTIVE_CONFIG = {
  INDICATOR: "%-",
  SECTION_MAP: {
    imports: "IMPORT",
    description: "DESC",
    props: "PROP",
    events: "EVENT",
    styles: "STYLE",
    apis: "API",
    contextVars: "CONTEXT_VAR"
  }
};

export const SECTION_DISPLAY_NAMES = {
  props: "Properties",
  events: "Events",
  styles: "Styling",
  apis: "Exposed Methods",
  contextVars: "Context Values"
};

export const SECTION_REFERENCE_KEYS = {
  DESCRIPTION: "description",
  DESCRIPTION_REF: "descriptionRef"
};

// From utils.mjs
export const TABLE_CONFIG = {
  STYLES: {
    LEFT: "left",
    CENTER: "center", 
    RIGHT: "right"
  },
  MARKDOWN_ALIGNMENTS: {
    LEFT: ":---",
    CENTER: ":---:",
    RIGHT: "---:",
    DEFAULT: "---"
  },
  DEFAULT_ROW_NUM_HEADER: { value: "Num", style: "center" }
};

export const COMMON_TABLE_HEADERS = {
  VALUE_DESCRIPTION: ["Value", "Description"],
  THEME_VARIABLE_DESCRIPTION: ["Theme Variable", "Description"]
};

// From logger.mjs
export const LOGGER_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error"
};

export const LOGGER_LEVEL_VALUES = {
  ALL: "all",
  NONE: "none"
};

// From generate-summary-files.mjs
export const COMPONENT_STATUS_CONFIG = {
  ACCEPTED_STATUSES: ["stable", "experimental", "deprecated", "in progress"],
  DEFAULT_STATUS: "stable"
};

export const SUMMARY_FILE_CONFIG = {
  COMPONENTS_OVERVIEW_HEADER: "# Components Overview [#components-overview]",
  PACKAGE_COMPONENTS_HEADER: "## Package Components"
};

// From build-pages-map.mjs
export const PAGES_MAP_CONFIG = {
  PATH_CUTOFF: "pages",
  INCLUDED_FILE_EXTENSIONS: [".mdx", ".md"]
};

// From build-downloads-map.mjs
export const DOWNLOADS_MAP_CONFIG = {
  BASE_URL_CUTOFF: "files",
  INCLUDED_FILE_EXTENSIONS: [".zip"]
};
