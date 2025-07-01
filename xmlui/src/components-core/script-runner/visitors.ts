import { get } from "lodash-es";

import type {
  ArrayDestructure,
  Expression,
  ObjectDestructure,
  Statement,
  VarDeclaration,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import { getIdentifierScope } from "./eval-tree-common";
import {
  Identifier,
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
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
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
  T_WHILE_STATEMENT,
} from "./ScriptingSourceTree";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import { ensureMainThread, innermostBlockScope } from "./process-statement-common";

/**
 * Collects the name of local context variables the specified program depends on
 * @param program Program to visit
 * @param referenceTrackedApis
 */
export function collectVariableDependencies(
  program: Expression | Statement[],
  referenceTrackedApis: Record<string, any> = {},
): string[] {
  // --- We use these variables to keep track of local variable scopes
  const evalContext: BindingTreeEvaluationContext = {};
  const thread = ensureMainThread(evalContext);

  const deps = collectDependencies(program);

  // --- Filter out duplicates
  return deps.filter((item, index) => deps.indexOf(item) === index);

  // --- This is the function we call recursively to collect dependencies
  function collectDependencies(
    program: Expression | Statement[],
    parent?: Statement | Expression,
    tag?: string,
  ): string[] {
    if (Array.isArray(program)) {
      // --- Visit statements
      let deps: string[] = [];
      program.forEach((stmt) => {
        let stmtDeps: string[] = [];
        switch (stmt.type) {
          case T_BLOCK_STATEMENT:
            thread.blocks!.push({ vars: {} });
            stmtDeps = collectDependencies(stmt.stmts, stmt, "block");
            thread.blocks!.pop();
            break;

          case T_EXPRESSION_STATEMENT:
            stmtDeps = collectDependencies(stmt.expr, stmt, "expression");
            break;

          case T_ARROW_EXPRESSION_STATEMENT:
            thread.blocks!.push({ vars: {} });
            stmtDeps = collectDependencies(stmt.expr, stmt, "arrow");
            thread.blocks!.pop();
            break;

          case T_LET_STATEMENT:
          case T_CONST_STATEMENT:
            processDeclarations(innermostBlockScope(thread)!, stmt.decls);
            stmt.decls.forEach((decl) => {
              if (decl.expr) {
                stmtDeps = stmtDeps.concat(collectDependencies(decl.expr, stmt, "letOrConst"));
              }
            });
            break;

          case T_IF_STATEMENT:
            stmtDeps = collectDependencies(stmt.cond, stmt, "if");
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.thenB], stmt, "if"));
            if (stmt.elseB) {
              stmtDeps = stmtDeps.concat(collectDependencies([stmt.elseB], stmt, "if"));
            }
            break;

          case T_RETURN_STATEMENT:
            if (stmt.expr) {
              stmtDeps = collectDependencies(stmt.expr, stmt, "return");
            }
            break;

          case T_WHILE_STATEMENT:
            stmtDeps = collectDependencies(stmt.cond, stmt, "while");
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "while"));
            break;

          case T_DO_WHILE_STATEMENT:
            stmtDeps = collectDependencies(stmt.cond, stmt, "doWhile");
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "doWhile"));
            break;

          case T_FOR_STATEMENT:
            thread.blocks!.push({ vars: {} });
            if (stmt.init) {
              stmtDeps.concat(collectDependencies([stmt.init], stmt, "for"));
            }
            if (stmt.cond) {
              stmtDeps = stmtDeps.concat(collectDependencies(stmt.cond, stmt, "for"));
            }
            if (stmt.upd) {
              stmtDeps = stmtDeps.concat(collectDependencies(stmt.upd, stmt, "for"));
            }
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "for"));
            thread.blocks!.pop();
            break;

          case T_FOR_IN_STATEMENT:
            thread.blocks!.push({ vars: {} });
            if (stmt.varB !== "none") {
              const block = innermostBlockScope(thread);
              block!.vars[stmt.id.name] = true;
            }
            stmtDeps = stmtDeps.concat(collectDependencies(stmt.expr, stmt, "forIn"));
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "forIn"));
            thread.blocks!.pop();
            break;

          case T_FOR_OF_STATEMENT:
            thread.blocks!.push({ vars: {} });
            if (stmt.varB !== "none") {
              const block = innermostBlockScope(thread);
              block!.vars[stmt.id.name] = true;
            }
            stmtDeps = stmtDeps.concat(collectDependencies(stmt.expr, stmt, "forOf"));
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "forOf"));
            thread.blocks!.pop();
            break;

          case T_THROW_STATEMENT:
            stmtDeps = collectDependencies(stmt.expr, stmt, "throw");
            break;

          case T_TRY_STATEMENT:
            stmtDeps = collectDependencies([stmt.tryB], stmt, "try");
            if (stmt.catchB) {
              thread.blocks!.push({ vars: {} });
              if (stmt.catchV) {
                const block = innermostBlockScope(thread);
                block!.vars[stmt.catchV.name] = true;
              }
              stmtDeps = stmtDeps.concat(collectDependencies([stmt.catchB], stmt, "catchBlock"));
              thread.blocks!.pop();
            }
            if (stmt.finallyB) {
              stmtDeps = stmtDeps.concat(
                collectDependencies([stmt.finallyB], stmt, "finallyBlock"),
              );
            }
            break;

          case T_SWITCH_STATEMENT:
            stmtDeps = collectDependencies(stmt.expr, stmt, "switch");
            stmt.cases.forEach((c) => {
              if (c.caseE) {
                stmtDeps = stmtDeps.concat(collectDependencies(c.caseE, stmt, "switch"));
              }
              if (c.stmts) {
                stmtDeps = stmtDeps.concat(collectDependencies(c.stmts, stmt, "switch"));
              }
            });
            break;
        }
        deps = deps.concat(stmtDeps);
      });
      return deps;
    } else {
      // --- Visit expression
      switch (program.type) {
        case T_IDENTIFIER:
          // --- Any non-block-scoped variable is a dependency to return
          const scope = getIdentifierScope(program, evalContext, thread);
          return scope.type !== "block" ? [program.name] : [];

        case T_MEMBER_ACCESS_EXPRESSION:
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "." syntax
          const memberChain = traverseMemberAccessChain(program);
          return memberChain
            ? [memberChain]
            : collectDependencies(program.obj, program, "memberAccess");

        case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "[]" syntax
          const calcMemberChain = traverseMemberAccessChain(program);
          if (calcMemberChain) {
            return [calcMemberChain];
          }
          let calcDeps = collectDependencies(program.obj, program, "calculatedMember");
          return calcDeps.concat(collectDependencies(program.member, program, "calculatedMember"));

        case T_SEQUENCE_EXPRESSION:
          let sequenceDeps: string[] = [];
          program.exprs.forEach((expr) => {
            sequenceDeps = sequenceDeps.concat(collectDependencies(expr, program, "sequence"));
          });
          return sequenceDeps;

        case T_FUNCTION_INVOCATION_EXPRESSION:
          let uncDeps: string[] = [];
          program.arguments?.forEach((arg) => {
            uncDeps = uncDeps.concat(collectDependencies(arg, program, "functionInvocation"));
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
              uncDeps = uncDeps.concat(
                collectDependencies(caller.obj, caller, "functionInvocation"),
              );
            } else {
              uncDeps = uncDeps.concat(collectDependencies(caller, program, "functionInvocation"));
            }
          } else {
            uncDeps = uncDeps.concat(
              collectDependencies(program.obj, program, "functionInvocation"),
            );
          }
          return uncDeps;

        case T_ARROW_EXPRESSION:
          // --- Process the current arguments
          thread.blocks!.push({ vars: {} });
          const block = innermostBlockScope(thread);
          const argSpecs = program.args;
          let restFound = false;
          for (let i = 0; i < argSpecs.length; i++) {
            // --- Turn argument specification into processable variable declarations
            const argSpec = argSpecs[i];
            let decl: VarDeclaration | undefined;
            switch (argSpec.type) {
              case T_IDENTIFIER: {
                decl = {
                  type: T_VAR_DECLARATION,
                  nodeId: argSpec.nodeId,
                  id: argSpec.name,
                };
                break;
              }
              case T_DESTRUCTURE: {
                decl = {
                  type: T_VAR_DECLARATION,
                  nodeId: argSpec.nodeId,
                  id: argSpec.id,
                  aDestr: argSpec.aDestr,
                  oDestr: argSpec.oDestr,
                };
                break;
              }
              case T_SPREAD_EXPRESSION: {
                restFound = true;
                decl = {
                  type: T_VAR_DECLARATION,
                  nodeId: argSpec.nodeId,
                  id: (argSpec.expr as Identifier).name,
                };
                break;
              }
              default:
                throw new Error("Unexpected arrow argument specification");
            }

            // --- Process declarations
            processDeclarations(block!, [decl]);
          }

          // --- Process the arrow expression's body
          const arrowDeps = collectDependencies([program.statement], program, "arrow");

          // --- Remove the block scope
          thread.blocks!.pop();

          // --- Done
          return arrowDeps;

        case T_OBJECT_LITERAL:
          let objectDeps: string[] = [];
          program.props.forEach((prop) => {
            if (Array.isArray(prop)) {
              objectDeps = objectDeps.concat(
                collectDependencies(prop[1], program, "objectLiteral"),
              );
            } else {
              objectDeps = objectDeps.concat(collectDependencies(prop, program, "objectLiteral"));
            }
          });
          return objectDeps;

        case T_ARRAY_LITERAL:
          let arrayDeps: string[] = [];
          program.items.forEach((expr) => {
            if (expr) {
              arrayDeps = arrayDeps.concat(collectDependencies(expr, program, "array"));
            }
          });
          return arrayDeps;

        case T_UNARY_EXPRESSION:
          return collectDependencies(program.expr, program, "unary");

        case T_PREFIX_OP_EXPRESSION:
          return collectDependencies(program.expr, program, "prefix");

        case T_POSTFIX_OP_EXPRESSION:
          return collectDependencies(program.expr, program, "postfix");

        case T_BINARY_EXPRESSION:
          return collectDependencies(program.left, program, "left").concat(
            collectDependencies(program.right, program, "right"),
          );

        case T_ASSIGNMENT_EXPRESSION:
          return collectDependencies(program.expr, program, "right");

        case T_CONDITIONAL_EXPRESSION:
          return collectDependencies(program.cond, program, "condition").concat(
            collectDependencies(program.thenE, program, "trueExpr"),
            collectDependencies(program.elseE, program, "falseExpr"),
          );

        case T_VAR_DECLARATION:
          return collectDependencies(program.expr, program, "varDeclaration");

        case T_SPREAD_EXPRESSION:
          return collectDependencies(program.expr, program, "spread");
      }
    }

    return [];
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
        const scope = getIdentifierScope(expr, evalContext, thread);
        return scope.type !== "block" ? expr.name : null;
    }
    return null;
  }
}

