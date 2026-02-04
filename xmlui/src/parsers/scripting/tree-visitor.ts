import {
  type Statement,
  type Expression,
  T_BLOCK_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_ARROW_EXPRESSION_STATEMENT,
  T_LET_STATEMENT,
  T_CONST_STATEMENT,
  T_VAR_STATEMENT,
  T_IF_STATEMENT,
  T_RETURN_STATEMENT,
  T_BREAK_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_WHILE_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_FOR_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_SWITCH_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_UNARY_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_ARRAY_LITERAL,
  T_OBJECT_LITERAL,
  T_SPREAD_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_NO_ARG_EXPRESSION,
  T_ARROW_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_VAR_DECLARATION,
  T_DESTRUCTURE,
  T_OBJECT_DESTRUCTURE,
  T_ARRAY_DESTRUCTURE,
  T_REACTIVE_VAR_DECLARATION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_SWITCH_CASE,
} from "../../components-core/script-runner/ScriptingSourceTree";

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
  tag?: string,
) => VisitorState<TState>;

/* This visitor is called usually twice on every expression when give to a `visitNode` function
 * before = true when entering an expr and before = false when exiting it.
 * If the expr is a leaf node (literal, identifier, ...),it will be called once with before = true */
type ExprVisitor<TState = any> = (
  before: boolean,
  visited: Expression,
  state: VisitorState<TState>,
  parent?: VisitSubject,
  tag?: string,
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
  tag?: string,
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
    case T_BLOCK_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const statement of subject.stmts) {
          state = visitNode(statement, state, stmtVisitor, exprVisitor, subject, "statements");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_EMPTY_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case T_EXPRESSION_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_ARROW_EXPRESSION_STATEMENT: {
      //--- Cannot reach that
      return state;
    }

    case T_LET_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const declaration of subject.decls) {
          state = visitNode(declaration, state, stmtVisitor, exprVisitor, subject, "declarations");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_CONST_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const declaration of subject.decls) {
          state = visitNode(declaration, state, stmtVisitor, exprVisitor, subject, "declarations");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_VAR_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const declaration of subject.decls) {
          state = visitNode(declaration, state, stmtVisitor, exprVisitor, subject, "declarations");
          if (state.cancel) return state;
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_IF_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.cond, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
        if (subject.thenB) {
          state = visitNode(subject.thenB, state, stmtVisitor, exprVisitor, subject, "thenBranch");
        }
        if (state.cancel) return state;
        if (subject.elseB) {
          state = visitNode(subject.elseB, state, stmtVisitor, exprVisitor, subject, "elseBranch");
        }
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;

      return state;
    }

    case T_RETURN_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.expr) {
          state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        }
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_BREAK_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case T_CONTINUE_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case T_WHILE_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.cond, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_DO_WHILE_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
        state = visitNode(subject.cond, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_FOR_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.init) {
          state = visitNode(subject.init, state, stmtVisitor, exprVisitor, subject, "init");
        }
        if (state.cancel) return state;
        if (subject.cond) {
          state = visitNode(subject.cond, state, stmtVisitor, exprVisitor, subject, "condition");
        }
        if (state.cancel) return state;
        if (subject.upd) {
          state = visitNode(subject.upd, state, stmtVisitor, exprVisitor, subject, "update");
        }
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_FOR_IN_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_FOR_OF_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
        state = visitNode(subject.body, state, stmtVisitor, exprVisitor, subject, "body");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_THROW_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }
    case T_TRY_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.tryB) {
          state = visitNode(subject.tryB, state, stmtVisitor, exprVisitor, subject, "tryBlock");
        }
        if (state.cancel) return state;
        if (subject.catchB) {
          state = visitNode(subject.catchB, state, stmtVisitor, exprVisitor, subject, "catchBlock");
        }
        if (state.cancel) return state;
        if (subject.finallyB) {
          state = visitNode(
            subject.finallyB,
            state,
            stmtVisitor,
            exprVisitor,
            subject,
            "finallyBlock",
          );
        }
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }
    case T_SWITCH_STATEMENT: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        if (state.cancel) return state;
        for (const switchCase of subject.cases) {
          if (switchCase.caseE)
            state = visitNode(
              switchCase.caseE,
              state,
              stmtVisitor,
              exprVisitor,
              subject,
              "caseExpression",
            );
          if (state.cancel) return state;
          if (switchCase.stmts === undefined) continue;
          for (const statement of switchCase.stmts) {
            state = visitNode(
              statement,
              state,
              stmtVisitor,
              exprVisitor,
              subject,
              "switchStatement",
            );
            if (state.cancel) return state;
          }
        }
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_FUNCTION_DECLARATION: {
      state = stmtVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const expr of subject.args) {
          state = visitNode(expr, state, stmtVisitor, exprVisitor, subject, "arg");
          if (state.cancel) return state;
        }
        state = visitNode(subject.stmt, state, stmtVisitor, exprVisitor, subject, "statement");
        if (state.cancel) return state;
      }
      state = stmtVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    // ================= Expressions =================
    case T_UNARY_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_BINARY_EXPRESSION: {
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

    case T_SEQUENCE_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const expr of subject.exprs) {
          state = visitNode(expr, state, stmtVisitor, exprVisitor, subject, "expression");
          if (state.cancel) return state;
        }
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_CONDITIONAL_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.cond, state, stmtVisitor, exprVisitor, subject, "condition");
        if (state.cancel) return state;
        state = visitNode(subject.thenE, state, stmtVisitor, exprVisitor, subject, "consequent");
        if (state.cancel) return state;
        state = visitNode(subject.elseE, state, stmtVisitor, exprVisitor, subject, "alternate");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_FUNCTION_INVOCATION_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        for (const arg of subject.arguments) {
          state = visitNode(arg, state, stmtVisitor, exprVisitor, subject, "argument");
          if (state.cancel) return state;
        }
        state = visitNode(subject.obj, state, stmtVisitor, exprVisitor, subject, "object");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_MEMBER_ACCESS_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.obj, state, stmtVisitor, exprVisitor, subject, "object");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.obj, state, stmtVisitor, exprVisitor, subject, "object");
        if (state.cancel) return state;
        state = visitNode(subject.member, state, stmtVisitor, exprVisitor, subject, "member");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_IDENTIFIER: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case T_LITERAL: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case T_ARRAY_LITERAL: {
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

    case T_OBJECT_LITERAL: {
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

    case T_SPREAD_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_ASSIGNMENT_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
        state = visitNode(subject.leftValue, state, stmtVisitor, exprVisitor, subject, "leftValue");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_NO_ARG_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      return state;
    }

    case T_ARROW_EXPRESSION: {
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

    case T_PREFIX_OP_EXPRESSION:
    case T_POSTFIX_OP_EXPRESSION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "operand");
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_VAR_DECLARATION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.aDestr !== undefined) {
          for (const expr of subject.aDestr) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }

        if (subject.oDestr !== undefined) {
          for (const expr of subject.oDestr) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }

        if (subject.expr) {
          state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        }
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_DESTRUCTURE:
    case T_OBJECT_DESTRUCTURE:
    case T_ARRAY_DESTRUCTURE: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.aDestr !== undefined) {
          for (const expr of subject.aDestr) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }

        if (subject.oDestr !== undefined) {
          for (const expr of subject.oDestr) {
            state = visitNode(expr, state, stmtVisitor, exprVisitor, subject);
            if (state.cancel) return state;
          }
        }
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_REACTIVE_VAR_DECLARATION: {
      state = exprVisitor?.(true, subject, state, parent, tag) || state;
      if (state.cancel) return state;
      if (!state.skipChildren) {
        if (subject.expr) {
          state = visitNode(subject.expr, state, stmtVisitor, exprVisitor, subject, "expression");
        }
        if (state.cancel) return state;
      }
      state = exprVisitor?.(false, subject, state, parent, tag) || state;
      return state;
    }

    case T_TEMPLATE_LITERAL_EXPRESSION:
      // TODO: Implement this
      return state;

    case T_SWITCH_CASE:
      return state;

    default:
      return state;
  }
}
