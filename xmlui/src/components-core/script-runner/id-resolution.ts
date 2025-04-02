import { get } from "lodash-es";

import {
  T_ARRAY_LITERAL,
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
  T_ASSIGNMENT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_CONST_STATEMENT,
  T_DESTRUCTURE,
  T_DO_WHILE_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_FOR_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_OBJECT_DESTRUCTURE,
  T_OBJECT_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_SWITCH_CASE,
  T_SWITCH_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_UNARY_EXPRESSION,
  T_VAR_DECLARATION,
  T_VAR_STATEMENT,
  T_WHILE_STATEMENT,
  type ArrayDestructure,
  type Expression,
  type ObjectDestructure,
  type PropertyValue,
  type Statement,
  type VarDeclaration,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { ResolutionScope } from "../../parsers/scripting/ResolutionScope";
import { createXmlUiTreeNodeId } from "../../parsers/scripting/Parser";

/**
 * Resolves identifier
 * @param code The code to resolve IDs in
 * @param scope Optional input scope. All new IDs will be added to this scope
 */
export function resolveIdentifiers(
  code: PropertyValue | Expression | Statement | Statement[],
  referenceTrackedApis: Record<string, any> = {},
  scope?: ResolutionScope,
): ResolutionScope {
  if (!scope) {
    scope = {
      topLevelNames: {},
      topLevelDeps: {},
      allDeps: [],
    };
  }

  // --- Keep track of block scopes
  const blockScopes: Set<string>[] = [];
  if (Array.isArray(code)) {
    // --- Resolve all statements
    for (const statement of code) {
      visitNode(statement);
    }
  } else {
    // --- Resolve other code types
    switch (code.type) {
      case "SEV":
        visitNode(code.expr);
        break;

      case "CPV":
        for (const expr of code.parts) {
          if (typeof expr !== "string") {
            visitNode(expr);
          }
        }
        break;

      case "SPV":
        // --- Nothing to do
        break;

      default:
        visitNode(code);
    }
  }

  // --- Remove duplicates
  const deps = collectTopLevelDependencies(code as any);
  scope.allDeps = deps.filter((item, index) => deps.indexOf(item) === index);
  return scope;

  // --- Visits the specified expression to resolve all identifiers within
  function visitNode(expr: Expression | Statement | null | undefined): void {
    // --- (This should not happen, but just in case)
    if (!scope || !expr) return;

    switch (expr.type) {
      // --- Here happens the ID resolution
      case T_IDENTIFIER:
        // --- Check if the identifier is a local variable
        const local = isLocal(blockScopes, expr.name);
        if (!local) {
          // --- Add the identifier to the top-level scope
          scope.topLevelNames[expr.name] = true;
        }
        return;

      // --- Visit expressions recursively
      case T_UNARY_EXPRESSION:
      case T_PREFIX_OP_EXPRESSION:
      case T_POSTFIX_OP_EXPRESSION:
        visitNode(expr.expr);
        return;

      case T_BINARY_EXPRESSION:
        visitNode(expr.left);
        visitNode(expr.right);
        return;

      case T_CONDITIONAL_EXPRESSION:
        visitNode(expr.cond);
        visitNode(expr.thenE);
        visitNode(expr.elseE);
        return;

      case T_SEQUENCE_EXPRESSION:
        for (const subExpr of expr.exprs) {
          visitNode(subExpr);
        }
        return;

      case T_FUNCTION_INVOCATION_EXPRESSION:
        visitNode(expr.obj);
        for (const arg of expr.arguments) {
          visitNode(arg);
        }
        return;

      case T_MEMBER_ACCESS_EXPRESSION:
        visitNode(expr.obj);
        return;

      case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
        visitNode(expr.obj);
        visitNode(expr.member);
        return;

      case T_ARRAY_LITERAL:
        for (const item of expr.items) {
          visitNode(item);
        }
        return;

      case T_OBJECT_LITERAL:
        for (const prop of expr.props) {
          if (Array.isArray(prop)) {
            if (prop[0].type !== T_IDENTIFIER) {
              visitNode(prop[0]);
            }
            visitNode(prop[1]);
          } else {
            visitNode(prop.expr);
          }
        }
        return;

      case T_SPREAD_EXPRESSION:
        visitNode(expr.expr);
        return;

      case T_ASSIGNMENT_EXPRESSION:
        visitNode(expr.leftValue);
        visitNode(expr.expr);
        return;

      case T_ARROW_EXPRESSION: {
        const funcScope = new Set<string>();
        blockScopes.push(funcScope);
        processDeclarations(funcScope, expr.args);
        visitNode(expr.statement);
        blockScopes.pop();
        return;
      }

      // --- Visit statements recursively
      case T_EXPRESSION_STATEMENT:
        visitNode(expr.expr);
        return;

      case T_BLOCK_STATEMENT:
        blockScopes.push(new Set<string>());
        for (const stmt of expr.stmts) {
          visitNode(stmt);
        }
        blockScopes.pop();
        return;

      case T_LET_STATEMENT:
      case T_CONST_STATEMENT:
        const block = getInnermost(blockScopes);
        processDeclarations(block, expr.decls);
        expr.decls.forEach((decl) => {
          if (decl.expr) visitNode(decl.expr);
        });
        return;

      case T_VAR_STATEMENT:
        expr.decls.forEach((decl) => {
          if (!scope) return;
          scope.topLevelNames[decl.id.name] = decl.id;
          if (decl.expr) visitNode(decl.expr);
          const deps = collectTopLevelDependencies(decl.expr);
          scope.topLevelDeps[decl.id.name] = deps;
        });
        return;

      case T_IF_STATEMENT:
        visitNode(expr.cond);
        visitNode(expr.thenB);
        visitNode(expr.elseB);
        return;

      case T_RETURN_STATEMENT:
        visitNode(expr.expr);
        return;

      case T_WHILE_STATEMENT:
        visitNode(expr.cond);
        visitNode(expr.body);
        return;

      case T_DO_WHILE_STATEMENT:
        visitNode(expr.cond);
        visitNode(expr.body);
        return;

      case T_FOR_STATEMENT:
        blockScopes.push(new Set<string>());
        visitNode(expr.init);
        visitNode(expr.cond);
        visitNode(expr.upd);
        visitNode(expr.body);
        blockScopes.pop();
        return;

      case T_FOR_IN_STATEMENT:
      case T_FOR_OF_STATEMENT: {
        const forScope = new Set<string>();
        blockScopes.push(forScope);
        if (expr.varB !== "none") {
          forScope.add(expr.id.name);
        } else {
          visitNode(expr.id);
        }
        visitNode(expr.expr);
        visitNode(expr.body);
        blockScopes.pop();
        return;
      }

      case T_SWITCH_STATEMENT:
        visitNode(expr.expr);
        for (const caseClause of expr.cases) {
          visitNode(caseClause);
        }
        return;

      case T_SWITCH_CASE:
        if (expr.stmts) {
          visitNode(expr.caseE);
          for (const stmt of expr.stmts) {
            visitNode(stmt);
          }
        }
        return;

      case T_THROW_STATEMENT:
        visitNode(expr.expr);
        return;

      case T_TRY_STATEMENT: {
        visitNode(expr.tryB);
        const catchScope = new Set<string>();
        blockScopes.push(catchScope);
        visitNode(expr.catchB);
        if (expr.catchV) blockScopes.pop();
        visitNode(expr.finallyB);
        return;
      }

      case T_FUNCTION_DECLARATION: {
        // --- Check if the identifier is a local variable
        const local = isLocal(blockScopes, expr.id.name);
        if (!local) {
          // --- Add the function declaration to the top-level scope
          scope.topLevelNames[expr.id.name] = expr;
        }
        const funcScope = new Set<string>();
        blockScopes.push(funcScope);
        processDeclarations(funcScope, expr.args);
        visitNode(expr.stmt);
        const deps = collectTopLevelDependencies([expr.stmt]);
        scope.topLevelDeps[expr.id.name] = deps;
        blockScopes.pop();
        return;
      }
    }
  }

  function getInnermost(blockScopes: Set<string>[]): Set<string> {
    if (blockScopes.length === 0) {
      // --- Create a new block scope
      blockScopes.push(new Set<string>());
    }

    // --- Return the innermost scope
    return blockScopes[blockScopes.length - 1];
  }

  function isLocal(blockScopes: Set<string>[], name: string): boolean {
    let isLocal = false;
    for (let i = blockScopes.length - 1; i >= 0; i--) {
      const blockScope = blockScopes[i];
      if (blockScope.has(name)) {
        isLocal = true;
        break;
      }
    }
    return isLocal;
  }

  /**
   * Collects the name of local context variables the specified program depends on
   * @param program Program to visit
   * @param referenceTrackedApis
   */
  function collectTopLevelDependencies(program: Expression | Statement | Statement[]): string[] {
    const blockScopes: Set<string>[] = [];
    let deps = collectDependencies(program);
    return deps.filter((item, index) => deps.indexOf(item) === index);

    // --- This is the function we call recursively to collect dependencies
    function collectDependencies(program: Expression | Statement | Statement[]): string[] {
      let deps: string[] = [];
      if (Array.isArray(program)) {
        program.forEach((stmt) => {
          deps = deps.concat(collectDependencies(stmt));
        });
        return deps;
      }

      switch (program.type) {
        case T_BLOCK_STATEMENT:
          blockScopes.push(new Set<string>());
          deps = collectDependencies(program.stmts);
          blockScopes.pop();
          break;

        case T_EXPRESSION_STATEMENT:
          deps = collectDependencies(program.expr);
          break;

        case T_ARROW_EXPRESSION_STATEMENT:
          blockScopes.push(new Set<string>());
          deps = collectDependencies(program.expr);
          blockScopes.pop();
          break;

        case T_LET_STATEMENT:
        case T_CONST_STATEMENT:
          const block = getInnermost(blockScopes);
          processDeclarations(block, program.decls);
          program.decls.forEach((decl) => {
            if (decl.expr) {
              deps = deps.concat(collectDependencies(decl.expr));
            }
          });
          break;

        case T_IF_STATEMENT:
          deps = collectDependencies(program.cond);
          deps = deps.concat(collectDependencies(program.thenB));
          if (program.elseB) {
            deps = deps.concat(collectDependencies(program.elseB));
          }
          break;

        case T_RETURN_STATEMENT:
          if (program.expr) {
            deps = collectDependencies(program.expr);
          }
          break;

        case T_WHILE_STATEMENT:
          deps = collectDependencies(program.cond);
          deps = deps.concat(collectDependencies(program.body));
          break;

        case T_DO_WHILE_STATEMENT:
          deps = collectDependencies(program.cond);
          deps = deps.concat(collectDependencies(program.body));
          break;

        case T_FOR_STATEMENT:
          blockScopes.push(new Set<string>());
          if (program.init) {
            deps.concat(collectDependencies([program.init]));
          }
          if (program.cond) {
            deps = deps.concat(collectDependencies(program.cond));
          }
          if (program.upd) {
            deps = deps.concat(collectDependencies(program.upd));
          }
          deps = deps.concat(collectDependencies(program.body));
          blockScopes.pop();
          break;

        case T_FOR_IN_STATEMENT:
        case T_FOR_OF_STATEMENT: {
          const forScope = new Set<string>();
          blockScopes.push(forScope);
          if (program.varB !== "none") {
            forScope.add(program.id.name);
          } else {
            if (!isLocal(blockScopes, program.id.name)) {
              scope!.topLevelNames[program.id.name] = program.id;
            }
          }
          deps = deps.concat(collectDependencies(program.expr));
          deps = deps.concat(collectDependencies(program.body));
          blockScopes.pop();
          break;
        }

        case T_THROW_STATEMENT:
          deps = collectDependencies(program.expr);
          break;

        case T_TRY_STATEMENT:
          deps = collectDependencies(program.tryB);
          if (program.catchB) {
            const catchScope = new Set<string>();
            blockScopes.push(catchScope);
            if (program.catchV) {
              catchScope.add(program.catchV.name);
            }
            deps = deps.concat(collectDependencies(program.catchB));
            blockScopes.pop();
          }
          if (program.finallyB) {
            deps = deps.concat(collectDependencies(program.finallyB));
          }
          break;

        case T_SWITCH_STATEMENT:
          deps = collectDependencies(program.expr);
          program.cases.forEach((c) => {
            if (c.caseE) {
              deps = deps.concat(collectDependencies(c.caseE));
            }
            if (c.stmts) {
              deps = deps.concat(collectDependencies(c.stmts));
            }
          });
          break;

        case T_FUNCTION_DECLARATION: {
          const funcScope = new Set<string>();
          blockScopes.push(funcScope);
          processDeclarations(funcScope, program.args);
          const funcDeps = collectDependencies(program.stmt);
          blockScopes.pop();
          return funcDeps;
        }

        case T_IDENTIFIER:
          // --- Any non-block-scoped variable is a dependency to return
          return isLocal(blockScopes, program.name) ? [] : [program.name];

        case T_MEMBER_ACCESS_EXPRESSION:
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "." syntax
          const memberChain = traverseMemberAccessChain(program);
          return memberChain ? [memberChain] : collectDependencies(program.obj);

        case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "[]" syntax
          const calcMemberChain = traverseMemberAccessChain(program);
          if (calcMemberChain) {
            return [calcMemberChain];
          }
          let calcDeps = collectDependencies(program.obj);
          return calcDeps.concat(collectDependencies(program.member));

        case T_SEQUENCE_EXPRESSION:
          let sequenceDeps: string[] = [];
          program.exprs.forEach((expr) => {
            sequenceDeps = sequenceDeps.concat(collectDependencies(expr));
          });
          return sequenceDeps;

        case T_FUNCTION_INVOCATION_EXPRESSION:
          let uncDeps: string[] = [];
          program.arguments?.forEach((arg) => {
            uncDeps = uncDeps.concat(collectDependencies(arg));
          });
          if (program.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
            const caller = program.obj;
            if (caller.obj.type === T_IDENTIFIER) {
              if (
                typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) ===
                "function"
              ) {
                uncDeps.push(`${caller.obj.name}.${caller.member}`);
              } else {
                uncDeps.push(`${caller.obj.name}`);
              }
            } else if (
              caller.obj.type === T_MEMBER_ACCESS_EXPRESSION ||
              caller.obj.type === T_CALCULATED_MEMBER_ACCESS_EXPRESSION
            ) {
              uncDeps = uncDeps.concat(collectDependencies(caller.obj));
            } else {
              uncDeps = uncDeps.concat(collectDependencies(caller));
            }
          } else {
            uncDeps = uncDeps.concat(collectDependencies(program.obj));
          }
          return uncDeps;

        case T_ARROW_EXPRESSION: {
          // --- Process the current arguments
          const funcScope = new Set<string>();
          blockScopes.push(funcScope);
          const argSpecs = program.args;
          for (let i = 0; i < argSpecs.length; i++) {
            // --- Turn argument specification into processable variable declarations
            const argSpec = argSpecs[i];
            let decl: VarDeclaration | undefined;
            switch (argSpec.type) {
              case T_IDENTIFIER: {
                decl = {
                  type: T_VAR_DECLARATION,
                  nodeId: createXmlUiTreeNodeId(),
                  id: argSpec.name,
                };
                break;
              }
              case T_DESTRUCTURE: {
                decl = {
                  type: T_VAR_DECLARATION,
                  nodeId: createXmlUiTreeNodeId(),
                  id: argSpec.id,
                  aDestr: argSpec.aDestr,
                  oDestr: argSpec.oDestr,
                };
                break;
              }
            }

            // --- Process declarations
            processDeclarations(funcScope, [decl!]);
          }

          // --- Process the arrow expression's body
          const arrowDeps = collectDependencies([program.statement]);

          // --- Remove the block scope
          blockScopes.pop();

          // --- Done
          return arrowDeps;
        }

        case T_OBJECT_LITERAL:
          let objectDeps: string[] = [];
          program.props.forEach((prop) => {
            if (Array.isArray(prop)) {
              objectDeps = objectDeps.concat(collectDependencies(prop[1]));
            } else {
              objectDeps = objectDeps.concat(collectDependencies(prop));
            }
          });
          return objectDeps;

        case T_ARRAY_LITERAL:
          let arrayDeps: string[] = [];
          program.items.forEach((expr) => {
            if (expr) {
              arrayDeps = arrayDeps.concat(collectDependencies(expr));
            }
          });
          return arrayDeps;

        case T_UNARY_EXPRESSION:
          return collectDependencies(program.expr);

        case T_PREFIX_OP_EXPRESSION:
          return collectDependencies(program.expr);

        case T_POSTFIX_OP_EXPRESSION:
          return collectDependencies(program.expr);

        case T_BINARY_EXPRESSION:
          return collectDependencies(program.left).concat(collectDependencies(program.right));

        case T_ASSIGNMENT_EXPRESSION:
          return collectDependencies(program.expr);

        case T_CONDITIONAL_EXPRESSION:
          return collectDependencies(program.cond).concat(
            collectDependencies(program.thenE),
            collectDependencies(program.elseE),
          );

        case T_VAR_DECLARATION:
          return collectDependencies(program.expr!);

        case T_SPREAD_EXPRESSION:
          return collectDependencies(program.expr);
      }

      // --- Done.
      return deps;
    }
  }

  // --- Traverses a member access chain. Returns the chain as a string or null
  // --- if the chain is not simple
  function traverseMemberAccessChain(expr: Expression): string | null {
    switch (expr.type) {
      case T_MEMBER_ACCESS_EXPRESSION:
        const memberChain = traverseMemberAccessChain(expr.obj);
        return memberChain ? `${memberChain}.${expr.member}` : null;
      case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
        let value: string | null = null;
        if (expr.member.type === T_LITERAL) {
          value = `'${expr.member.value?.toString() ?? null}'`;
        } else if (expr.member.type === T_IDENTIFIER) {
          value = expr.member.name;
        }
        if (!value) break;
        const calcMemberChain = traverseMemberAccessChain(expr.obj);
        return calcMemberChain ? `${calcMemberChain}[${value}]` : null;
      case T_IDENTIFIER:
        return isLocal(blockScopes, expr.name) ? null : expr.name;
    }
    return null;
  }
}

