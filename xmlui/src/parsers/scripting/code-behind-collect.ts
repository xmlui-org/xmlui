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
import { isModuleErrors, parseScriptModule } from "./modules";

export const PARSED_MARK_PROP = "__PARSED__";

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
        addFunctionDeclaration(stmt);
        break;
      default:
        result.hasInvalidStatements = true;
    }
  });
  return result;

  // --- Collect function declaration data
  function addFunctionDeclaration(stmt: FunctionDeclaration): void {
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
      // closureContext: obtainClosures({
      //   childThreads: [],
      //   blocks: [{ vars: {} }],
      //   loops: [],
      //   breakLabelValue: -1,
      // }),
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
