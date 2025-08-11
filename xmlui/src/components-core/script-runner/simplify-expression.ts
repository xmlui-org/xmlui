import {
  ArrowExpression,
  BlockStatement,
  Expression,
  ReactiveVarDeclaration,
  Statement,
  VarDeclaration,
  ExpressionStatement,
  LetStatement,
  SwitchCase,
  ArrayDestructure,
  ObjectDestructure,
  UnaryExpression,
  ObjectLiteral,
  BinaryExpression,
  T_UNARY_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_ARRAY_LITERAL,
  T_OBJECT_LITERAL,
  T_ASSIGNMENT_EXPRESSION,
  T_ARROW_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_VAR_DECLARATION,
  T_REACTIVE_VAR_DECLARATION,
  T_SWITCH_CASE,
  T_BLOCK_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_ARROW_EXPRESSION_STATEMENT,
  T_LET_STATEMENT,
  T_CONST_STATEMENT,
  T_VAR_STATEMENT,
  T_IF_STATEMENT,
  T_RETURN_STATEMENT,
  T_WHILE_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_FOR_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_SWITCH_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_LITERAL,
} from "./ScriptingSourceTree";

export function simplifyExpression(expr?: Expression): Expression | undefined {
  let orig = expr;
  let newExpr = expr;
  do {
    orig = newExpr;
    newExpr = simplify(orig);
  } while (orig !== newExpr);
  return newExpr;

  function simplify(expr?: Expression): Expression | undefined {
    if (!expr) return expr;
    switch (expr.type) {
      case T_UNARY_EXPRESSION: {
        const simplified = simplifyUnaryExpression(expr);
        if (simplified !== expr) return simplified;
        return updateExpr(expr, { expr: simplifyExpression(expr.expr) });
      }
      case T_BINARY_EXPRESSION: {
        const simplified = simplifyBinaryExpression(expr);
        if (simplified !== expr) return simplified;
        return updateExpr(expr, {
          left: simplifyExpression(expr.left),
          right: simplifyExpression(expr.right),
        });
      }
      case T_SEQUENCE_EXPRESSION:
        return updateExpr(expr, {
          exprs: simplifyExpressionList(expr.exprs),
        });
      case T_CONDITIONAL_EXPRESSION:
        // TODO: Check for constant expressions and evaluate them
        return updateExpr(expr, {
          cond: simplifyExpression(expr.cond),
          thenE: simplifyExpression(expr.thenE),
          elseE: simplifyExpression(expr.elseE),
        });
      case T_FUNCTION_INVOCATION_EXPRESSION:
        return updateExpr(expr, {
          obj: simplifyExpression(expr.obj),
          arguments: simplifyExpressionList(expr.arguments),
        });
      case T_MEMBER_ACCESS_EXPRESSION:
        return updateExpr(expr, {
          obj: simplifyExpression(expr.obj),
        });
      case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
        return updateExpr(expr, {
          obj: simplifyExpression(expr.obj),
          member: simplifyExpression(expr.member),
        });
      case T_SPREAD_EXPRESSION:
        return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case T_ARRAY_LITERAL:
        return updateExpr(expr, {
          items: simplifyExpressionList(expr.items),
        });
      case T_OBJECT_LITERAL:
        return updateExpr(expr, simplifyObjectLiteral(expr));
      case T_ASSIGNMENT_EXPRESSION:
        return updateExpr(expr, {
          leftValue: simplifyExpression(expr.leftValue),
          expr: simplifyExpression(expr.expr),
        });
      case T_ARROW_EXPRESSION:
        return updateExpr(expr, {
          args: simplifyExpressionList(expr.args),
          statement: simplifyStatement(expr.statement),
        });
      case T_PREFIX_OP_EXPRESSION:
        case T_POSTFIX_OP_EXPRESSION:
          return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case T_VAR_DECLARATION:
        return simplifyVarDeclaration(expr);
      case T_REACTIVE_VAR_DECLARATION:
        return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case T_SWITCH_CASE:
        return updateExpr(expr, {
          caseE: simplifyExpression(expr.caseE),
          stmts: simplifyStatementList(expr.stmts),
        });
    }
    return expr;
  }
}

function simplifyExpressionList(exprs: Expression[]): Expression[] {
  const newExprList = exprs.map(simplifyExpression);
  const isUpdated = newExprList.some((expr, i) => expr !== exprs[i]);
  return isUpdated ? newExprList : exprs;
}

