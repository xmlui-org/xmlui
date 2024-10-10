import type { Statement, Expression } from "@abstractions/scripting/ScriptingSourceTree";

const unreachable = (_x: never) => {};

type VisitSubject = Statement | Expression;

/* Visitors take this type as argument and return it
 * `data` is the output that the caller of visitNode will be interested in
 *[key: string] is a hack from the type system's perspective, but useful.
 * If visitor X calls visitor Y, X can use the working state of Y if it is defined inside these keys and not in global vars*/
export type VisitorState<TState = any> = {
  data: TState;
  cancel: boolean;
  skipChildren: boolean;
  [key: string]: any;
};

/* This visitor is called usually twice on every statement when give to a `visitNode` function
 * before = true when entering a statement and before = false when exiting it.
 * If the stmt is a leaf node (break, continue),it will be called once with before = true */
type StmtVisitor<TState = any> = (
  before: boolean,
  visited: Statement,
  state: VisitorState<TState>,
  parent?: VisitSubject,
  tag?: string
) => VisitorState<TState>;

/* This visitor is called usually twice on every expression when give to a `visitNode` function
 * before = true when entering an expr and before = false when exiting it.
 * If the expr is a leaf node (literal, identifier, ...),it will be called once with before = true */
type ExprVisitor<TState = any> = (
  before: boolean,
  visited: Expression,
  state: VisitorState<TState>,
  parent?: VisitSubject,
  tag?: string
) => VisitorState<TState>;

/*Walk through the ast, executing visitors on the nodes
 *
 * @param subject the root of the tree to start the walk from
 * @param state the initial state that will be passed through to the visitors
 * @param stmtVisior will be called on every statement. If undefined, statements will be ignored
 * @param exprVisitor will be called on every expression. If undefined, exoressiones will be ignored
 */
