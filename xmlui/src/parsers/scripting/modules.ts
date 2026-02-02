import type { ScriptModule } from "../../components-core/script-runner/ScriptingSourceTree";
import {
  T_FUNCTION_DECLARATION,
  T_IMPORT_DECLARATION,
  T_VAR_STATEMENT,
  T_LET_STATEMENT,
  T_CONST_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_IF_STATEMENT,
  T_WHILE_STATEMENT,
  T_TRY_STATEMENT,
  T_FOR_STATEMENT,
  T_SWITCH_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_RETURN_STATEMENT,
  T_BREAK_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_THROW_STATEMENT,
  T_BLOCK_STATEMENT,
  T_EMPTY_STATEMENT,
  T_ARROW_EXPRESSION_STATEMENT,
  type FunctionDeclaration,
  type ImportDeclaration,
  type Statement,
  type VarStatement,
  type LetStatement,
  type ConstStatement,
} from "../../components-core/script-runner/ScriptingSourceTree";
import type { ErrorCodes, ParserErrorMessage } from "./ParserError";
import { Parser } from "./Parser";
import { errorMessages } from "./ParserError";
import { TokenType } from "./TokenType";
import type { ModuleFetcher } from "./ModuleResolver";
import { ModuleResolver } from "./ModuleResolver";

// Mapping of statement types to human-readable names
const statementTypeNames: Record<number, string> = {
  [T_BLOCK_STATEMENT]: "block statement",
  [T_EMPTY_STATEMENT]: "empty statement",
  [T_EXPRESSION_STATEMENT]: "expression statement",
  [T_ARROW_EXPRESSION_STATEMENT]: "arrow expression statement",
  [T_LET_STATEMENT]: "let statement",
  [T_CONST_STATEMENT]: "const statement",
  [T_VAR_STATEMENT]: "var statement",
  [T_IF_STATEMENT]: "if statement",
  [T_RETURN_STATEMENT]: "return statement",
  [T_BREAK_STATEMENT]: "break statement",
  [T_CONTINUE_STATEMENT]: "continue statement",
  [T_WHILE_STATEMENT]: "while statement",
  [T_DO_WHILE_STATEMENT]: "do-while statement",
  [T_FOR_STATEMENT]: "for statement",
  [T_FOR_IN_STATEMENT]: "for-in statement",
  [T_FOR_OF_STATEMENT]: "for-of statement",
  [T_THROW_STATEMENT]: "throw statement",
  [T_TRY_STATEMENT]: "try statement",
  [T_SWITCH_STATEMENT]: "switch statement",
  [T_FUNCTION_DECLARATION]: "function declaration",
  [T_IMPORT_DECLARATION]: "import declaration",
};

/**
 * Represents a module error
 */
export type ModuleErrors = Record<string, ParserErrorMessage[]>;

/**
 * Represents module warnings (non-fatal issues)
 */
export type ModuleWarnings = Record<string, ParserErrorMessage[]>;

/**
 * Checks if the result is a module error
 * @param result Result to check
 * @returns True if the result is a module error
 */
export function isModuleErrors(result: ScriptModule | ModuleErrors): result is ModuleErrors {
  return (result as any).type !== "ScriptModule";
}

/**
 * Validates that an imported module contains only function declarations
 * @param modulePath Path to the module being validated
 * @param statements Statements from the module
 * @param errors Array to add errors to
 * @param warnings Array to add warnings to (console.warn)
 */
function validateImportedModuleStatements(
  modulePath: string,
  statements: Statement[],
  errors: ParserErrorMessage[],
  warnings: ParserErrorMessage[],
): void {
  for (const stmt of statements) {
    // Skip imports and function declarations - these are allowed
    if (stmt.type === T_IMPORT_DECLARATION || stmt.type === T_FUNCTION_DECLARATION) {
      continue;
    }

    // Error: Reactive var declarations
    if (stmt.type === T_VAR_STATEMENT) {
      const varStmt = stmt as VarStatement;
      const varNames = varStmt.decls.map(d => d.id.name).join(", ");
      errors.push({
        code: "W043",
        text: errorMessages["W043"].replace("{0}", varNames),
        position: stmt.startToken?.startPosition ?? 0,
        end: stmt.endToken?.endPosition ?? stmt.startToken?.endPosition ?? 0,
        line: stmt.startToken?.startLine ?? 1,
        column: stmt.startToken?.startColumn ?? 1,
      });
      continue;
    }

    // Error: const/let declarations
    if (stmt.type === T_CONST_STATEMENT || stmt.type === T_LET_STATEMENT) {
      const declStmt = stmt as ConstStatement | LetStatement;
      const varNames = declStmt.decls.map(d => d.id ?? "?").join(", ");
      errors.push({
        code: "W044",
        text: errorMessages["W044"].replace("{0}", varNames),
        position: stmt.startToken?.startPosition ?? 0,
        end: stmt.endToken?.endPosition ?? stmt.startToken?.endPosition ?? 0,
        line: stmt.startToken?.startLine ?? 1,
        column: stmt.startToken?.startColumn ?? 1,
      });
      continue;
    }

    // Warning: Any other statement type
    const stmtType = statementTypeNames[stmt.type] || `statement type ${stmt.type}`;
    warnings.push({
      code: "W045",
      text: errorMessages["W045"].replace("{0}", stmtType),
      position: stmt.startToken?.startPosition ?? 0,
      end: stmt.endToken?.endPosition ?? stmt.startToken?.endPosition ?? 0,
      line: stmt.startToken?.startLine ?? 1,
      column: stmt.startToken?.startColumn ?? 1,
    });
  }
}

