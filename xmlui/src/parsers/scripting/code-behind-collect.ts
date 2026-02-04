import {
  T_ARROW_EXPRESSION,
  T_FUNCTION_DECLARATION,
  T_VAR_STATEMENT,
  type ArrowExpression,
  type CodeDeclaration,
  type CollectedDeclarations,
  type Expression,
  type FunctionDeclaration,
  type Statement,
} from "../../components-core/script-runner/ScriptingSourceTree";
import type { VisitorState } from "./tree-visitor";
import { visitNode } from "./tree-visitor";
import { isModuleErrors, parseScriptModule, parseScriptModuleAsync, parseScriptModuleWithImports } from "./modules";
import { PARSED_MARK_PROP } from "../../abstractions/InternalMarkers";
import type { ModuleFetcher } from "./types";
import { clearAllModuleCaches } from "./ModuleCache";
import { ModuleLoader } from "./ModuleLoader";
import { isOk } from "./types";

// Re-export for backward compatibility
export { PARSED_MARK_PROP } from "../../abstractions/InternalMarkers";

// --- Collect module statements from a parsed module
export function collectCodeBehindFromSource(
  moduleName: string,
  source: string
): CollectedDeclarations {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
    hasInvalidStatements: false,
  };

  const collectedFunctions: Record<string, CodeDeclaration> = {};

  // --- Parse the module (recursively, including imported modules) in restrictive mode
  const parsedModule = parseScriptModule(moduleName, source);
  if (isModuleErrors(parsedModule)) {
    return { ...result, moduleErrors: parsedModule };
  }

  // --- Collect statements from the module
  parsedModule.statements.forEach((stmt) => {
    collectStatementFromModule(stmt, result, collectedFunctions);
  });
  return result;
}

/**
 * Async version that supports module imports (uses ModuleLoader internally)
 * @param moduleName The name/path of the module
 * @param source The source code to parse
 * @param moduleFetcher Optional fetcher for resolving imports
 * @returns The collected code-behind declarations
 */
export async function collectCodeBehindFromSourceWithImports(
  moduleName: string,
  source: string,
  moduleFetcher?: ModuleFetcher
): Promise<CollectedDeclarations> {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
    hasInvalidStatements: false,
  };

  const collectedFunctions: Record<string, CodeDeclaration> = {};

  // --- If no fetcher provided, fall back to sync version
  if (!moduleFetcher) {
    return collectCodeBehindFromSource(moduleName, source);
  }

  // --- Clear caches for a fresh parse (maintain original behavior)
  clearAllModuleCaches();

  // --- Use ModuleLoader for consistent loading
  const loadResult = await ModuleLoader.loadFromSource(moduleName, source, {
    fetcher: moduleFetcher,
    allowImports: true,
    skipCache: false, // We just cleared, so cache is empty anyway
  });

  // --- Handle errors
  if (!isOk(loadResult)) {
    return { ...result, moduleErrors: loadResult.error };
  }

  const parsedModule = loadResult.value;

  // --- Collect statements from the module (vars and functions defined in this file)
  parsedModule.statements.forEach((stmt) => {
    collectStatementFromModule(stmt, result, collectedFunctions);
  });

  // --- Add imported functions to the result (these come from imports)
  Object.entries(parsedModule.functions).forEach(([name, func]) => {
    if (!result.functions[name] && !collectedFunctions[name]) {
      // Convert FunctionDeclaration to CodeDeclaration format
      const arrow: ArrowExpression = {
        type: T_ARROW_EXPRESSION,
        args: func.args.slice(),
        statement: func.stmt,
      } as ArrowExpression;

      const codeDecl = {
        [PARSED_MARK_PROP]: true,
        tree: arrow,
      };

      collectedFunctions[name] = codeDecl;
      result.functions[name] = codeDecl;
    }
  });

  return result;
}

/**
 * Helper function to collect a statement from a module
 */
function collectStatementFromModule(
  stmt: Statement,
  result: CollectedDeclarations,
  collectedFunctions: Record<string, CodeDeclaration>
): void {
  switch (stmt.type) {
    case T_VAR_STATEMENT:
      stmt.decls.forEach((decl) => {
        if (decl.id.name in result.vars) {
          throw new Error(`Duplicated var declaration: '${decl.id.name}'`);
        }
        result.vars[decl.id.name] = {
          [PARSED_MARK_PROP]: true,
          tree: decl.expr,
        };
      });
      break;
    case T_FUNCTION_DECLARATION:
      addFunctionDeclaration(stmt as FunctionDeclaration, result, collectedFunctions);
      break;
    default:
      result.hasInvalidStatements = true;
  }
}

/**
 * Helper function to add a function declaration
 */
function addFunctionDeclaration(
  stmt: FunctionDeclaration,
  result: CollectedDeclarations,
  collectedFunctions: Record<string, CodeDeclaration>
): void {
  if (collectedFunctions?.[stmt.id.name] !== undefined) {
    return;
  }
  if (stmt.id.name in result.functions) {
    throw new Error(`Duplicated function declaration: '${stmt.id.name}'`);
  }
  const arrow: ArrowExpression = {
    type: T_ARROW_EXPRESSION,
    args: stmt.args.slice(),
    statement: stmt.stmt,
  } as ArrowExpression;

  collectedFunctions[stmt.id.name] = {
    [PARSED_MARK_PROP]: true,
    tree: arrow,
  };
  result.functions[stmt.id.name] = {
    [PARSED_MARK_PROP]: true,
    tree: arrow,
  };
}

// --- Remove all code-behind tokens from the tree
export function removeCodeBehindTokensFromTree(declarations: CollectedDeclarations): void {
  if (!declarations) return;

  const state: VisitorState = {
    data: null,
    cancel: false,
    skipChildren: false,
  };

  Object.keys(declarations.vars).forEach((key) => {
    removeTokens(declarations.vars[key]);
  });
  Object.keys(declarations.functions).forEach((key) => {
    removeTokens(declarations.functions[key]);
  });

  function removeTokens(declaration: CodeDeclaration): void {
    const nodeVisitor = (before: boolean, visited: Expression | Statement, state: VisitorState) => {
      if (before) {
        if (visited) {
          delete visited.startToken
          delete visited.endToken;
        }
      }
      return state;
    };

    visitNode(declaration.tree, state, nodeVisitor, nodeVisitor);
  }
}
