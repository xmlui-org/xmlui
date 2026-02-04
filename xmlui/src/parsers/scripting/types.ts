import type { ScriptModule } from "../../components-core/script-runner/ScriptingSourceTree";
import type { ParserErrorMessage } from "./ParserError";

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
 * Represents a module error - maps module path to array of error messages
 */
export type ModuleErrors = Record<string, ParserErrorMessage[]>;

/**
 * Represents module warnings (non-fatal issues)
 */
export type ModuleWarnings = Record<string, ParserErrorMessage[]>;

/**
 * Result type for module parsing operations
 * Either a successfully parsed module or a collection of errors
 */
export type ParseResult = ScriptModule | ModuleErrors;