export function visitNode<TState = any>(
  subject: VisitSubject | Statement[],
  state: VisitorState<TState>,
  stmtVisitor?: StmtVisitor<TState>,
  exprVisitor?: ExprVisitor<TState>,
  parent?: VisitSubject,
  tag?: string
): VisitorState<TState> {
  // --- Stop visiting if cancelled
  if (state.cancel) {
    return state;
  }

  // --- By default visit all children down the hierarchy
  state.skipChildren = false;

  if (Array.isArray(subject)) {
    for (const statement of subject) {
      state = visitNode(statement, state, stmtVisitor, exprVisitor, parent, tag);
    }
    return state;
  }

  switch (subject.type) {
    case "BlockS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const statement of subject.statements) {
          state = visitNode(statement, state, stmtVisitor, exprVisitor, subject, "statements");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "EmptyS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case "ExprS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ArrowS": {
      //cannot reach that
      return state;
    }

    case "LetS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const declaration of subject.declarations) {
          state = visitNode(declaration, state, stmtVisitor, exprVisitor, subject, "declarations");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ConstS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const declaration of subject.declarations) {
          state = visitNode(declaration, state, stmtVisitor, exprVisitor, subject, "declarations");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "VarS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const declaration of subject.declarations) {
          state = visitNode(declaration, state, stmtVisitor, exprVisitor, subject, "declarations");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "IfS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.condition, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
        if (subject.thenBranch) {
          state = visitNode(subject.thenBranch, state, stmtVisitor, exprVisitor, subject, "thenBranch");
        }
        if (state.cancel) return state;
        if (subject.elseBranch) {
          state = visitNode(subject.elseBranch, state, stmtVisitor, exprVisitor, subject, "elseBranch");
        }
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;

      return state;
    }

    case "RetS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.expression) {
          state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        }
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "BrkS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case "ContS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case "WhileS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.condition, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "DoWS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
        state = visitNode(subject.condition, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ForS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.init) {
          state = visitNode(subject.init, state, stmtVisitor, exprVisitor, subject, "init");
        }
        if (state.cancel) return state;
        if (subject.condition) {
          state = visitNode(subject.condition, state, stmtVisitor, exprVisitor, subject, "condition");
        }
        if (state.cancel) return state;
        if (subject.update) {
          state = visitNode(subject.update, state, stmtVisitor, exprVisitor, subject, "update");
        }
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ForInS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ForOfS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ThrowS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }
    case "TryS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.tryBlock) {
          state = visitNode(subject.tryBlock, state, stmtVisitor, exprVisitor, subject, "tryBlock");
        }
        if (state.cancel) return state;
        if (subject.catchBlock) {
          state = visitNode(subject.catchBlock, state, stmtVisitor, exprVisitor, subject, "catchBlock");
        }
        if (state.cancel) return state;
        if (subject.finallyBlock) {
          state = visitNode(subject.finallyBlock, state, stmtVisitor, exprVisitor, subject, "finallyBlock");
        }
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }
    case "SwitchS": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
        for (const switchCase of subject.cases) {
          if (switchCase.caseExpression)
            state = visitNode(switchCase.caseExpression, state, stmtVisitor, exprVisitor, subject, "caseExpression");
          if (state.cancel) return state;
          if (switchCase.statements === undefined) continue;
          for (const statement of switchCase.statements) {
            state = visitNode(statement, state, stmtVisitor, exprVisitor, subject, "switchStatement");
            if (state.cancel) return state;
          }
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "FuncD": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const expr of subject.args) {
          state = visitNode(expr, state, stmtVisitor, exprVisitor, subject, "arg");
          if (state.cancel) return state;
        }
        state = visitNode(subject.statement, state, stmtVisitor, exprVisitor, subject, "statement");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "ImportD": {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    // ================= Expressions =================
    case "UnaryE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.operand, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "BinaryE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.left, state, stmtVisitor, exprVisitor, subject, "left");
        if (state.cancel) return state;
        state = visitNode(subject.right, state, stmtVisitor, exprVisitor, subject, "right");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "SeqE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const expr of subject.expressions) {
          state = visitNode(expr, state, stmtVisitor, exprVisitor, subject, "expression");
          if (state.cancel) return state;
        }
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "CondE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.condition, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
        state = visitNode(subject.consequent, state, stmtVisitor, exprVisitor, subject, "consequent");
        if (state.cancel) return state;
        state = visitNode(subject.alternate, state, stmtVisitor, exprVisitor, subject, "alternate");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "InvokeE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const arg of subject.arguments) {
          state = visitNode(arg, state, stmtVisitor, exprVisitor, subject, "argument");
          if (state.cancel) return state;
        }
        state = visitNode(subject.object, state, stmtVisitor, exprVisitor, subject, "object");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "MembE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.object, state, stmtVisitor, exprVisitor, subject, "object");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "CMembE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.object, state, stmtVisitor, exprVisitor, subject, "object");
        if (state.cancel) return state;
        state = visitNode(subject.member, state, stmtVisitor, exprVisitor, subject, "member");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "IdE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case "LitE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case "ALitE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const item of subject.items) {
          state = visitNode(item, state, stmtVisitor, exprVisitor, subject, "item");
          if (state.cancel) return state;
        }
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "OLitE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const prop of subject.props) {
          if (Array.isArray(prop)) {
            const [key, value]: [Expression, Expression] = prop;
            state = visitNode(key, state, stmtVisitor, exprVisitor, subject, "propKey");
            if (state.cancel) return state;
            state = visitNode(value, state, stmtVisitor, exprVisitor, subject, "propValue");
            if (state.cancel) return state;
          } else {
            //SpreadExpression branch
            state = visitNode(prop, state, stmtVisitor, exprVisitor, subject, "prop");
            if (state.cancel) return state;
          }
        }
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "SpreadE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.operand, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "AsgnE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.operand, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
        state = visitNode(subject.leftValue, state, stmtVisitor, exprVisitor, subject, "leftValue");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "NoArgE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case "ArrowE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const expr of subject.args) {
          state = visitNode(expr, state, stmtVisitor, exprVisitor, subject, "arg");
          if (state.cancel) return state;
        }
        state = visitNode(subject.statement, state, stmtVisitor, exprVisitor, subject, "statement");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "PrefE":
    case "PostfE": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.operand, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "VarD": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.arrayDestruct !== undefined) {
          for (const expr of subject.arrayDestruct) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }

        if (subject.objectDestruct !== undefined) {
          for (const expr of subject.objectDestruct) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }

        if (subject.expression) {
          state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        }
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "Destr":
    case "ODestr":
    case "ADestr": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.arrayDestruct !== undefined) {
          for (const expr of subject.arrayDestruct) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }

        if (subject.objectDestruct !== undefined) {
          for (const expr of subject.objectDestruct) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "RVarD": {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.expression) {
          state = visitNode(subject.expression, state, stmtVisitor, exprVisitor, subject, "expression");
        }
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case "TempLitE":
      // TODO: Implement this
      return state;

    default:
      unreachable(subject);
      return state;
  }
}
