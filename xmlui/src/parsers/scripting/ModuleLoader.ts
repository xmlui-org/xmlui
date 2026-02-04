import type { ScriptModule } from "../../components-core/script-runner/ScriptingSourceTree";
import type { ModuleFetcher, ModuleErrors, Result } from "./types";
import { ok, err } from "./types";
import { ModuleResolver } from "./ModuleResolver";
import { PathResolver } from "./PathResolver";
import { parseScriptModuleAsync } from "./modules";
import { ModuleCache } from "./ModuleCache";
import { CircularDependencyDetector } from "./CircularDependencyDetector";

/**
 * Options for loading a module
 */
export interface ModuleLoadOptions {
  /**
   * Custom fetcher function for loading module content
   * If not provided, the system will use the default fetcher (must be set via ModuleResolver.setCustomFetcher)
   */
  fetcher?: ModuleFetcher;

  /**
   * Whether to allow imports in the module (default: true)
   */
  allowImports?: boolean;

  /**
   * Base URL or path for resolving relative imports
   */
  baseUrl?: string;

  /**
   * Whether to skip cache and force re-parsing (default: false)
   */
  skipCache?: boolean;
}

/**
 * Result of a module load operation
 */
export type ModuleLoadResult = Result<ScriptModule, ModuleErrors>;

/**
 * High-level module loader that orchestrates the complete module loading pipeline:
 * 1. **Path Resolution** - Converts relative imports to absolute paths/URLs
 * 2. **Module Fetching** - Retrieves module content from file system or network
 * 3. **Parsing & Validation** - Parses source code into AST with validation
 * 4. **Circular Detection** - Detects and prevents circular import chains
 * 5. **Caching** - Stores both fetched and parsed modules for reuse
 *
 * This is the primary entry point for all module loading in XMLUI scripts.
 * It provides a clean, type-safe API with `Result<T, E>` error handling.
 *
 * @example
 * ```typescript
 * // Load a module from a file path
 * const result = await ModuleLoader.loadModule('/src/utils.js', {
 *   fetcher: async (path) => await fs.readFile(path, 'utf-8'),
 *   baseUrl: '/src/scripts'
 * });
 *
 * if (result.ok) {
 *   console.log('Functions:', Object.keys(result.value.functions));
 * } else {
 *   console.error('Parse errors:', result.error);
 * }
 *
 * // Load and parse source code directly
 * const sourceResult = await ModuleLoader.loadFromSource(
 *   'inline-script',
 *   `function greet() { return 'hello'; }`,
 *   { allowImports: false }
 * );
 *
 * // Clear all caches between test runs
 * ModuleLoader.clearAllCaches();
 * ```
 */
export class ModuleLoader {
  /**
   * Loads a module from a given path with full import support
   * 
   * @param path The path to the module (can be relative or absolute, file path or URL)
   * @param options Loading options
   * @returns A Result containing either the parsed module or errors
   * 
   * @example
   * ```typescript
   * const result = await ModuleLoader.loadModule('utils.js', { 
   *   fetcher: async (path) => await readFile(path, 'utf-8'),
   *   baseUrl: '/src/scripts'
   * });
   * 
   * if (result.ok) {
   *   console.log('Module loaded:', result.value);
   * } else {
   *   console.error('Errors:', result.error);
   * }
   * ```
   */
  static async loadModule(
    path: string,
    options: ModuleLoadOptions = {}
  ): Promise<ModuleLoadResult> {
    const {
      fetcher,
      allowImports = true,
      baseUrl,
      skipCache = false,
    } = options;

    try {
      // --- Phase 1: Path Resolution ---
      let resolvedPath = path;
      
      if (baseUrl && !PathResolver.isUrl(path) && !PathResolver.isFilePath(path)) {
        // Resolve relative path against base URL
        resolvedPath = PathResolver.resolve(path, baseUrl);
      }

      // Check cache first (unless explicitly skipped)
      if (!skipCache && ModuleCache.hasParsed(resolvedPath)) {
        const cached = ModuleCache.getParsed(resolvedPath);
        if (cached && !(cached instanceof Promise)) {
          return ok(cached);
        }
      }

      // --- Phase 2: Fetch Module Content ---
      if (fetcher) {
        ModuleResolver.setCustomFetcher(fetcher);
      }

      const content = await this.fetchModuleContent(resolvedPath);

      // --- Phase 3: Parse Module ---
      if (!allowImports) {
        // Simple parsing without import support
        const result = await this.parseWithoutImports(resolvedPath, content);
        return result;
      }

      // Full parsing with import resolution
      const result = await this.parseWithImports(resolvedPath, content, fetcher);
      return result;

    } catch (error) {
      // Convert thrown errors to Result type
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errors: ModuleErrors = {
        [path]: [
          {
            code: "MODULE_LOAD_ERROR" as any,
            text: errorMessage,
            position: 0,
            end: 0,
            line: 1,
            column: 1,
          },
        ],
      };
      return err(errors);
    }
  }