/**
 * Parses a script module
 * @param moduleName Name of the module
 * @param source Source code to parse
 * @param moduleResolver A function that resolves a module path to the text of the module
 * @returns The parsed and resolved module
 */
export function parseScriptModule(moduleName: string, source: string): ScriptModule | ModuleErrors {
  // --- Keep track of parsed modules to avoid circular references
  const parsedModules = new Map<string, ScriptModule>();
  const moduleErrors: ModuleErrors = {};

  const parsedModule = doParseModule(moduleName, source);
  return !parsedModule || Object.keys(moduleErrors).length > 0 ? moduleErrors : parsedModule;

  // --- Do the parsing, allow recursion
  function doParseModule(moduleName: string, source: string): ScriptModule | null | undefined {
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
        position: lastToken.startPosition,
        end: lastToken.endPosition,
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
        position: stmt.startToken?.startPosition ?? 0,
        end: stmt.startToken?.endPosition ?? 0,
        line: stmt.startToken?.startLine ?? 1,
        column: stmt.startToken?.startColumn ?? 1,
      });
    }
  }
}

// Cache for parsed modules to avoid infinite recursion
const parsedModulesCache = new Map<string, ScriptModule | Promise<ScriptModule | ModuleErrors>>();

/**
 * Parses a script module with import support
 * @param moduleName Name of the module
 * @param source Source code to parse
 * @param moduleFetcher Function to fetch module content (required for import resolution)
 * @returns The parsed and resolved module
 */
export async function parseScriptModuleWithImports(
  moduleName: string,
  source: string,
  moduleFetcher: ModuleFetcher,
): Promise<ScriptModule | ModuleErrors> {
  // --- Check if we're already parsing or have parsed this module
  if (parsedModulesCache.has(moduleName)) {
    const cached = parsedModulesCache.get(moduleName)!;
    // If it's a promise, wait for it; otherwise return the cached result
    return cached instanceof Promise ? await cached : cached;
  }

  // --- Set up the module fetcher
  ModuleResolver.setCustomFetcher(moduleFetcher);

  // --- Create a promise for this module to prevent circular parsing
  const parsePromise = doParseModule(moduleName, source, moduleFetcher);
  parsedModulesCache.set(moduleName, parsePromise);

  const result = await parsePromise;
  
  // Store the final result (not the promise)
  parsedModulesCache.set(moduleName, result);
  
  return result;
}

/**
 * Internal function to actually parse a module
 */
