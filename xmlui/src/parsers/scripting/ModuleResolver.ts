import type { ResolvedModule, ModuleFetcher } from "./types";
import { ModuleCache } from "./ModuleCache";
import { CircularDependencyDetector } from "./CircularDependencyDetector";
import { PathResolver } from "./PathResolver";

// Re-export types for backward compatibility
export type { ResolvedModule, ModuleFetcher } from "./types";

/**
 * Module resolver for handling import paths in XMLUI scripts
 */
export class ModuleResolver {
  /**
   * Custom fetch function (defaults to reading from filesystem)
   */
  private static customFetcher: ModuleFetcher | null = null;

  /**
   * Sets a custom fetcher function (useful for testing)
   * @param fetcher The fetcher function, or null to use default
   */
  static setCustomFetcher(fetcher: ModuleFetcher | null): void {
    this.customFetcher = fetcher;
  }

  /**
   * Clears the module cache
   * @deprecated Use ModuleCache.clearResolved() or ModuleCache.clear() instead
   */
  static clearCache(): void {
    ModuleCache.clearResolved();
  }

  /**
   * Resets the import stack (call this when starting a fresh parse)
   * @deprecated Use CircularDependencyDetector.reset() instead
   */
  static resetImportStack(): void {
    CircularDependencyDetector.reset();
  }

  /**
   * Fetches and caches a module
   * @param modulePath The absolute path to the module (must be resolved first)
   * @returns The resolved module with content
   * @throws Error if module cannot be fetched or circular import detected
   */
  static async resolveModule(modulePath: string): Promise<ResolvedModule> {
    // Check for circular import
    const circularChain = CircularDependencyDetector.checkCircular(modulePath);
    if (circularChain) {
      const chainStr = circularChain.join(" → ");
      throw new Error(`Circular import detected: ${chainStr}`);
    }

    // Check cache first (don't add to stack if cached)
    if (ModuleCache.hasResolved(modulePath)) {
      return ModuleCache.getResolved(modulePath)!;
    }

    // Add to import stack
    CircularDependencyDetector.push(modulePath);

    let content: string;

    try {
      if (this.customFetcher) {
        // Use custom fetcher for testing
        content = await this.customFetcher(modulePath);
      } else {
        // Default: use dynamic import to read file content
        // In a real environment, this would use file system APIs
        throw new Error(
          `No custom fetcher configured. Cannot fetch module: ${modulePath}`,
        );
      }
    } catch (error) {
      // Remove from stack on error
      CircularDependencyDetector.pop();

      throw new Error(
        `Failed to fetch module at ${modulePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Remove from stack after successful fetch
    CircularDependencyDetector.pop();

    const resolved: ResolvedModule = {
      path: modulePath,
      content,
      lastModified: Date.now(),
    };

    // Cache the result
    ModuleCache.setResolved(modulePath, resolved);

    return resolved;
  }

  /**
   * Resolves an import path and fetches the module
   * @param importPath The import path (e.g., "./helpers.xs")
   * @param fromFile The source file path
   * @returns The resolved module with content
   * @throws Error if path or fetch fails
   */
  static resolveAndFetchModule(
    importPath: string,
    fromFile: string,
  ): Promise<ResolvedModule> {
    const resolvedPath = this.resolvePath(importPath, fromFile);
    return this.resolveModule(resolvedPath);
  }

  /**
   * Resolves a relative import path from a source file to an absolute path
   * @param importPath The import path (e.g., "./helpers.xs", "../utils.xs")
   * @param fromFile The source file path (e.g., "/components/Invoice.xmlui.xs")
   * @returns The resolved absolute path
   * @throws Error if the path is invalid
   */
  static resolvePath(importPath: string, fromFile: string): string {
    // Delegate to PathResolver for clean separation of concerns
    return PathResolver.resolve(importPath, fromFile);
  }

  /**
   * Gets the directory portion of a file path
   * @param filePath The file path
   * @returns The directory path (without trailing slash)
   */
  private static getDirectory(filePath: string): string {
    return PathResolver.getDirectory(filePath);
  }

  /**
   * Checks if two resolved paths are equivalent
   * @param path1 First path
   * @param path2 Second path
   * @returns True if paths are equivalent after normalization
   */
  static arePathsEqual(path1: string, path2: string): boolean {
    return PathResolver.normalizePath(path1) === PathResolver.normalizePath(path2);
  }

  /**
   * Gets the file name from a path
   * @param filePath The file path
   * @returns The file name with extension
   */
  static getFileName(filePath: string): string {
    return PathResolver.getFileName(filePath);
  }
}
