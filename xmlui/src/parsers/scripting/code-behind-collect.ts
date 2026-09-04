import {
  T_ARROW_EXPRESSION,
  T_FUNCTION_DECLARATION,
  T_IMPORT_DECLARATION,
  T_VAR_STATEMENT,
  type CodeDeclaration,
  type CollectedDeclarations,
  type Expression,
  type FunctionCodeDeclaration,
  type FunctionDeclaration,
  type Statement,
} from "../../components-core/script-runner/ScriptingSourceTree";
import type { VisitorState } from "./tree-visitor";
import { visitNode } from "./tree-visitor";
import { isModuleErrors, parseScriptModule } from "./modules";
import { PARSED_MARK_PROP, ARROW_EXPR_MARK } from "../../abstractions/InternalMarkers";
import type { ModuleFetcher } from "./types";
import { clearAllModuleCaches } from "./ModuleCache";
import { ModuleLoader } from "./ModuleLoader";
import { compileEventAsyncStatements } from "../../components-core/script-compiler/targets/event-async";
import { createDebugSourceUrl } from "../../components-core/script-compiler/source";
import { describeCompiledScriptFallback } from "../../components-core/script-compiler/errors";
import type {
  CompiledScriptSource,
  CompiledScriptSourceMapMode,
  CompiledScriptSourceOrigin,
} from "../../components-core/script-compiler/types";

// Re-export for backward compatibility
export { PARSED_MARK_PROP } from "../../abstractions/InternalMarkers";

export type CodeBehindCollectionOptions = {
  compileEventHandlers?: boolean;
  compiledScriptSourceMaps?: CompiledScriptSourceMapMode;
  sourceIdPrefix?: string;
  sourceUrl?: string;
  displayName?: string;
  sourceText?: string;
  sources?: CompiledScriptSource[];
  sourceOrigin?: CompiledScriptSourceOrigin;
};

type CollectionContext = {
  rootModuleName: string;
  rootSource: string;
  result: CollectedDeclarations;
  options?: CodeBehindCollectionOptions;
  moduleSources: Map<string, string>;
};