async function doParseModule(
  moduleName: string,
  source: string,
  moduleFetcher: ModuleFetcher,
): Promise<ScriptModule | ModuleErrors> {
  // --- Parse the source code
  const parser = new Parser(source);
  let statements: Statement[] = [];
  const moduleErrors: ModuleErrors = {};

  try {
    statements = parser.parseStatements()!;
  } catch (error) {
    moduleErrors[moduleName] = parser.errors;
    return moduleErrors;
  }

  // --- Check for unparsed tail
  const lastToken = parser.current;
  if (lastToken.type !== TokenType.Eof) {
    moduleErrors[moduleName] ??= [];
    moduleErrors[moduleName].push({
      code: "W002",
      text: errorMessages["W002"].replace(/\{(\d+)}/g, () => lastToken.text),
      position: lastToken.startPosition,
      end: lastToken.endPosition,
      line: lastToken.startLine,
      column: lastToken.startColumn,
    });
    return moduleErrors;
  }

  const errors: ParserErrorMessage[] = [];
  let hasValidationErrors = false;

  // --- Separate imports from other statements
  const imports: ImportDeclaration[] = [];
  const otherStatements: Statement[] = [];

  statements.forEach((stmt) => {
    if (stmt.type === T_IMPORT_DECLARATION) {
      imports.push(stmt as ImportDeclaration);
    } else {
      otherStatements.push(stmt);
    }
  });

  // --- Collect functions from this module
  const functions: Record<string, FunctionDeclaration> = {};
  otherStatements
    .filter((stmt) => stmt.type === T_FUNCTION_DECLARATION)
    .forEach((stmt) => {
      const func = stmt as FunctionDeclaration;
      if (functions[func.id.name]) {
        addErrorMessage("W020", stmt, func.id.name);
        return;
      }
      functions[func.id.name] = func;
    });

  // --- Process imports - fetch modules and import their functions
  for (const importDecl of imports) {
    try {
      // Check if we would create a circular import before fetching
      const resolvedPath = ModuleResolver.resolvePath(importDecl.source.value, moduleName);
      
      // Check if we're trying to import ourselves or create a circular dependency
      if (resolvedPath === moduleName) {
        // Direct self-import
        addErrorMessage("W041", importDecl, `Self-import detected: ${resolvedPath}`);
        continue;
      }
      
      // Check if this module is already being parsed (circular)
      const cached = parsedModulesCache.get(resolvedPath);
      if (cached instanceof Promise) {
        // Module is currently being parsed - this is a circular import
        addErrorMessage("W041", importDecl, `Circular import: ${moduleName} → ${resolvedPath}`);
        continue;
      }
      
      const circularChain = ModuleResolver.detectCircularImport(resolvedPath);
      if (circularChain) {
        // Circular import detected - add error and skip
        const chainStr = circularChain.join(" → ");
        addErrorMessage("W041", importDecl, `${chainStr}`);
        continue;
      }

      // Fetch and parse the imported module
      const resolvedModule = await ModuleResolver.resolveAndFetchModule(
        importDecl.source.value,
        moduleName,
      );

      // Parse the imported module to extract its functions
      const importedModuleResult = await parseScriptModuleWithImports(
        resolvedModule.path,
        resolvedModule.content,
        moduleFetcher,
      );

      // Check if imported module has errors
      if (isModuleErrors(importedModuleResult)) {
        // Propagate errors from imported modules
        Object.entries(importedModuleResult).forEach(([path, errs]) => {
          moduleErrors[path] = errs;
          // Check if any of these are validation errors (W043, W044)
          if (errs.some(e => e.code === "W043" || e.code === "W044")) {
            hasValidationErrors = true;
          }
        });
        continue;
      }

      // Validate that the imported module only contains function declarations
      const importErrors: ParserErrorMessage[] = [];
      const importWarnings: ParserErrorMessage[] = [];
      validateImportedModuleStatements(
        resolvedModule.path,
        importedModuleResult.statements,
        importErrors,
        importWarnings,
      );

      // Log warnings to console (even if there are also errors)
      if (importWarnings.length > 0) {
        importWarnings.forEach((warning) => {
          console.warn(
            `Warning [${warning.code}] in imported module '${resolvedModule.path}' at line ${warning.line}:${warning.column}: ${warning.text}`,
          );
        });
      }

      // Add errors to moduleErrors for the imported module
      if (importErrors.length > 0) {
        moduleErrors[resolvedModule.path] = importErrors;
        hasValidationErrors = true;
        // Don't continue - we found validation errors
        continue;
      }

      // Import requested functions/variables from the module
      for (const specifier of importDecl.specifiers) {
        const importedName = specifier.imported.name;
        const localName = specifier.local?.name ?? importedName;

        // Check if the function exists in the imported module
        if (importedModuleResult.functions[importedName]) {
          // Add to available functions with the local name (aliasing support)
          if (functions[localName]) {
            addErrorMessage("W020", importDecl, localName);
          } else {
            functions[localName] = importedModuleResult.functions[importedName];
          }
        }
      }
    } catch (error) {
      // Handle circular imports and fetch errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Circular import")) {
        addErrorMessage("W041", importDecl, errorMessage);
      } else if (errorMessage.includes("goes above root")) {
        addErrorMessage("W022", importDecl, importDecl.source.value);
      } else {
        addErrorMessage("W022", importDecl, importDecl.source.value);
      }
    }
  }

  // --- Successful module parsing
  const parsedModule: ScriptModule = {
    type: "ScriptModule",
    name: moduleName,
    functions,
    statements: otherStatements, // Exclude imports from statements
    sources: new Map(),
  };

  // --- Catch errors from current module
  if (errors.length > 0) {
    moduleErrors[moduleName] = errors;
    return moduleErrors;
  }
  
  // Also return errors if any imported modules had validation errors
  if (hasValidationErrors) {
    return moduleErrors;
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
      position: stmt.startToken?.startPosition ?? 0,
      end: stmt.startToken?.endPosition ?? 0,
      line: stmt.startToken?.startLine ?? 1,
      column: stmt.startToken?.startColumn ?? 1,
    });
  }
}

/**
 * Clears the parsed modules cache
 * Should be called between test runs or when starting a new parse session
 */
export function clearParsedModulesCache(): void {
  parsedModulesCache.clear();
}