// --- Process a variable declaration
function processDeclarations(block: BlockScope, declarations: VarDeclaration[]): void {
  for (let i = 0; i < declarations.length; i++) {
    visitDeclaration(block, declarations[i]);
  }

  // --- Visit a variable
  function visitDeclaration(block: BlockScope, decl: VarDeclaration): void {
    // --- Process each declaration
    if (decl.id) {
      visitIdDeclaration(block, decl.id);
    } else if (decl.aDestr) {
      visitArrayDestruct(block, decl.aDestr);
    } else if (decl.oDestr) {
      visitObjectDestruct(block, decl.oDestr);
    } else {
      throw new Error("Unknown declaration specifier");
    }
  }

  // --- Visits a single ID declaration
  function visitIdDeclaration(block: BlockScope, id: string): void {
    if (block.vars[id]) {
      throw new Error(`Variable ${id} is already declared in the current scope.`);
    }
    block.vars[id] = true;
  }

  // --- Visits an array destructure declaration
  function visitArrayDestruct(block: BlockScope, arrayD: ArrayDestructure[]): void {
    for (let i = 0; i < arrayD.length; i++) {
      const arrDecl = arrayD[i];
      if (arrDecl.id) {
        visitIdDeclaration(block, arrDecl.id);
      } else if (arrDecl.aDestr) {
        visitArrayDestruct(block, arrDecl.aDestr);
      } else if (arrDecl.oDestr) {
        visitObjectDestruct(block, arrDecl.oDestr);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(block: BlockScope, objectD: ObjectDestructure[]): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      if (objDecl.aDestr) {
        visitArrayDestruct(block, objDecl.aDestr);
      } else if (objDecl.oDestr) {
        visitObjectDestruct(block, objDecl.oDestr);
      } else {
        visitIdDeclaration(block, objDecl.alias ?? objDecl.id!);
      }
    }
  }
}
