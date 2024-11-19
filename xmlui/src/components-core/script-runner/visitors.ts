import { get } from "lodash-es";

import type {
  ArrayDestructure,
  Expression,
  ObjectDestructure,
  Statement,
  VarDeclaration,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";

import { ensureMainThread, innermostBlockScope } from "./process-statement-common";
import { getIdentifierScope } from "./eval-tree-common";
import { Identifier } from "@abstractions/scripting/ScriptingSourceTreeExp";

/**
 * Collects the name of local context variables the specified program depends on
 * @param program Program to visit
 * @param referenceTrackedApis
 */
export function collectVariableDependencies(
  program: Expression | Statement[],
  referenceTrackedApis: Record<string, any> = {}
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
    tag?: string
  ): string[] {
    if (Array.isArray(program)) {
      // --- Visit statements
      let deps: string[] = [];
      program.forEach((stmt) => {
        let stmtDeps: string[] = [];
        switch (stmt.type) {
          case "BlockS":
            thread.blocks!.push({ vars: {} });
            stmtDeps = collectDependencies(stmt.statements, stmt, "block");
            thread.blocks!.pop();
            break;

          case "ExprS":
            stmtDeps = collectDependencies(stmt.expression, stmt, "expression");
            break;

          case "ArrowS":
            thread.blocks!.push({ vars: {} });
            stmtDeps = collectDependencies(stmt.expression, stmt, "arrow");
            thread.blocks!.pop();
            break;

          case "LetS":
          case "ConstS":
            processDeclarations(innermostBlockScope(thread)!, stmt.declarations);
            stmt.declarations.forEach((decl) => {
              if (decl.expression) {
                stmtDeps = stmtDeps.concat(collectDependencies(decl.expression, stmt, "letOrConst"));
              }
            });
            break;

          case "IfS":
            stmtDeps = collectDependencies(stmt.condition, stmt, "if");
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.thenBranch], stmt, "if"));
            if (stmt.elseBranch) {
              stmtDeps = stmtDeps.concat(collectDependencies([stmt.elseBranch], stmt, "if"));
            }
            break;

          case "RetS":
            if (stmt.expression) {
              stmtDeps = collectDependencies(stmt.expression, stmt, "return");
            }
            break;

          case "WhileS":
            stmtDeps = collectDependencies(stmt.condition, stmt, "while");
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "while"));
            break;

          case "DoWS":
            stmtDeps = collectDependencies(stmt.condition, stmt, "doWhile");
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "doWhile"));
            break;

          case "ForS":
            thread.blocks!.push({ vars: {} });
            if (stmt.init) {
              stmtDeps.concat(collectDependencies([stmt.init], stmt, "for"));
            }
            if (stmt.condition) {
              stmtDeps = stmtDeps.concat(collectDependencies(stmt.condition, stmt, "for"));
            }
            if (stmt.update) {
              stmtDeps = stmtDeps.concat(collectDependencies(stmt.update, stmt, "for"));
            }
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "for"));
            thread.blocks!.pop();
            break;

          case "ForInS":
            thread.blocks!.push({ vars: {} });
            if (stmt.varBinding !== "none") {
              const block = innermostBlockScope(thread);
              block!.vars[stmt.id] = true;
            }
            stmtDeps = stmtDeps.concat(collectDependencies(stmt.expression, stmt, "forIn"));
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "forIn"));
            thread.blocks!.pop();
            break;

          case "ForOfS":
            thread.blocks!.push({ vars: {} });
            if (stmt.varBinding !== "none") {
              const block = innermostBlockScope(thread);
              block!.vars[stmt.id] = true;
            }
            stmtDeps = stmtDeps.concat(collectDependencies(stmt.expression, stmt, "forOf"));
            stmtDeps = stmtDeps.concat(collectDependencies([stmt.body], stmt, "forOf"));
            thread.blocks!.pop();
            break;

          case "ThrowS":
            stmtDeps = collectDependencies(stmt.expression, stmt, "throw");
            break;

          case "TryS":
            stmtDeps = collectDependencies([stmt.tryBlock], stmt, "try");
            if (stmt.catchBlock) {
              thread.blocks!.push({ vars: {} });
              if (stmt.catchVariable) {
                const block = innermostBlockScope(thread);
                block!.vars[stmt.catchVariable] = true;
              }
              stmtDeps = stmtDeps.concat(collectDependencies([stmt.catchBlock], stmt, "catchBlock"));
              thread.blocks!.pop();
            }
            if (stmt.finallyBlock) {
              stmtDeps = stmtDeps.concat(collectDependencies([stmt.finallyBlock], stmt, "finallyBlock"));
            }
            break;

          case "SwitchS":
            stmtDeps = collectDependencies(stmt.expression, stmt, "switch");
            stmt.cases.forEach((c) => {
              if (c.caseExpression) {
                stmtDeps = stmtDeps.concat(collectDependencies(c.caseExpression, stmt, "switch"));
              }
              if (c.statements) {
                stmtDeps = stmtDeps.concat(collectDependencies(c.statements, stmt, "switch"));
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
        case "IdE":
          // --- Any non-block-scoped variable is a dependency to return
          const scope = getIdentifierScope(program, evalContext, thread);
          return scope.type !== "block" ? [program.name] : [];

        case "MembE":
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "." syntax
          const memberChain = traverseMemberAccessChain(program);
          return memberChain ? [memberChain] : collectDependencies(program.object, program, "memberAccess");

        case "CMembE":
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "[]" syntax
          const calcMemberChain = traverseMemberAccessChain(program);
          if (calcMemberChain) {
            return [calcMemberChain];
          }
          let calcDeps = collectDependencies(program.object, program, "calculatedMember");
          return calcDeps.concat(collectDependencies(program.member, program, "calculatedMember"));

        case "SeqE":
          let sequenceDeps: string[] = [];
          program.expressions.forEach((expr) => {
            sequenceDeps = sequenceDeps.concat(collectDependencies(expr, program, "sequence"));
          });
          return sequenceDeps;

        case "InvokeE":
          let uncDeps: string[] = [];
          program.arguments?.forEach((arg) => {
            uncDeps = uncDeps.concat(collectDependencies(arg, program, "functionInvocation"));
          });
          if (program.object.type === "MembE") {
            const caller = program.object;
            if (caller.object.type === "IdE") {
              if (typeof get(referenceTrackedApis, `${caller.object.name}.${caller.member}`) === "function") {
                uncDeps.push(`${caller.object.name}.${caller.member}`);
              } else {
                uncDeps.push(`${caller.object.name}`);
              }
            } else if (caller.object.type === "MembE" || caller.object.type === "CMembE") {
              uncDeps = uncDeps.concat(collectDependencies(caller.object, caller, "functionInvocation"));
            } else {
              uncDeps = uncDeps.concat(collectDependencies(caller, program, "functionInvocation"));
            }
          } else {
            uncDeps = uncDeps.concat(collectDependencies(program.object, program, "functionInvocation"));
          }
          return uncDeps;

        case "ArrowE":
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
              case "IdE": {
                decl = {
                  type: "VarD",
                  id: argSpec.name,
                } as VarDeclaration;
                break;
              }
              case "Destr": {
                decl = {
                  type: "VarD",
                  id: argSpec.id,
                  arrayDestruct: argSpec.arrayDestruct,
                  objectDestruct: argSpec.objectDestruct,
                } as VarDeclaration;
                break;
              }
              case "SpreadE": {
                restFound = true;
                decl = {
                  type: "VarD",
                  id: (argSpec.operand as unknown as Identifier).name,
                } as VarDeclaration;
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

        case "OLitE":
          let objectDeps: string[] = [];
          program.props.forEach((prop) => {
            if (Array.isArray(prop)) {
              objectDeps = objectDeps.concat(collectDependencies(prop[1], program, "objectLiteral"));
            } else {
              objectDeps = objectDeps.concat(collectDependencies(prop, program, "objectLiteral"));
            }
          });
          return objectDeps;

        case "ALitE":
          let arrayDeps: string[] = [];
          program.items.forEach((expr) => {
            if (expr) {
              arrayDeps = arrayDeps.concat(collectDependencies(expr, program, "array"));
            }
          });
          return arrayDeps;

        case "UnaryE":
          return collectDependencies(program.operand, program, "unary");

        case "PrefE":
          return collectDependencies(program.operand, program, "prefix");

        case "PostfE":
          return collectDependencies(program.operand, program, "postfix");

        case "BinaryE":
          return collectDependencies(program.left, program, "left").concat(
            collectDependencies(program.right, program, "right")
          );

        case "AsgnE":
          return collectDependencies(program.operand, program, "right");

        case "CondE":
          return collectDependencies(program.condition, program, "condition").concat(
            collectDependencies(program.consequent, program, "trueExpr"),
            collectDependencies(program.alternate, program, "falseExpr")
          );

        case "VarD":
          return collectDependencies(program.expression!, program, "varDeclaration");

        case "SpreadE":
          return collectDependencies(program.operand, program, "spread");
      }
    }

    return [];
  }

  // --- Traverses a member access chain. Returns the chain as a string or null
  // --- if the chain is not simple
  function traverseMemberAccessChain(expr: Expression): string | null {
    switch (expr.type) {
      case "MembE":
        const memberChain = traverseMemberAccessChain(expr.object);
        return memberChain ? `${memberChain}.${expr.member}` : null;
      case "CMembE":
        let value: string | null = null;
        if (expr.member.type === "LitE") {
          value = `'${expr.member.value?.toString() ?? null}'`;
        } else if (expr.member.type === "IdE") {
          value = expr.member.name;
        }
        if (!value) break;
        const calcMemberChain = traverseMemberAccessChain(expr.object);
        return calcMemberChain ? `${calcMemberChain}[${value}]` : null;
      case "IdE":
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
    } else if (decl.arrayDestruct) {
      visitArrayDestruct(block, decl.arrayDestruct);
    } else if (decl.objectDestruct) {
      visitObjectDestruct(block, decl.objectDestruct);
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
      } else if (arrDecl.arrayDestruct) {
        visitArrayDestruct(block, arrDecl.arrayDestruct);
      } else if (arrDecl.objectDestruct) {
        visitObjectDestruct(block, arrDecl.objectDestruct);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(block: BlockScope, objectD: ObjectDestructure[]): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      if (objDecl.arrayDestruct) {
        visitArrayDestruct(block, objDecl.arrayDestruct);
      } else if (objDecl.objectDestruct) {
        visitObjectDestruct(block, objDecl.objectDestruct);
      } else {
        visitIdDeclaration(block, objDecl.alias ?? objDecl.id!);
      }
    }
  }
}