  /**
   * Loads a module from source code directly (bypasses fetching)
   * 
   * @param moduleName Name/identifier for this module
   * @param source The source code to parse
   * @param options Loading options
   * @returns A Result containing either the parsed module or errors
   */
  static async loadFromSource(
    moduleName: string,
    source: string,
    options: ModuleLoadOptions = {}
  ): Promise<ModuleLoadResult> {
    const { fetcher, allowImports = true, skipCache = false } = options;

    try {
      // Check cache first (unless explicitly skipped)
      if (!skipCache && ModuleCache.hasParsed(moduleName)) {
        const cached = ModuleCache.getParsed(moduleName);
        if (cached && !(cached instanceof Promise)) {
          return ok(cached);
        }
      }

      if (fetcher) {
        ModuleResolver.setCustomFetcher(fetcher);
      }

      // Parse module
      if (!allowImports) {
        const result = await this.parseWithoutImports(moduleName, source);
        return result;
      }

      const result = await this.parseWithImports(moduleName, source, fetcher);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errors: ModuleErrors = {
        [moduleName]: [
          {
            code: "MODULE_PARSE_ERROR" as any,
            text: errorMessage,
            position: 0,
            end: 0,
            line: 1,
            column: 1,
          },
        ],
      };
      return err(errors);
    }
  }

  /**
   * Clears all module caches
   * Call this between test suites or when you want to reload modules
   */
  static clearAllCaches(): void {
    ModuleCache.clear();
    CircularDependencyDetector.reset();
  }

  /**
   * Checks if a module is currently loaded in cache
   * @param path The module path to check
   * @returns True if the module is cached
   */
  static isCached(path: string): boolean {
    return ModuleCache.hasParsed(path);
  }

  // --- Private Helper Methods ---

  /**
   * Fetches module content from a resolved path
   */
  private static async fetchModuleContent(resolvedPath: string): Promise<string> {
    const resolved = await ModuleResolver.resolveModule(resolvedPath);
    return resolved.content;
  }

  /**
   * Parses a module without import support
   */
  private static async parseWithoutImports(
    moduleName: string,
    source: string
  ): Promise<ModuleLoadResult> {
    // Use a no-op fetcher for modules without imports
    const noopFetcher: ModuleFetcher = async () => {
      throw new Error("Imports are not allowed in this module");
    };

    const result = await parseScriptModuleAsync(moduleName, source, noopFetcher);
    
    if (this.isModuleErrors(result)) {
      return err(result);
    }
    
    return ok(result);
  }

  /**
   * Parses a module with full import support
   */
  private static async parseWithImports(
    moduleName: string,
    source: string,
    fetcher?: ModuleFetcher
  ): Promise<ModuleLoadResult> {
    // Use provided fetcher or rely on the one set in ModuleResolver
    const effectiveFetcher = fetcher || (async (path: string) => {
      const resolved = await ModuleResolver.resolveModule(path);
      return resolved.content;
    });

    const result = await parseScriptModuleAsync(moduleName, source, effectiveFetcher);
    
    if (this.isModuleErrors(result)) {
      return err(result);
    }
    
    return ok(result);
  }

  /**
   * Type guard to check if result is ModuleErrors
   */
  private static isModuleErrors(
    result: ScriptModule | ModuleErrors
  ): result is ModuleErrors {
    return (result as any).type !== "ScriptModule";
  }
}
