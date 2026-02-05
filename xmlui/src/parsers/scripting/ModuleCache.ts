import type { ScriptModule } from "../../components-core/script-runner/ScriptingSourceTree";
import type { ResolvedModule } from "./types";
import { CircularDependencyDetector } from "./CircularDependencyDetector";

/**
 * Centralized cache management for module loading system.
 * Handles both resolved modules (with content) and parsed modules (AST).
 */
export class ModuleCache {
  /**
   * Cache for resolved modules (path -> content + metadata)
   */
  private static resolvedModules: Map<string, ResolvedModule> = new Map();

  /**
   * Cache for parsed modules (path -> parsed AST)
   * Can also store promises to prevent duplicate parsing
   */
  private static parsedModules: Map<string, ScriptModule | Promise<ScriptModule | any>> = new Map();

  /**
   * Track modules currently being parsed to detect circular dependencies at parse level.
   * This must be tracked separately from parsedModules cache because a promise stored
   * in parsedModules doesn't indicate whether the module is still being parsed.
   */
  private static currentlyParsing: Set<string> = new Set();

  /**
   * Gets a resolved module from cache
   * @param path The module path
   * @returns The resolved module or undefined if not cached
   */
  static getResolved(path: string): ResolvedModule | undefined {
    return this.resolvedModules.get(path);
  }

  /**
   * Sets a resolved module in cache
   * @param path The module path
   * @param module The resolved module
   */
  static setResolved(path: string, module: ResolvedModule): void {
    this.resolvedModules.set(path, module);
  }

  /**
   * Checks if a resolved module is cached
   * @param path The module path
   * @returns True if the module is in cache
   */
  static hasResolved(path: string): boolean {
    return this.resolvedModules.has(path);
  }

  /**
   * Gets a parsed module from cache
   * @param path The module path
   * @returns The parsed module (or promise) or undefined if not cached
   */
  static getParsed(path: string): ScriptModule | Promise<ScriptModule | any> | undefined {
    return this.parsedModules.get(path);
  }

  /**
   * Sets a parsed module in cache
   * @param path The module path
   * @param module The parsed module or promise
   */
  static setParsed(path: string, module: ScriptModule | Promise<ScriptModule | any>): void {
    this.parsedModules.set(path, module);
  }

  /**
   * Checks if a parsed module is cached
   * @param path The module path
   * @returns True if the module is in cache
   */
  static hasParsed(path: string): boolean {
    return this.parsedModules.has(path);
  }

  /**
   * Checks if a module is currently being parsed (to detect circular dependencies at parse level)
   * @param path The module path
   * @returns True if the module is currently being parsed
   */
  static isCurrentlyParsing(path: string): boolean {
    return this.currentlyParsing.has(path);
  }

  /**
   * Mark a module as currently being parsed
   * @param path The module path
   */
  static markCurrentlyParsing(path: string): void {
    this.currentlyParsing.add(path);
  }

  /**
   * Mark a module as no longer being parsed
   * @param path The module path
   */
  static unmarkCurrentlyParsing(path: string): void {
    this.currentlyParsing.delete(path);
  }

  /**
   * Clears all caches (both resolved and parsed modules) and resets parsing state
   */
  static clear(): void {
    this.resolvedModules.clear();
    this.parsedModules.clear();
    this.currentlyParsing.clear();
  }

  /**
   * Clears only the resolved modules cache
   */
  static clearResolved(): void {
    this.resolvedModules.clear();
  }

  /**
   * Clears only the parsed modules cache
   */
  static clearParsed(): void {
    this.parsedModules.clear();
  }

  /**
   * Gets the size of the resolved modules cache
   * @returns Number of cached resolved modules
   */
  static getResolvedSize(): number {
    return this.resolvedModules.size;
  }

  /**
   * Gets the size of the parsed modules cache
   * @returns Number of cached parsed modules
   */
  static getParsedSize(): number {
    return this.parsedModules.size;
  }
}

/**
 * Clears all module-related caches in the system.
 * This is the single entry point for clearing all module caches.
 * Should be called when starting a fresh parse session.
 */
export function clearAllModuleCaches(): void {
  ModuleCache.clear();
  CircularDependencyDetector.reset();
}
