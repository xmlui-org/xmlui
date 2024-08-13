import { get } from "lodash-es";

import type { ResolutionScope } from "./ResolutionScope";
import type {
  ArrayDestructure,
  Expression,
  ObjectDestructure,
  PropertyValue,
  Statement,
  VarDeclaration,
} from "./source-tree";

/**
 * Resolves identifier
 * @param code The code to resolve IDs in
 * @param scope Optional input scope. All new IDs will be added to this scope
 */
export function resolveIdentifiers(
  code: PropertyValue | Expression | Statement | Statement[],
  referenceTrackedApis: Record<string, any> = {},
  scope?: ResolutionScope
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
      case "IdE":
        // --- Check if the identifier is a local variable
        const local = isLocal(blockScopes, expr.name);
        if (!local) {
          // --- Add the identifier to the top-level scope
          scope.topLevelNames[expr.name] = true;
        }
        return;

      // --- Visit expressions recursively
      case "UnaryE":
      case "PrefE":
      case "PostfE":
        visitNode(expr.expr);
        return;

      case "BinaryE":
        visitNode(expr.left);
        visitNode(expr.right);
        return;

      case "CondE":
        visitNode(expr.cond);
        visitNode(expr.thenE);
        visitNode(expr.elseE);
        return;

      case "SeqE":
        for (const subExpr of expr.exprs) {
          visitNode(subExpr);
        }
        return;

      case "InvokeE":
        visitNode(expr.obj);
        for (const arg of expr.arguments) {
          visitNode(arg);
        }
        return;

      case "MembE":
        visitNode(expr.obj);
        return;

      case "CMembE":
        visitNode(expr.obj);
        visitNode(expr.member);
        return;

      case "ALitE":
        for (const item of expr.items) {
          visitNode(item);
        }
        return;

      case "OLitE":
        for (const prop of expr.props) {
          if (Array.isArray(prop)) {
            if (prop[0].type !== "IdE") {
              visitNode(prop[0]);
            }
            visitNode(prop[1]);
          } else {
            visitNode(prop.expr);
          }
        }
        return;

      case "SpreadE":
        visitNode(expr.expr);
        return;

      case "AsgnE":
        visitNode(expr.leftValue);
        visitNode(expr.expr);
        return;

      case "ArrowE": {
        const funcScope = new Set<string>();
        blockScopes.push(funcScope);
        processDeclarations(funcScope, expr.args);
        visitNode(expr.statement);
        blockScopes.pop();
        return;
      }

      // --- Visit statements recursively
      case "ExprS":
        visitNode(expr.expr);
        return;

      case "BlockS":
        blockScopes.push(new Set<string>());
        for (const stmt of expr.stmts) {
          visitNode(stmt);
        }
        blockScopes.pop();
        return;

      case "LetS":
      case "ConstS":
        const block = getInnermost(blockScopes);
        processDeclarations(block, expr.decls);
        expr.decls.forEach((decl) => {
          if (decl.expr) visitNode(decl.expr);
        });
        return;

      case "VarS":
        expr.decls.forEach((decl) => {
          if (!scope) return;
          scope.topLevelNames[decl.id.name] = decl.id;
          if (decl.expr) visitNode(decl.expr);
          const deps = collectTopLevelDependencies(decl.expr);
          scope.topLevelDeps[decl.id.name] = deps;
        });
        return;

      case "IfS":
        visitNode(expr.cond);
        visitNode(expr.thenB);
        visitNode(expr.elseB);
        return;

      case "RetS":
        visitNode(expr.expr);
        return;

      case "WhileS":
        visitNode(expr.cond);
        visitNode(expr.body);
        return;

      case "DoWS":
        visitNode(expr.cond);
        visitNode(expr.body);
        return;

      case "ForS":
        blockScopes.push(new Set<string>());
        visitNode(expr.init);
        visitNode(expr.cond);
        visitNode(expr.upd);
        visitNode(expr.body);
        blockScopes.pop();
        return;

      case "ForInS":
      case "ForOfS": {
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

      case "SwitchS":
        visitNode(expr.expr);
        for (const caseClause of expr.cases) {
          visitNode(caseClause);
        }
        return;

      case "SwitchC":
        if (expr.stmts) {
          visitNode(expr.caseE);
          for (const stmt of expr.stmts) {
            visitNode(stmt);
          }
        }
        return;

      case "ThrowS":
        visitNode(expr.expr);
        return;

      case "TryS": {
        visitNode(expr.tryB);
        const catchScope = new Set<string>();
        blockScopes.push(catchScope);
        visitNode(expr.catchB);
        if (expr.catchV) blockScopes.pop();
        visitNode(expr.finallyB);
        return;
      }

      case "FuncD": {
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
      case "ImportD":
        for (const item of expr.imports) {
          visitNode(item.id);
        }
        return;
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
        case "BlockS":
          blockScopes.push(new Set<string>());
          deps = collectDependencies(program.stmts);
          blockScopes.pop();
          break;

        case "ExprS":
          deps = collectDependencies(program.expr);
          break;

        case "ArrowS":
          blockScopes.push(new Set<string>());
          deps = collectDependencies(program.expr);
          blockScopes.pop();
          break;

        case "LetS":
        case "ConstS":
          const block = getInnermost(blockScopes);
          processDeclarations(block, program.decls);
          program.decls.forEach((decl) => {
            if (decl.expr) {
              deps = deps.concat(collectDependencies(decl.expr));
            }
          });
          break;

        case "IfS":
          deps = collectDependencies(program.cond);
          deps = deps.concat(collectDependencies(program.thenB));
          if (program.elseB) {
            deps = deps.concat(collectDependencies(program.elseB));
          }
          break;

        case "RetS":
          if (program.expr) {
            deps = collectDependencies(program.expr);
          }
          break;

        case "WhileS":
          deps = collectDependencies(program.cond);
          deps = deps.concat(collectDependencies(program.body));
          break;

        case "DoWS":
          deps = collectDependencies(program.cond);
          deps = deps.concat(collectDependencies(program.body));
          break;

        case "ForS":
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

        case "ForInS":
        case "ForOfS": {
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

        case "ThrowS":
          deps = collectDependencies(program.expr);
          break;

        case "TryS":
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

        case "SwitchS":
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

        case "FuncD": {
          const funcScope = new Set<string>();
          blockScopes.push(funcScope);
          processDeclarations(funcScope, program.args);
          const funcDeps = collectDependencies(program.stmt);
          blockScopes.pop();
          return funcDeps;
        }

        case "IdE":
          // --- Any non-block-scoped variable is a dependency to return
          return isLocal(blockScopes, program.name) ? [] : [program.name];

        case "MembE":
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "." syntax
          const memberChain = traverseMemberAccessChain(program);
          return memberChain ? [memberChain] : collectDependencies(program.obj);

        case "CMembE":
          // --- Check for a simple member-access chain. If it exist, add the member to the chain with the "[]" syntax
          const calcMemberChain = traverseMemberAccessChain(program);
          if (calcMemberChain) {
            return [calcMemberChain];
          }
          let calcDeps = collectDependencies(program.obj);
          return calcDeps.concat(collectDependencies(program.member));

        case "SeqE":
          let sequenceDeps: string[] = [];
          program.exprs.forEach((expr) => {
            sequenceDeps = sequenceDeps.concat(collectDependencies(expr));
          });
          return sequenceDeps;

        case "InvokeE":
          let uncDeps: string[] = [];
          program.arguments?.forEach((arg) => {
            uncDeps = uncDeps.concat(collectDependencies(arg));
          });
          if (program.obj.type === "MembE") {
            const caller = program.obj;
            if (caller.obj.type === "IdE") {
              if (typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) === "function") {
                uncDeps.push(`${caller.obj.name}.${caller.member}`);
              } else {
                uncDeps.push(`${caller.obj.name}`);
              }
            } else if (caller.obj.type === "MembE" || caller.obj.type === "CMembE") {
              uncDeps = uncDeps.concat(collectDependencies(caller.obj));
            } else {
              uncDeps = uncDeps.concat(collectDependencies(caller));
            }
          } else {
            uncDeps = uncDeps.concat(collectDependencies(program.obj));
          }
          return uncDeps;

        case "ArrowE": {
          // --- Process the current arguments
          const funcScope = new Set<string>();
          blockScopes.push(funcScope);
          const argSpecs = program.args;
          for (let i = 0; i < argSpecs.length; i++) {
            // --- Turn argument specification into processable variable declarations
            const argSpec = argSpecs[i];
            let decl: VarDeclaration | undefined;
            switch (argSpec.type) {
              case "IdE": {
                decl = {
                  type: "VarD",
                  id: argSpec.name,
                };
                break;
              }
              case "Destr": {
                decl = {
                  type: "VarD",
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

        case "OLitE":
          let objectDeps: string[] = [];
          program.props.forEach((prop) => {
            if (Array.isArray(prop)) {
              objectDeps = objectDeps.concat(collectDependencies(prop[1]));
            } else {
              objectDeps = objectDeps.concat(collectDependencies(prop));
            }
          });
          return objectDeps;

        case "ALitE":
          let arrayDeps: string[] = [];
          program.items.forEach((expr) => {
            if (expr) {
              arrayDeps = arrayDeps.concat(collectDependencies(expr));
            }
          });
          return arrayDeps;

        case "UnaryE":
          return collectDependencies(program.expr);

        case "PrefE":
          return collectDependencies(program.expr);

        case "PostfE":
          return collectDependencies(program.expr);

        case "BinaryE":
          return collectDependencies(program.left).concat(collectDependencies(program.right));

        case "AsgnE":
          return collectDependencies(program.expr);

        case "CondE":
          return collectDependencies(program.cond).concat(
            collectDependencies(program.thenE),
            collectDependencies(program.elseE)
          );

        case "VarD":
          return collectDependencies(program.expr!);

        case "SpreadE":
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
      case "MembE":
        const memberChain = traverseMemberAccessChain(expr.obj);
        return memberChain ? `${memberChain}.${expr.member}` : null;
      case "CMembE":
        let value: string | null = null;
        if (expr.member.type === "LitE") {
          value = `'${expr.member.value?.toString() ?? null}'`;
        } else if (expr.member.type === "IdE") {
          value = expr.member.name;
        }
        if (!value) break;
        const calcMemberChain = traverseMemberAccessChain(expr.obj);
        return calcMemberChain ? `${calcMemberChain}[${value}]` : null;
      case "IdE":
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
      case "VarD":
        visitDeclaration(block, decl);
        break;
      case "ADestr":
        if (decl.aDestr) visitArrayDestruct(block, decl.aDestr);
        break;
      case "ODestr":
        if (decl.oDestr) visitObjectDestruct(block, decl.oDestr);
        break;
      case "IdE":
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