export function simplifyStatement(stmt?: Statement): Statement | undefined {
  let orig = stmt;
  let newStmt = stmt;
  do {
    orig = newStmt;
    newStmt = simplify(orig);
  } while (orig !== newStmt);
  return newStmt;

  function simplify(stmt?: Statement): Statement | undefined {
    if (!stmt) return stmt;
    switch (stmt.type) {
      case T_BLOCK_STATEMENT:
        return updateStmt(stmt, {
          stmts: simplifyStatementList(stmt.stmts),
        });
      case T_EXPRESSION_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
        });
      case T_ARROW_EXPRESSION_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr) as ArrowExpression,
        });
      case T_LET_STATEMENT:
      case T_CONST_STATEMENT:
        return updateStmt(stmt, {
          decls: simplifyVarDeclarationList(stmt.decls) as VarDeclaration[],
        });
      case T_VAR_STATEMENT:
        return updateStmt(stmt, {
          decls: simplifyExpressionList(stmt.decls) as ReactiveVarDeclaration[],
        });
      case T_IF_STATEMENT:
        return updateStmt(stmt, {
          cond: simplifyExpression(stmt.cond),
          thenB: simplifyStatement(stmt.thenB)!,
          elseB: simplifyStatement(stmt.elseB),
        });
      case T_RETURN_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
        });
      case T_WHILE_STATEMENT:
        return updateStmt(stmt, {
          cond: simplifyExpression(stmt.cond),
          body: simplifyStatement(stmt.body)!,
        });
      case T_DO_WHILE_STATEMENT:
        return updateStmt(stmt, {
          cond: simplifyExpression(stmt.cond),
          body: simplifyStatement(stmt.body)!,
        });
      case T_THROW_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
        });
      case T_TRY_STATEMENT:
        return updateStmt(stmt, {
          tryB: simplifyStatement(stmt.tryB)! as BlockStatement,
          catchB: simplifyStatement(stmt.catchB) as BlockStatement,
          finallyB: simplifyStatement(stmt.finallyB) as BlockStatement,
        });
      case T_FOR_STATEMENT:
        return updateStmt(stmt, {
          init: simplifyStatement(stmt.init) as ExpressionStatement | LetStatement,
          cond: simplifyExpression(stmt.cond),
          upd: simplifyExpression(stmt.upd),
          body: simplifyStatement(stmt.body)!,
        });
      case T_FOR_IN_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
          body: simplifyStatement(stmt.body)!,
        });
      case T_FOR_OF_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
          body: simplifyStatement(stmt.body)!,
        });
      case T_SWITCH_STATEMENT:
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
          cases: simplifyExpressionList(stmt.cases) as SwitchCase[],
        });
      case T_FUNCTION_DECLARATION:
        return updateStmt(stmt, {
          args: simplifyExpressionList(stmt.args),
          stmt: simplifyStatement(stmt.stmt)! as BlockStatement,
        });
    }
    return stmt;
  }
}

function simplifyStatementList(stmts?: Statement[]): Statement[] | undefined {
  if (!stmts) return stmts;
  const newStmtList = stmts.map(simplifyStatement);
  const isUpdated = newStmtList.some((stmt, i) => stmt !== stmts[i]);
  return isUpdated ? newStmtList : stmts;
}

function simplifyDestructure(destr: ArrayDestructure | ObjectDestructure): ArrayDestructure | ObjectDestructure {
  const newArrayDestr = destr.aDestr?.map(simplifyDestructure);
  const newObjectDestr = destr.oDestr?.map(simplifyDestructure);
  const isUpdated =
    newArrayDestr?.some((destr, i) => destr !== destr.aDestr![i]) ||
    newObjectDestr?.some((destr, i) => destr !== destr.oDestr![i]);
  return isUpdated
    ? {
        ...destr,
        aDestr: newArrayDestr,
        oDestr: newObjectDestr,
      } as any
    : destr;
}

function simplifyVarDeclaration(destr: VarDeclaration): VarDeclaration {
  const newArrayDestr = destr.aDestr?.map(simplifyDestructure);
  const newObjectDestr = destr.oDestr?.map(simplifyDestructure);
  const newEpr = simplifyExpression(destr.expr);
  const isUpdated =
    newArrayDestr?.some((destr, i) => destr !== destr.aDestr![i]) ||
    newObjectDestr?.some((destr, i) => destr !== destr.oDestr![i]) ||
    newEpr !== destr.expr;
  return isUpdated
    ? {
        ...destr,
        aDestr: newArrayDestr,
        oDestr: newObjectDestr,
        expr: newEpr,
      } as any
    : destr;
}

function simplifyVarDeclarationList(decls: VarDeclaration[]): VarDeclaration[] {
  const newDeclList = decls.map(simplifyVarDeclaration);
  const isUpdated = newDeclList.some((decl, i) => decl !== decls[i]);
  return isUpdated ? newDeclList : decls;
}

