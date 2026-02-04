/**
 * PathResolver: Handles path resolution for both file paths and URLs
 * Uses strategy pattern to separate concerns for different path types.
 */

/**
 * Strategy interface for path resolution
 */
interface PathResolutionStrategy {
  /**
   * Resolves a relative import path from a source file/URL to an absolute path/URL
   * @param importPath The import path (e.g., "./helpers.xs", "../utils.xs")
   * @param fromFileOrUrl The source file path or URL
   * @returns The resolved absolute path or URL
   * @throws Error if resolution fails
   */
  resolve(importPath: string, fromFileOrUrl: string): string;
}

/**
 * File path resolution strategy for traditional file system paths
 */
class FilePathResolver implements PathResolutionStrategy {
  /**
   * Gets the directory of a file path
   * @param filePath The file path
   * @returns The directory path
   */
  private getDirectory(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      // No slash = file in current/root directory
      return "";
    }
    // Return everything up to but not including the last slash
    // If that's empty (root dir), return "/" to represent root
    const dir = filePath.substring(0, lastSlashIndex);
    return dir || "/";
  }

  /**
   * Normalizes a path by removing . and .. segments
   * @param path The path to normalize
   * @returns The normalized path
   * @throws Error if path tries to go above root
   */
  private normalizePath(path: string): string {
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
   * Combines a base directory with a relative path
   * @param baseDir The base directory
   * @param relativePath The relative path to combine
   * @returns The combined path
   */
  private combinePaths(baseDir: string, relativePath: string): string {
    // Remove leading ./ from relative path for consistency
    let cleaned = relativePath;
    while (cleaned.startsWith("./")) {
      cleaned = cleaned.substring(2);
    }

    if (!baseDir) {
      // Empty base directory means current/relative
      return cleaned;
    }

    // If baseDir is "/", don't add extra slash
    if (baseDir === "/") {
      return "/" + cleaned;
    }

    return baseDir + "/" + cleaned;
  }

  /**
   * Resolves a relative file path from a source file
   * @param importPath The import path (e.g., "./helpers.xs", "../utils.xs")
   * @param fromFile The source file path
   * @returns The resolved absolute path
   * @throws Error if resolution fails
   */
  resolve(importPath: string, fromFile: string): string {
    // Get the directory of the source file
    const fromDir = this.getDirectory(fromFile);

    // Combine directory with import path
    const combined = this.combinePaths(fromDir, importPath);

    // Normalize to resolve . and ..
    return this.normalizePath(combined);
  }
}

/**
 * URL resolution strategy for HTTP/HTTPS URLs
 */
class URLPathResolver implements PathResolutionStrategy {
  /**
   * Resolves a relative import path from a source URL
   * @param importPath The import path (e.g., "./helpers.xs", "../utils.xs")
   * @param fromUrl The source URL
   * @returns The resolved absolute URL
   * @throws Error if resolution fails
   */
  resolve(importPath: string, fromUrl: string): string {
    try {
      const baseUrl = new URL(fromUrl);
      const resolvedUrl = new URL(importPath, baseUrl);
      return resolvedUrl.toString();
    } catch (e) {
      throw new Error(`Failed to resolve URL: ${importPath} from ${fromUrl}`);
    }
  }
}

/**
 * Central path resolver that uses strategy pattern to handle both files and URLs
 */
export class PathResolver {
  private static filePathResolver = new FilePathResolver();
  private static urlPathResolver = new URLPathResolver();

  /**
   * Determines which resolution strategy to use based on input
   * @param fromFileOrUrl The source file path or URL
   * @returns The appropriate resolution strategy
   */
  private static getStrategy(
    fromFileOrUrl: string,
  ): PathResolutionStrategy {
    if (
      fromFileOrUrl.startsWith("http://") ||
      fromFileOrUrl.startsWith("https://")
    ) {
      return this.urlPathResolver;
    }
    return this.filePathResolver;
  }

  /**
   * Resolves a relative import path from a source file or URL to an absolute path/URL
   * @param importPath The import path (e.g., "./helpers.xs", "../utils.xs")
   * @param fromFileOrUrl The source file path or URL
   * @returns The resolved absolute path or URL
   * @throws Error if the path is invalid or resolution fails
   */
  static resolve(importPath: string, fromFileOrUrl: string): string {
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

    // Get appropriate strategy and resolve
    const strategy = this.getStrategy(fromFileOrUrl);
    return strategy.resolve(importPath, fromFileOrUrl);
  }

  /**
   * Checks if a given string is a URL
   * @param path The path to check
   * @returns True if the path is a URL
   */
  static isUrl(path: string): boolean {
    return path.startsWith("http://") || path.startsWith("https://");
  }

  /**
   * Checks if a given string is a file path
   * @param path The path to check
   * @returns True if the path is a file path
   */
  static isFilePath(path: string): boolean {
    return !this.isUrl(path);
  }

  /**
   * Gets the file name from a path or URL
   * @param pathOrUrl The file path or URL
   * @returns The file name with extension
   */
  static getFileName(pathOrUrl: string): string {
    // For URLs, extract from pathname
    if (this.isUrl(pathOrUrl)) {
      try {
        const url = new URL(pathOrUrl);
        const pathname = url.pathname;
        const lastSlashIndex = pathname.lastIndexOf("/");
        if (lastSlashIndex === -1) {
          return pathname;
        }
        return pathname.substring(lastSlashIndex + 1);
      } catch {
        // Fall through to path logic
      }
    }

    // For file paths
    const lastSlashIndex = pathOrUrl.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      return pathOrUrl;
    }
    return pathOrUrl.substring(lastSlashIndex + 1);
  }

  /**
   * Gets the directory from a file path or URL pathname
   * @param pathOrUrl The file path or URL
   * @returns The directory path
   */
  static getDirectory(pathOrUrl: string): string {
    // For URLs, extract directory from pathname
    if (this.isUrl(pathOrUrl)) {
      try {
        const url = new URL(pathOrUrl);
        const pathname = url.pathname;
        const lastSlashIndex = pathname.lastIndexOf("/");
        if (lastSlashIndex === -1) {
          return "/";
        }
        // Reconstruct URL with directory only
        const dirPath = pathname.substring(0, lastSlashIndex);
        return `${url.protocol}//${url.host}${dirPath}`;
      } catch {
        // Fall through to path logic
      }
    }

    // For file paths - use internal resolver
    const resolver = new FilePathResolver();
    return resolver["getDirectory"](pathOrUrl);
  }

  /**
   * Normalizes a file path by resolving . and .. segments
   * @param path The path to normalize
   * @returns The normalized path
   * @throws Error if path tries to go above root
   */
  static normalizePath(path: string): string {
    if (this.isUrl(path)) {
      // URLs are already normalized by browser/runtime
      return path;
    }

    // Use internal resolver for file paths
    const resolver = new FilePathResolver();
    return resolver["normalizePath"](path);
  }
}
