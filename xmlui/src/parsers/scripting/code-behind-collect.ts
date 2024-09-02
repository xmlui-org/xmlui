import type {
  ArrowExpression,
  CodeDeclaration,
  CollectedDeclarations,
  Expression,
  FunctionDeclaration,
  Statement,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { VisitorState } from "./tree-visitor";
import type { ModuleResolver } from "@abstractions/scripting/modules";

import { visitNode } from "./tree-visitor";
import { isModuleErrors, obtainClosures, parseScriptModule } from "./modules";

export const PARSED_MARK_PROP = "__PARSED__";

// --- Collect module statements from a parsed module
export function collectCodeBehindFromSource(
  moduleName: string,
  source: string,
  moduleResolver: ModuleResolver
): CollectedDeclarations {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
  };

  // --- Parse the module (recursively, including imported modules) in restrictive mode
  const parsedModule = parseScriptModule(moduleName, source, moduleResolver, true);
  if (isModuleErrors(parsedModule)) {
    return { ...result, moduleErrors: parsedModule };
  }

  // --- Collect imported functions
  if (parsedModule.imports) {
    Object.keys(parsedModule.imports).forEach((key) => {
      const obj = parsedModule.imports[key];
      if (obj.type === "FuncD") {
        addFunctionDeclaration(obj);
      }
    });
  }

  // --- Collect statements from the module
  parsedModule.statements.forEach((stmt) => {
    switch (stmt.type) {
      case "VarS":
        stmt.declarations.forEach((decl) => {
          if (decl.id in result.vars) {
            throw new Error(`Duplicated var declaration: '${decl.id}'`);
          }
          result.vars[decl.id] = {
            [PARSED_MARK_PROP]: true,
            source: decl.expression.source,
            tree: decl.expression,
          };
        });
        break;
      case "FuncD":
        addFunctionDeclaration(stmt);
        break;
      case "ImportD":
        // --- Do nothing
        break;
      default:
        throw new Error(`'${stmt.type}' is not allowed in a code-behind module.`);
    }
  });
  return result;

  // --- Collect function declaration data
  function addFunctionDeclaration(stmt: FunctionDeclaration): void {
    if (stmt.name in result.functions) {
      throw new Error(`Duplicated function declaration: '${stmt.name}'`);
    }
    const funcSource =
      stmt.args.length === 1
        ? `${stmt.args[0].source} => ${stmt.statement.source}`
        : `(${stmt.args.map((a) => a.source).join(", ")}) => ${stmt.statement.source}`;
    const arrow: ArrowExpression = {
      type: "ArrowE",
      args: stmt.args.slice(),
      statement: stmt.statement,
      closureContext: obtainClosures({
        childThreads: [],
        blocks: [{ vars: {} }],
        loops: [],
        breakLabelValue: -1
      }),
    } as ArrowExpression;

    // --- Remove the circular reference from the function to its closure context
    const functionSelf = arrow.closureContext![0]?.vars?.[stmt.name] as FunctionDeclaration;
    if (functionSelf?.closureContext) {
      delete functionSelf.closureContext;
    }

    result.functions[stmt.name] = {
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
          delete visited.startPosition;
          delete visited.endPosition;
          delete visited.startLine;
          delete visited.endLine;
          delete visited.startColumn;
          delete visited.endColumn;
          delete visited.startToken;
          delete visited.endToken;
          // delete visited.source;
        }
      }
      return state;
    };

    visitNode(declaration.tree, state, nodeVisitor, nodeVisitor);
  }
}
