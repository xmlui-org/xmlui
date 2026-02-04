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
 * Result type for operations that can succeed or fail
 * @template T The success type
 * @template E The error type
 */
export type Result<T, E> = 
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Creates a successful result
 * @template T The success type
 * @template E The error type
 * @param value The success value
 * @returns A successful result
 */
export function ok<T, E>(value: T): Result<T, E> {
  return { ok: true, value };
}

/**
 * Creates a failed result
 * @template T The success type
 * @template E The error type
 * @param error The error value
 * @returns A failed result
 */
export function err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}

/**
 * Checks if a result is successful
 * @template T The success type
 * @template E The error type
 * @param result The result to check
 * @returns True if the result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

/**
 * Checks if a result is an error
 * @template T The success type
 * @template E The error type
 * @param result The result to check
 * @returns True if the result is an error
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

/**
 * Extracts the value from a result, throwing if it's an error
 * @template T The success type
 * @template E The error type
 * @param result The result to extract from
 * @returns The success value if ok, otherwise throws
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw new Error(`Failed to unwrap result: ${JSON.stringify(result.error)}`);
}

/**
 * Result type for module parsing operations
 * Either a successfully parsed module or a collection of errors
 */
export type ParseResult = Result<ScriptModule, ParserErrorMessage[]>;
