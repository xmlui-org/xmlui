import type { ErrorCodes, ParserErrorMessage } from "./ParserError";
import type { FunctionDeclaration, Statement } from "../../abstractions/scripting/ScriptingSourceTreeExp";

import { Parser } from "./Parser";
import { errorMessages } from "./ParserError";
import { TokenType } from "./TokenType";
import { ModuleResolver } from "@abstractions/scripting/modules";

/**
 * Represents a parsed and resolved module
 */
export type ScriptModule = {
  type: "ScriptModule";
  name: string;
  parent?: ScriptModule | null;
  exports: Record<string, FunctionDeclaration>;
  imports: Record<string, FunctionDeclaration>;
  importedModules: ScriptModule[];
  functions: Record<string, FunctionDeclaration>;
};

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
  source: string,
  moduleResolver: ModuleResolver,
  restrictiveMode = true
): ScriptModule | ModuleErrors {
  // --- Keep track of parsed modules to avoid circular references
  const parsedModules = new Map<string, ScriptModule>();
  const moduleErrors: ModuleErrors = {};

  const parsedModule = doParseModule(moduleName, source, moduleResolver, true);
  return !parsedModule || Object.keys(moduleErrors).length > 0 ? moduleErrors : parsedModule;

  // --- Do the parsing, allow recursion
  function doParseModule(
    moduleName: string,
    source: string,
    moduleResolver: ModuleResolver,
    topLevel = false
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

    // --- Check for forbidden "var" declarations
    statements.forEach((stmt) => {
      if (topLevel) {
        // --- Restrict top-level statements
        switch (stmt.type) {
          case "VarS":
          case "FuncD":
          case "ImportD":
            break;
          default:
            if (restrictiveMode) {
              addErrorMessage("W028", stmt, stmt.type);
            }
            break;
        }
      } else {
        switch (stmt.type) {
          case "VarS":
            addErrorMessage("W027", stmt);
            break;
          case "FuncD":
            if (restrictiveMode && !stmt.exp) {
              addErrorMessage("W029", stmt);
            }
            break;
          case "ImportD":
            break;
          default:
            if (restrictiveMode) {
              addErrorMessage("W028", stmt, stmt.type);
            }
            break;
        }
      }
    });

    // --- Collect functions
    const functions: Record<string, FunctionDeclaration> = {};
    const exports: Record<string, FunctionDeclaration> = {};
    statements
      .filter((stmt) => stmt.type === "FuncD")
      .forEach((stmt) => {
        const func = stmt as FunctionDeclaration;
        if (functions[func.id.name]) {
          addErrorMessage("W020", stmt, func.id.name);
          return;
        }
        functions[func.id.name] = func;
        if (func.exp) {
          exports[func.id.name] = func;
        }
      });

    // --- Successful module parsing
    const parsedModule: ScriptModule = {
      type: "ScriptModule",
      name: moduleName,
      exports,
      importedModules: [],
      imports: {},
      functions,
    };

    // --- Sign this module as parsed
    parsedModules.set(moduleName, parsedModule);

    // --- Load imported modules and resolve imports
    const importedModules: ScriptModule[] = [];
    const imports: Record<string, FunctionDeclaration> = {};
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.type !== "ImportD") {
        continue;
      }

      // --- Find the imported module
      const source = moduleResolver(moduleName, stmt.moduleFile);
      if (source === null) {
        addErrorMessage("W022", stmt, stmt.moduleFile);
        continue;
      }

      // --- Parse the imported module
      const imported = doParseModule(stmt.moduleFile, source, moduleResolver);

      if (!imported) {
        // --- Error in the imported module
        return;
      }

      // --- Successful import
      importedModules.push(imported);

      // --- Extract imported names
      for (const item of stmt.imports) {
        if (imported.exports[item.source]) {
          imports[item.id.name] = imported.exports[item.source];
        } else {
          addErrorMessage("W023", stmt, stmt.moduleFile, item.source);
        }
      }
    }

    // --- Catch errors
    if (errors.length > 0) {
      moduleErrors[moduleName] = errors;
      return null;
    }

    // --- All imported modules use this module as a parent
    importedModules.forEach((m) => (m.parent = parsedModule));

    // --- Done.
    parsedModule.importedModules = importedModules;
    parsedModule.imports = imports;
    return parsedModule;

    function addErrorMessage(code: ErrorCodes, stmt: Statement, ...args: any[]): void {
      let errorText = errorMessages[code];
      if (args) {
        args.forEach((o, idx) => (errorText = errorText.replaceAll(`{${idx}}`, args[idx].toString())));
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
