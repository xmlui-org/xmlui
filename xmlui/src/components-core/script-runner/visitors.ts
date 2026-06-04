import { get } from "lodash-es";

import type {
  ArrayDestructure,
  Expression,
  ObjectDestructure,
  Statement,
  VarDeclaration,
  CodeDeclaration,
  Identifier} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import { getIdentifierScope } from "./eval-tree-common";
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
import { parseParameterString } from "./ParameterParser";
import { isParsedValue } from "../state/variable-resolution";

/**
 * Collects the name of local context variables the specified program depends on
 * @param program Program to visit
 * @param referenceTrackedApis
 * @param options.includeAssignmentTargets When true, the LHS of an assignment
 *   expression is also walked. The engine requires assignment targets to
 *   already exist in scope (otherwise `evalAssignmentCore` throws "Left value
 *   variable not found in the scope"). Reactive dependency tracking should
 *   leave this false to avoid re-running an expression that writes to its own
 *   trigger. The `computedUses` analyzer must pass true so the parent scope
 *   provides write targets at runtime.
 */
export function collectVariableDependencies(
  program: Expression | Statement[],
  referenceTrackedApis: Record<string, any> = {},
  options: { includeAssignmentTargets?: boolean } = {},
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
              stmtDeps = stmtDeps.concat(collectDependencies([stmt.init], stmt, "for"));
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
              // Respect block scope: a function call like `param.method(...)` where
              // `param` is a locally declared identifier (arrow-fn parameter,
              // const/let in the current scope, etc.) is NOT a parent-state
              // dependency. Skip it to avoid polluting computedUses with names
              // that don't live in the parent container.
              const callerScope = getIdentifierScope(caller.obj, evalContext, thread);
              if (callerScope.type !== "block") {
                if (
                  typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) ===
                  "function"
                ) {
                  uncDeps.push(`${caller.obj.name}.${caller.member}`);
                } else {
                  uncDeps.push(`${caller.obj.name}`);
                }
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
            } else if ("kind" in prop) {
              objectDeps = objectDeps.concat(
                collectDependencies(prop.key, program, "objectLiteralAccessorKey"),
                collectDependencies(prop.value, program, "objectLiteralAccessor"),
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
          return options.includeAssignmentTargets
            ? collectDependencies(program.leftValue, program, "left").concat(
                collectDependencies(program.expr, program, "right"),
              )
            : collectDependencies(program.expr, program, "right");

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

/**
 * Strips a dotted/bracketed access chain down to its leading identifier.
 *
 * Examples:
 *   "foo"            -> "foo"
 *   "foo.bar"        -> "foo"
 *   "foo[0].bar"     -> "foo"
 *   "foo['x'].bar"   -> "foo"
 */
export function rootIdentifier(dep: string): string {
  const dot = dep.indexOf(".");
  const bracket = dep.indexOf("[");
  if (dot === -1 && bracket === -1) return dep;
  if (dot === -1) return dep.slice(0, bracket);
  if (bracket === -1) return dep.slice(0, dot);
  return dep.slice(0, Math.min(dot, bracket));
}

/**
 * Walk a plain-object AST tree collecting Identifier node names.
 *
 * It avoids collecting property names of member access expressions
 * (e.g. in `foo.bar`, `foo` is collected but `bar` is not).
 *
 * This fallback is needed for event handler ASTs that arrive with string-typed
 * `type` discriminators (e.g. `"Identifier"`, `"ExpressionStatement"`) rather
 * than the numeric constants the real scripting parser emits. This format
 * appears when event handler objects are constructed directly (e.g. in tests
 * or via JSON-serialised ASTs) instead of being produced by the scripting
 * parser. `collectVariableDependencies` only handles the numeric-discriminator
 * format, so we fall back to a structural walk for the string-discriminator
 * case.
 */
export function gatherIdentifiers(
  node: unknown,
  acc: Set<string> = new Set(),
): Set<string> {
  if (node === null || node === undefined || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const item of node) gatherIdentifiers(item, acc);
    return acc;
  }
  const obj = node as Record<string, unknown>;
  if (obj.type === "Identifier" && typeof obj.name === "string") {
    acc.add(obj.name);
  }
  if (obj.type === "MemberAccessExpression") {
    // Only collect the object, not the member.
    gatherIdentifiers(obj.obj, acc);
    return acc;
  }
  for (const val of Object.values(obj)) gatherIdentifiers(val, acc);
  return acc;
}

/**
 * Collects component/state dependencies for a given value (expression,
 * parsed AST, or raw template string with `{...}` interpolations).
 *
 * Returns the **reads-only** subset — assignment-only targets (LHS of `=`
 * that is never read on the RHS) are excluded. This matches the historical
 * behaviour and is what reactive-graph consumers need: a write-only reference
 * should not become an inbound edge.
 *
 * For the richer "all references including write targets" variant used by the
 * `computedUses` optimiser, see `depsOfValueWithReads`.
 */
export function depsOfValue(value: unknown, stripRoot = true): string[] {
  const process = (id: string) => (stripRoot ? rootIdentifier(id) : id);
  try {
    if (value === null || value === undefined) return [];
    if (isParsedValue(value)) {
      // isParsedValue narrows to CodeDeclaration, which has a typed .tree field.
      return (collectVariableDependencies((value as CodeDeclaration).tree) ?? []).map(process);
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      // Raw event handler AST: has a `statements` array with numeric-type nodes.
      if (obj.statements && Array.isArray(obj.statements)) {
        const hasStringDiscriminators =
          obj.statements.length > 0 && typeof (obj.statements[0] as any)?.type === "string";
        if (hasStringDiscriminators) {
          return Array.from(gatherIdentifiers(obj.statements)).map(process);
        }
        try {
          return (collectVariableDependencies(obj.statements) ?? []).map(process);
        } catch {
          // collectVariableDependencies failed — fall back to generic identifier walk.
          return Array.from(gatherIdentifiers(obj.statements)).map(process);
        }
      }
      return [];
    }
    if (typeof value === "string") {
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        for (const id of collectVariableDependencies(part.value) ?? []) {
          acc.add(process(id));
        }
      }
      return Array.from(acc);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Returns dependencies for a value as two distinct sets — the richer
 * companion to `depsOfValue`.
 *
 *   - `all`   — every identifier that must be present in scope at runtime,
 *               i.e. reads **plus** assignment-only targets. This is what
 *               `computedUses` lists, because the script engine throws
 *               "Left value variable not found in the scope" if an
 *               assignment target is missing from scope.
 *
 *   - `reads` — only identifiers whose VALUES are actually consumed
 *               (RHS reads, member-access roots, etc.). This is what decides
 *               whether to promote a component to an implicit container
 *               (Select/List/Table/DataGrid). Write-only targets do not need
 *               to trigger re-renders, so promoting on them adds an
 *               unnecessary StateContainer that can break a component's
 *               internal lifecycle (e.g. Select's clearable state).
 *
 * Always applies `rootIdentifier` to collected names — that matches every
 * existing consumer in the optimiser and keeps the public shape predictable.
 */
export function depsOfValueWithReads(
  value: unknown,
): { all: string[]; reads: string[] } {
  try {
    if (value === null || value === undefined) return { all: [], reads: [] };
    if (isParsedValue(value)) {
      const tree = (value as CodeDeclaration).tree;
      const all = (
        collectVariableDependencies(tree, {}, { includeAssignmentTargets: true }) ?? []
      ).map(rootIdentifier);
      const reads = (collectVariableDependencies(tree) ?? []).map(rootIdentifier);
      return { all, reads };
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (obj.statements && Array.isArray(obj.statements)) {
        const hasStringDiscriminators =
          obj.statements.length > 0 &&
          typeof (obj.statements[0] as any)?.type === "string";
        if (hasStringDiscriminators) {
          // String-discriminator ASTs (e.g. "Identifier", "ExpressionStatement")
          // are not handled by the structured visitor. Fall back to a flat name
          // gather; this loses scope tracking but is conservative — it never
          // misses a reference, at worst it includes locals that runtime
          // narrowing will simply not find in the parent state. Without scope
          // tracking we cannot tell reads from write-only targets, so the same
          // set is reported under both keys.
          const ids = Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
          return { all: ids, reads: ids };
        }
        try {
          const all = (
            collectVariableDependencies(obj.statements, {}, {
              includeAssignmentTargets: true,
            }) ?? []
          ).map(rootIdentifier);
          const reads = (collectVariableDependencies(obj.statements) ?? []).map(rootIdentifier);
          return { all, reads };
        } catch {
          const ids = Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
          return { all: ids, reads: ids };
        }
      }
      return { all: [], reads: [] };
    }
    if (typeof value === "string") {
      // String props in XMLUI carry templated expressions through `{...}`
      // interpolation. `parseParameterString` splits the string on top-level
      // `{...}` segments and yields each interpolated expression separately.
      // Plain text segments are ignored — so label="Run", classnames, testIds,
      // etc. yield NO deps (they have no `{...}` segments). Event handlers and
      // other rich values arrive here as pre-parsed CodeDeclaration / object
      // trees and are handled by the branches above; strings that fall through
      // are template strings only.
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        for (const id of collectVariableDependencies(part.value) ?? []) {
          acc.add(rootIdentifier(id));
        }
      }
      const ids = Array.from(acc);
      return { all: ids, reads: ids };
    }
    return { all: [], reads: [] };
  } catch {
    return { all: [], reads: [] };
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
