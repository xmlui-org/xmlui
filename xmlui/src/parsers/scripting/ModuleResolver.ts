/**
 * Interface representing a resolved module with content
 */
export interface ResolvedModule {
  /**
   * The absolute path to the module
   */
  path: string;

  /**
   * The content of the module file
   */
  content: string;

  /**
   * The timestamp when the module was last modified (milliseconds)
   */
  lastModified: number;
}

/**
 * Type for custom fetch function (useful for testing)
 */
export type ModuleFetcher = (path: string) => Promise<string>;

/**
 * Module resolver for handling import paths in XMLUI scripts
 */
export class ModuleResolver {
  /**
   * Cache for fetched modules
   */
  private static moduleCache: Map<string, ResolvedModule> = new Map();

  /**
   * Custom fetch function (defaults to reading from filesystem)
   */
  private static customFetcher: ModuleFetcher | null = null;

  /**
   * Stack to track imports currently being resolved (for circular detection)
   */
  private static importStack: string[] = [];

  /**
   * Sets a custom fetcher function (useful for testing)
   * @param fetcher The fetcher function, or null to use default
   */
  static setCustomFetcher(fetcher: ModuleFetcher | null): void {
    this.customFetcher = fetcher;
  }

  /**
   * Clears the module cache
   */
  static clearCache(): void {
    this.moduleCache.clear();
  }

  /**
   * Resets the import stack (call this when starting a fresh parse)
   */
  static resetImportStack(): void {
    this.importStack = [];
  }

  /**
   * Detects circular imports by tracking the resolution stack
   * @param modulePath The module path being resolved
   * @returns The circular import chain if detected, or null
   */
  private static detectCircularImport(modulePath: string): string[] | null {
    const index = this.importStack.indexOf(modulePath);
    if (index !== -1) {
      // Circular import detected - return the chain
      return [...this.importStack.slice(index), modulePath];
    }
    return null;
  }

  /**
   * Fetches and caches a module
   * @param modulePath The absolute path to the module (must be resolved first)
   * @returns The resolved module with content
   * @throws Error if module cannot be fetched or circular import detected
   */
  static async resolveModule(modulePath: string): Promise<ResolvedModule> {
    // Check for circular import
    const circularChain = this.detectCircularImport(modulePath);
    if (circularChain) {
      const chainStr = circularChain.join(" → ");
      throw new Error(`Circular import detected: ${chainStr}`);
    }

    // Check cache first (don't add to stack if cached)
    if (this.moduleCache.has(modulePath)) {
      return this.moduleCache.get(modulePath)!;
    }

    // Add to import stack
    this.importStack.push(modulePath);

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
      this.importStack.pop();

      throw new Error(
        `Failed to fetch module at ${modulePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Remove from stack after successful fetch
    this.importStack.pop();

    const resolved: ResolvedModule = {
      path: modulePath,
      content,
      lastModified: Date.now(),
    };

    // Cache the result
    this.moduleCache.set(modulePath, resolved);

    return resolved;
  }

  /**
   * Resolves an import path and fetches the module
   * @param importPath The import path (e.g., "./helpers.xs")
   * @param fromFile The source file path
   * @returns The resolved module with content
   * @throws Error if path or fetch fails
   */
  static async resolveAndFetchModule(
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
    // Validate inputs
    if (!importPath) {
      throw new Error("Import path cannot be empty");
    }

    // Only handle relative paths (starting with ./ or ../)
    if (!importPath.startsWith("./") && !importPath.startsWith("../")) {
      throw new Error(
        `Import path must be relative (start with ./ or ../): ${importPath}`,
      );
    }

    // --- Check if fromFile is a URL (for buildless apps)
    if (fromFile.startsWith('http://') || fromFile.startsWith('https://')) {
      try {
        const baseUrl = new URL(fromFile);
        const resolvedUrl = new URL(importPath, baseUrl);
        return resolvedUrl.toString();
      } catch (e) {
        throw new Error(`Failed to resolve URL: ${importPath} from ${fromFile}`);
      }
    }

    // Get the directory of the source file
    const fromDir = this.getDirectory(fromFile);

    // Resolve the path by combining directory with import path
    return this.normalizePath(
      this.joinPaths(fromDir, importPath),
    );
  }

  /**
   * Gets the directory portion of a file path
   * @param filePath The file path
   * @returns The directory path (without trailing slash)
   */
  private static getDirectory(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      // No directory separator, file is in root
      return "";
    }
    // Return everything up to but not including the last slash
    // If that's empty (root dir), return "/" to represent root
    const dir = filePath.substring(0, lastSlashIndex);
    return dir || "/";
  }

  /**
   * Joins two path segments together
   * @param basePath The base path
   * @param relativePath The relative path
   * @returns The joined path
   */
  private static joinPaths(basePath: string, relativePath: string): string {
    // Remove leading ./ from relative path for consistency
    let cleaned = relativePath;
    while (cleaned.startsWith("./")) {
      cleaned = cleaned.substring(2);
    }

    if (!basePath) {
      return cleaned;
    }

    // If basePath is "/", don't add extra slash
    if (basePath === "/") {
      return "/" + cleaned;
    }

    return basePath + "/" + cleaned;
  }

  /**
   * Normalizes a path by removing . and .. segments
   * @param path The path to normalize
   * @returns The normalized path
   * @throws Error if path tries to go above root
   */
  private static normalizePath(path: string): string {
    // Remove leading slash for processing
    const isAbsolute = path.startsWith("/");
    const workPath = isAbsolute ? path.substring(1) : path;

    // Split into segments
    const segments = workPath.split("/").filter((seg) => seg !== "");

    const normalized: string[] = [];

    for (const segment of segments) {
      if (segment === ".") {
        // Current directory - skip
        continue;
      } else if (segment === "..") {
        // Parent directory
        if (normalized.length === 0) {
          throw new Error("Import path goes above root directory");
        }
        normalized.pop();
      } else {
        // Regular segment
        normalized.push(segment);
      }
    }

    // Reconstruct path
    let result = normalized.join("/");
    if (isAbsolute) {
      result = "/" + result;
    }

    return result;
  }

  /**
   * Checks if two resolved paths are equivalent
   * @param path1 First path
   * @param path2 Second path
   * @returns True if paths are equivalent after normalization
   */
  static arePathsEqual(path1: string, path2: string): boolean {
    return this.normalizePath(path1) === this.normalizePath(path2);
  }

  /**
   * Gets the file name from a path
   * @param filePath The file path
   * @returns The file name with extension
   */
  static getFileName(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      return filePath;
    }
    return filePath.substring(lastSlashIndex + 1);
  }
}