// --- Process a variable declaration
function processDeclarations(block: Set<string>, declarations: Expression[]): void {
  for (let i = 0; i < declarations.length; i++) {
    const decl = declarations[i];
    switch (decl.type) {
      case T_VAR_DECLARATION:
        visitDeclaration(block, decl);
        break;
      case T_DESTRUCTURE:
        if (decl.aDestr) visitArrayDestruct(block, decl.aDestr);
        break;
      case T_OBJECT_DESTRUCTURE:
        if (decl.oDestr) visitObjectDestruct(block, decl.oDestr);
        break;
      case T_IDENTIFIER:
        block.add(decl.name);
        break;
    }
  }

  // --- Visit a variable
  function visitDeclaration(block: Set<string>, decl: VarDeclaration): void {
    // --- Process each declaration
    if (decl.id) {
      block.add(decl.id);
    } else if (decl.aDestr) {
      visitArrayDestruct(block, decl.aDestr);
    } else if (decl.oDestr) {
      visitObjectDestruct(block, decl.oDestr);
    }
  }

  // --- Visits an array destructure declaration
  function visitArrayDestruct(block: Set<string>, arrayD: ArrayDestructure[]): void {
    for (let i = 0; i < arrayD.length; i++) {
      const arrDecl = arrayD[i];
      if (arrDecl.id) {
        block.add(arrDecl.id);
      } else if (arrDecl.aDestr) {
        visitArrayDestruct(block, arrDecl.aDestr);
      } else if (arrDecl.oDestr) {
        visitObjectDestruct(block, arrDecl.oDestr);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(block: Set<string>, objectD: ObjectDestructure[]): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      if (objDecl.aDestr) {
        visitArrayDestruct(block, objDecl.aDestr);
      } else if (objDecl.oDestr) {
        visitObjectDestruct(block, objDecl.oDestr);
      } else {
        block.add(objDecl.id);
      }
    }
  }
}