function simplifyObjectLiteral(obj: ObjectLiteral): ObjectLiteral {
  const newProps = obj.props.map((prop) => {
    if (Array.isArray(prop)) {
      const prop0 = simplifyExpression(prop[0]);
      const prop1 = simplifyExpression(prop[1]);
      return prop0 !== prop[0] || prop1 !== prop[1] ? [prop0, prop1] : prop;
    } else {
      return {
        ...prop,
        value: simplifyExpression(prop),
      };
    }
  });
  const isUpdated = newProps.some((prop, i) => prop !== obj.props[i]);
  return isUpdated ? { ...obj, props: newProps } as any : obj;
}

function updateExpr<T extends Expression>(expr: T, props: Partial<T>): T {
  const isUpdated = Object.keys(props).some((key: any) => (expr as any)[key] !== (props as any)[key]);
  return isUpdated ? { ...expr, ...props } as any : expr;
}

function updateStmt<T extends Statement>(stmt: T, props: Partial<T>): T {
  const isUpdated = Object.keys(props).some((key: any) => (stmt as any)[key] !== (props as any)[key]);
  return isUpdated ? { ...stmt, ...props } as any : stmt;
}

function simplifyUnaryExpression(unary: UnaryExpression): Expression {
  if (unary.expr.type === T_LITERAL) {
    let newValue = unary.expr.value;
    try {
      switch (unary.op) {
        case "typeof":
          newValue = typeof unary.expr.value;
          break;
        case "!":
          newValue = !unary.expr.value;
          break;
        case "-":
          newValue = -unary.expr.value;
          break;
        case "~":
          newValue = ~unary.expr.value;
          break;
      }
    } catch {
      // --- Intentionally ignored. In case of error, we keep the original value
    }
    if (newValue !== unary.expr.value) {
      return { type: "LitE", value: newValue } as any;
    }
  }
  return unary;
}

function simplifyBinaryExpression(binary: BinaryExpression): Expression {
  if (binary.left.type === T_LITERAL && binary.right.type === T_LITERAL) {
    let newValue: any = undefined;
    try {
      switch (binary.op) {
        case "**":
          newValue = binary.left.value ** binary.right.value;
          break;
        case "*":
          newValue = binary.left.value * binary.right.value;
          break;
        case "/":
          newValue = binary.left.value / binary.right.value;
          break;
        case "%":
          newValue = binary.left.value % binary.right.value;
          break;
        case "+":
          newValue = binary.left.value + binary.right.value;
          break;
        case "-":
          newValue = binary.left.value - binary.right.value;
          break;
        case "<<":
          newValue = binary.left.value << binary.right.value;
          break;
        case ">>":
          newValue = binary.left.value >> binary.right.value;
          break;
        case ">>>":
          newValue = binary.left.value >>> binary.right.value;
          break;
        case "<":
          newValue = binary.left.value < binary.right.value;
          break;
        case "<=":
          newValue = binary.left.value <= binary.right.value;
          break;
        case ">":
          newValue = binary.left.value > binary.right.value;
          break;
        case ">=":
          newValue = binary.left.value >= binary.right.value;
          break;
        case "==":
          newValue = binary.left.value == binary.right.value;
          break;
        case "===":
          newValue = binary.left.value === binary.right.value;
          break;
        case "!=":
          newValue = binary.left.value != binary.right.value;
          break;
        case "!==":
          newValue = binary.left.value !== binary.right.value;
          break;
        case "&":
          newValue = binary.left.value & binary.right.value;
          break;
        case "|":
          newValue = binary.left.value | binary.right.value;
          break;
        case "^":
          newValue = binary.left.value ^ binary.right.value;
          break;
        case "&&":
          newValue = binary.left.value && binary.right.value;
          break;
        case "||":
          newValue = binary.left.value || binary.right.value;
          break;
      }
    } catch {
      // --- Intentionally ignored. In case of error, we keep the original value
    }
    if (newValue !== undefined) {
      return { type: T_LITERAL, value: newValue } as any;
    }
  } else if (binary.op === "+" && binary.left.type === T_LITERAL && binary.left.value === 0) {
    return binary.right;
  } else if (binary.op === "+" && binary.right.type === T_LITERAL && binary.right.value === 0) {
    return binary.left;
  } else if (binary.op === "-" && binary.right.type === T_LITERAL && binary.right.value === 0) {
    return binary.left;
  } else if (binary.op === "*" && binary.left.type === T_LITERAL && binary.left.value === 1) {
    return binary.right;
  } else if (binary.op === "*" && binary.right.type === T_LITERAL && binary.right.value === 1) {
    return binary.left;
  } else if (binary.op === "*" && binary.right.type === T_LITERAL && binary.right.value === 0) {
    return { type: "LitE", value: 0 } as any;
  } else if (binary.op === "*" && binary.left.type === T_LITERAL && binary.left.value === 0) {
    return { type: "LitE", value: 0 } as any;
  } else if (binary.op === "/" && binary.right.type === T_LITERAL && binary.right.value === 1) {
    return binary.left;
  }
  return binary;
}
