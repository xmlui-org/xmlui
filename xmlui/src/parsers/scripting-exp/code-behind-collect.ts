import {
  T_ARROW_EXPRESSION,
  T_FUNCTION_DECLARATION,
  T_IMPORT_DECLARATION,
  T_VAR_STATEMENT,
  type ArrowExpression,
  type CodeDeclaration,
  type CollectedDeclarations,
  type Expression,
  type FunctionDeclaration,
  type ScriptModule,
  type Statement,
} from "../../abstractions/scripting/ScriptingSourceTreeExp";
import type { ModuleResolver } from "../../abstractions/scripting/modules";
import type { VisitorState } from "./tree-visitor";
import { visitNode } from "./tree-visitor";
import { isModuleErrors, parseScriptModule } from "./modules";

export const PARSED_MARK_PROP = "__PARSED__";

// --- Collect module statements from a parsed module
export function collectCodeBehindFromSource(
  moduleName: string,
  source: string,
  moduleResolver: ModuleResolver,
  moduleNameResolver: (moduleName: string) => string,
): CollectedDeclarations {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
  };

  const collectedFunctions: Record<
    string,
    { collectedImportsFrom: boolean; functions?: Record<string, CodeDeclaration> }
  > = {};

  // --- Parse the module (recursively, including imported modules) in restrictive mode
  const parsedModule = parseScriptModule(moduleName, source, moduleResolver, true);
  if (isModuleErrors(parsedModule)) {
    return { ...result, moduleErrors: parsedModule };
  }

  const mainModuleResolvedName = moduleNameResolver(parsedModule.name);

  // --- Collect statements from the module
  parsedModule.statements.forEach((stmt) => {
    switch (stmt.type) {
      case T_VAR_STATEMENT:
        stmt.decls.forEach((decl) => {
          if (decl.id.name in result.vars) {
            throw new Error(`Duplicated var declaration: '${decl.id}'`);
          }
          result.vars[decl.id.name] = {
            [PARSED_MARK_PROP]: true,
            source: decl.expr.source,
            tree: decl.expr,
          };
        });
        break;
      case T_FUNCTION_DECLARATION:
        addFunctionDeclaration(mainModuleResolvedName, stmt);
        break;
      case T_IMPORT_DECLARATION:
        // --- Do nothing
        break;
      default:
        throw new Error(`'${stmt.type}' is not allowed in a code-behind module.`);
    }
  });
  collectFuncs(parsedModule);

  return result;

  /** TODO: this exposes all the functions that were imported by any imported module
   * to the root module. Has the effect of imported functions beeing global to the root of the import tree.*/
  function collectFuncs(currentModule: ScriptModule) {
    const resolvedModuleName = moduleNameResolver(currentModule.name);
    if (collectedFunctions?.[resolvedModuleName]?.collectedImportsFrom) {
      return;
    }
    for (const modName in currentModule.imports) {
      const resolvedImportedModuleName = moduleNameResolver(modName);
      // if (mainModuleResolvedName === resolvedImportedModuleName) {
      //   continue;
      // }
      const mod = currentModule.imports[modName];
      for (const obj of Object.values(mod)) {
        if (obj.type === "FuncD") {
          addFunctionDeclaration(resolvedImportedModuleName, obj);
        }
      }
    }
    collectedFunctions[resolvedModuleName] ??= { collectedImportsFrom: true };
    collectedFunctions[resolvedModuleName].collectedImportsFrom = true;
    for (let nextModule of currentModule.importedModules) {
      collectFuncs(nextModule);
    }
  }

  // --- Collect function declaration data
  function addFunctionDeclaration(resolvedModuleName: string, stmt: FunctionDeclaration): void {
    if (collectedFunctions?.[resolvedModuleName]?.functions?.[stmt.id.name] !== undefined) {
      return;
    }
    if (stmt.id.name in result.functions) {
      throw new Error(`Duplicated function declaration: '${stmt.id.name}'`);
    }
    const funcSource =
      stmt.args.length === 1
        ? `${stmt.args[0].source} => ${stmt.stmt.source}`
        : `(${stmt.args.map((a) => a.source).join(", ")}) => ${stmt.stmt.source}`;
    const arrow: ArrowExpression = {
      type: T_ARROW_EXPRESSION,
      args: stmt.args.slice(),
      statement: stmt.stmt,
      // TODO: handle closure context
      // closureContext: obtainClosures({
      //   childThreads: [],
      //   blocks: [{ vars: {} }],
      //   loops: [],
      //   breakLabelValue: -1,
      // }),
    } as ArrowExpression;

    // --- Remove the circular reference from the function to its closure context
    // TODO: handle closure context
    // const functionSelf = arrow.closureContext![0]?.vars?.[stmt.name] as FunctionDeclaration;
    // if (functionSelf?.closureContext) {
    //   delete functionSelf.closureContext;
    // }

    collectedFunctions[resolvedModuleName] ??= { functions: {}, collectedImportsFrom: false };
    collectedFunctions[resolvedModuleName].functions ??= {};

    collectedFunctions[resolvedModuleName].functions[stmt.id.name] = {
      [PARSED_MARK_PROP]: true,
      source: funcSource,
      tree: arrow,
    };
    result.functions[stmt.id.name] = {
      [PARSED_MARK_PROP]: true,
      source: funcSource,
      tree: arrow,
    };
  }
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