// --- Collect module statements from a parsed module
export function collectCodeBehindFromSource(
  moduleName: string,
  source: string,
  options?: CodeBehindCollectionOptions,
): CollectedDeclarations {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
    hasInvalidStatements: false,
    hasUnresolvableImports: false,
  };

  const collectedFunctions: Record<string, CodeDeclaration> = {};
  const context: CollectionContext = {
    rootModuleName: moduleName,
    rootSource: source,
    result,
    options,
    moduleSources: new Map([[moduleName, source]]),
  };

  // --- Parse the module (recursively, including imported modules) in restrictive mode
  const parsedModule = parseScriptModule(moduleName, source);
  if (isModuleErrors(parsedModule)) {
    return { ...result, moduleErrors: parsedModule as any };
  }

  // --- Collect statements from the module
  parsedModule.statements.forEach((stmt) => {
    collectStatementFromModule(stmt, result, collectedFunctions, context);
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
  moduleFetcher?: ModuleFetcher,
  options?: CodeBehindCollectionOptions,
): Promise<CollectedDeclarations> {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
    hasInvalidStatements: false,
    hasUnresolvableImports: false,
  };

  const collectedFunctions: Record<string, CodeDeclaration> = {};
  const moduleSources = new Map<string, string>([[moduleName, source]]);
  const context: CollectionContext = {
    rootModuleName: moduleName,
    rootSource: source,
    result,
    options,
    moduleSources,
  };

  // --- If no fetcher provided, fall back to sync version
  if (!moduleFetcher) {
    return collectCodeBehindFromSource(moduleName, source, options);
  }

  const trackingModuleFetcher: ModuleFetcher = async (modulePath: string) => {
    const moduleSource = await moduleFetcher(modulePath);
    moduleSources.set(modulePath, moduleSource);
    return moduleSource;
  };

  // --- Clear caches for a fresh parse (maintain original behavior)
  clearAllModuleCaches();

  // --- Use ModuleLoader for consistent loading
  const loadResult = await ModuleLoader.loadFromSource(moduleName, source, {
    fetcher: trackingModuleFetcher,
    allowImports: true,
    skipCache: false, // We just cleared, so cache is empty anyway
  });

  // --- Handle errors
  if (!loadResult.ok) {
    const errorResult = loadResult as { ok: false; error: any };
    return { ...result, moduleErrors: errorResult.error, hasUnresolvableImports: true };
  }

  const parsedModule = loadResult.value;

  // --- Collect statements from the module (vars and functions defined in this file)
  parsedModule.statements.forEach((stmt) => {
    collectStatementFromModule(stmt, result, collectedFunctions, context);
  });

  // Since we are in the WithImports version and ModuleLoader succeeded,
  // we have resolved the imports encountered in collectStatementFromModule.
  // NOTE: This correctness relies on the ModuleFetcher throwing an error on
  // missing modules, which parseWithImports/ModuleLoader converts to an
  // 'err' Result, bypassing this success block.
  result.hasUnresolvableImports = false;

  // --- Add imported functions to the result (these come from imports)
  Object.entries(parsedModule.functions).forEach(([name, func]) => {
    if (!result.functions[name] && !collectedFunctions[name]) {
      const arrow = createFunctionCodeDeclaration(func, context);

      collectedFunctions[name] = arrow;
      result.functions[name] = arrow;
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
  collectedFunctions: Record<string, CodeDeclaration>,
  context: CollectionContext,
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
      addFunctionDeclaration(stmt as FunctionDeclaration, result, collectedFunctions, context);
      break;
    case T_IMPORT_DECLARATION:
      result.hasUnresolvableImports = true;
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
  collectedFunctions: Record<string, CodeDeclaration>,
  context: CollectionContext,
): void {
  if (collectedFunctions?.[stmt.id.name] !== undefined) {
    return;
  }
  if (stmt.id.name in result.functions) {
    throw new Error(`Duplicated function declaration: '${stmt.id.name}'`);
  }
  const arrow = createFunctionCodeDeclaration(stmt, context);

  collectedFunctions[stmt.id.name] = arrow;
  result.functions[stmt.id.name] = arrow;
}

function createFunctionCodeDeclaration(
  stmt: FunctionDeclaration,
  context: CollectionContext,
): FunctionCodeDeclaration {
  const arrow: FunctionCodeDeclaration = {
    type: T_ARROW_EXPRESSION,
    nodeId: stmt.nodeId,
    startToken: stmt.startToken,
    endToken: stmt.endToken,
    name: stmt.id.name,
    args: stmt.args.slice(),
    statement: stmt.stmt,
    [ARROW_EXPR_MARK]: true,
    closureContext: [],
  };

  attachCompiledFunctionArtifact(arrow, stmt, context);
  return arrow;
}

function attachCompiledFunctionArtifact(
  arrow: FunctionCodeDeclaration,
  stmt: FunctionDeclaration,
  context: CollectionContext,
): void {
  const options = context.options;
  if (!options?.compileEventHandlers) {
    return;
  }

  const functionName = stmt.id.name;
  const sourceModule = stmt.sourceModule ?? context.rootModuleName;
  const optionSource = options.sources?.find((source) => source.id === sourceModule);
  const moduleSource =
    context.moduleSources.get(sourceModule) ??
    optionSource?.sourceText ??
    (sourceModule === context.rootModuleName
      ? options.sourceText ?? context.rootSource
      : undefined) ??
    context.rootSource;
  const sourceId = `${
    sourceModule === context.rootModuleName ? options.sourceIdPrefix ?? sourceModule : sourceModule
  }#function-${functionName}`;
  const displayName =
    optionSource?.displayName ??
    (sourceModule === context.rootModuleName ? options.displayName ?? sourceModule : sourceModule);
  const sourceUrl =
    optionSource?.url ??
    (sourceModule === context.rootModuleName
      ? options.sourceUrl ?? createDebugSourceUrl(sourceModule)
      : createDebugSourceUrl(sourceModule));
  const sourceOrigin = sourceModule === context.rootModuleName ? options.sourceOrigin : undefined;
  let sources: CompiledScriptSource[];
  if (optionSource) {
    sources = [optionSource];
  } else if (sourceModule === context.rootModuleName && options.sources) {
    sources = options.sources;
  } else {
    sources = [
      {
        id: sourceId,
        url: sourceUrl,
        displayName,
        sourceText: sourceOrigin?.sourceText ?? moduleSource,
      },
    ];
  }

  arrow.source = sliceSourceByTokens(stmt, moduleSource);
  arrow.sourceId = sourceId;

  try {
    arrow.compiled = compileEventAsyncStatements(stmt.stmt.stmts, {
      sourceId,
      sourceText: arrow.source,
      sourceUrl,
      displayName,
      sources,
      sourceOrigin,
    });
    arrow.compiledUnsupported = false;
    arrow.sourceRange = arrow.compiled.sourceRange;
  } catch (error) {
    const reason = describeCompiledScriptFallback(error);
    arrow.compiledUnsupported = true;
    arrow.compiledUnsupportedReason = reason;
    (context.result.warnings ??= []).push(
      `Could not compile code-behind function ${sourceId} (${reason}); ` +
        `falling back to interpreted execution.`,
    );
  }
}

function sliceSourceByTokens(stmt: FunctionDeclaration, source: string): string {
  const start = stmt.startToken?.startPosition;
  const end = stmt.endToken?.endPosition;
  if (start === undefined || end === undefined || start < 0 || end < start) {
    return source;
  }
  return source.slice(start, end);
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

  function removeTokens(declaration: any): void {
    const nodeVisitor = (before: boolean, visited: Expression | Statement, state: VisitorState) => {
      if (before) {
        if (visited) {
          delete visited.startToken
          delete visited.endToken;
        }
      }
      return state;
    };

    // Handle both formats:
    // - Vars: {__PARSED__: true, tree: ...}
    // - Functions: arrow expression with _ARROW_EXPR_: true
    const tree = declaration.tree || declaration;
    if (tree) {
      visitNode(tree, state, nodeVisitor, nodeVisitor);
    }
  }
}
