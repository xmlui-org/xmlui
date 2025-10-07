import type {
  ScriptModule} from "../../components-core/script-runner/ScriptingSourceTree";
import {
  T_FUNCTION_DECLARATION,
  type FunctionDeclaration,
  type Statement,
} from "../../components-core/script-runner/ScriptingSourceTree";
import type { ErrorCodes, ParserErrorMessage } from "./ParserError";
import { Parser } from "./Parser";
import { errorMessages } from "./ParserError";
import { TokenType } from "./TokenType";

/**
 * Represents a module error
 */
export type ModuleErrors = Record<string, ParserErrorMessage[]>;

/**
 * Checks if the result is a module error
 * @param result Result to check
 * @returns True if the result is a module error
 */
export function isModuleErrors(result: ScriptModule | ModuleErrors): result is ModuleErrors {
  return (result as any).type !== "ScriptModule";
}

/**
 * Parses a script module
 * @param moduleName Name of the module
 * @param source Source code to parse
 * @param moduleResolver A function that resolves a module path to the text of the module
 * @returns The parsed and resolved module
 */
export function parseScriptModule(
  moduleName: string,
  source: string
): ScriptModule | ModuleErrors {
  // --- Keep track of parsed modules to avoid circular references
  const parsedModules = new Map<string, ScriptModule>();
  const moduleErrors: ModuleErrors = {};

  const parsedModule = doParseModule(moduleName, source);
  return !parsedModule || Object.keys(moduleErrors).length > 0 ? moduleErrors : parsedModule;

  // --- Do the parsing, allow recursion
  function doParseModule(
    moduleName: string,
    source: string
  ): ScriptModule | null | undefined {
    // --- Do not parse the same module twice
    if (parsedModules.has(moduleName)) {
      return parsedModules.get(moduleName);
    }

    // --- Parse the source code
    const parser = new Parser(source);
    let statements: Statement[] = [];
    try {
      statements = parser.parseStatements()!;
    } catch (error) {
      moduleErrors[moduleName] = parser.errors;
      return null;
    }

    // --- Check for unparsed tail
    const lastToken = parser.current;
    if (lastToken.type !== TokenType.Eof) {
      moduleErrors[moduleName] ??= [];
      moduleErrors[moduleName].push({
        code: "W002",
        text: errorMessages["W002"].replace(/\{(\d+)}/g, () => lastToken.text),
        position: lastToken.startLine,
        line: lastToken.startLine,
        column: lastToken.startColumn,
      });
      return null;
    }

    const errors: ParserErrorMessage[] = [];

    // --- Collect functions
    const functions: Record<string, FunctionDeclaration> = {};
    statements
      .filter((stmt) => stmt.type === T_FUNCTION_DECLARATION)
      .forEach((stmt) => {
        const func = stmt as FunctionDeclaration;
        if (functions[func.id.name]) {
          addErrorMessage("W020", stmt, func.id.name);
          return;
        }
        functions[func.id.name] = func;
      });

    // --- Successful module parsing
    const parsedModule: ScriptModule = {
      type: "ScriptModule",
      name: moduleName,
      functions,
      statements: statements,
      sources: new Map(),
    };

    // --- Sign this module as parsed
    parsedModules.set(moduleName, parsedModule);

    // --- Catch errors
    if (errors.length > 0) {
      moduleErrors[moduleName] = errors;
      return null;
    }

    // --- Done.
    return parsedModule;

    function addErrorMessage(code: ErrorCodes, stmt: Statement, ...args: any[]): void {
      let errorText = errorMessages[code];
      if (args) {
        args.forEach(
          (o, idx) => (errorText = errorText.replaceAll(`{${idx}}`, args[idx].toString())),
        );
      }
      errors.push({
        code,
        text: errorMessages[code].replace(/\{(\d+)}/g, (_, index) => args[index]),
        position: stmt.startToken?.startPosition,
        line: stmt.startToken?.startLine,
        column: stmt.startToken?.startColumn,
      });
    }
  }
}
