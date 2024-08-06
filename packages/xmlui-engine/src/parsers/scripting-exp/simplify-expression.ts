import { deepFreeze } from "@parsers/common/utils";
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
} from "./source-tree";

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
      case "UnaryE": {
        const simplified = simplifyUnaryExpression(expr);
        if (simplified !== expr) return simplified;
        return updateExpr(expr, { expr: simplifyExpression(expr.expr) });
      }
      case "BinaryE": {
        const simplified = simplifyBinaryExpression(expr);
        if (simplified !== expr) return simplified;
        return updateExpr(expr, {
          left: simplifyExpression(expr.left),
          right: simplifyExpression(expr.right),
        });
      }
      case "SeqE":
        return updateExpr(expr, {
          exprs: simplifyExpressionList(expr.exprs),
        });
      case "CondE":
        // TODO: Check for constant expressions and evaluate them
        return updateExpr(expr, {
          cond: simplifyExpression(expr.cond),
          thenE: simplifyExpression(expr.thenE),
          elseE: simplifyExpression(expr.elseE),
        });
      case "InvokeE":
        return updateExpr(expr, {
          obj: simplifyExpression(expr.obj),
          arguments: simplifyExpressionList(expr.arguments),
        });
      case "MembE":
        return updateExpr(expr, {
          obj: simplifyExpression(expr.obj),
        });
      case "CMembE":
        return updateExpr(expr, {
          obj: simplifyExpression(expr.obj),
          member: simplifyExpression(expr.member),
        });
      case "SpreadE":
        return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case "ALitE":
        return updateExpr(expr, {
          items: simplifyExpressionList(expr.items),
        });
      case "OLitE":
        return updateExpr(expr, simplifyObjectLiteral(expr));
      case "AsgnE":
        return updateExpr(expr, {
          leftValue: simplifyExpression(expr.leftValue),
          expr: simplifyExpression(expr.expr),
        });
      case "ArrowE":
        return updateExpr(expr, {
          args: simplifyExpressionList(expr.args),
          statement: simplifyStatement(expr.statement),
        });
      case "PrefE":
        return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case "PostfE":
        return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case "VarD":
        return simplifyVarDeclaration(expr);
      case "RVarD":
        return updateExpr(expr, {
          expr: simplifyExpression(expr.expr),
        });
      case "SwitchC":
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
  return isUpdated ? deepFreeze(newExprList) : exprs;
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
      case "BlockS":
        return updateStmt(stmt, {
          stmts: simplifyStatementList(stmt.stmts),
        });
      case "ExprS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
        });
      case "ArrowS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr) as ArrowExpression,
        });
      case "LetS":
      case "ConstS":
        return updateStmt(stmt, {
          decls: simplifyVarDeclarationList(stmt.decls) as VarDeclaration[],
        });
      case "VarS":
        return updateStmt(stmt, {
          decls: simplifyExpressionList(stmt.decls) as ReactiveVarDeclaration[],
        });
      case "IfS":
        return updateStmt(stmt, {
          cond: simplifyExpression(stmt.cond),
          thenB: simplifyStatement(stmt.thenB)!,
          elseB: simplifyStatement(stmt.elseB),
        });
      case "RetS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
        });
      case "WhileS":
        return updateStmt(stmt, {
          cond: simplifyExpression(stmt.cond),
          body: simplifyStatement(stmt.body)!,
        });
      case "DoWS":
        return updateStmt(stmt, {
          cond: simplifyExpression(stmt.cond),
          body: simplifyStatement(stmt.body)!,
        });
      case "ThrowS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
        });
      case "TryS":
        return updateStmt(stmt, {
          tryB: simplifyStatement(stmt.tryB)! as BlockStatement,
          catchB: simplifyStatement(stmt.catchB) as BlockStatement,
          finallyB: simplifyStatement(stmt.finallyB) as BlockStatement,
        });
      case "ForS":
        return updateStmt(stmt, {
          init: simplifyStatement(stmt.init) as ExpressionStatement | LetStatement,
          cond: simplifyExpression(stmt.cond),
          upd: simplifyExpression(stmt.upd),
          body: simplifyStatement(stmt.body)!,
        });
      case "ForInS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
          body: simplifyStatement(stmt.body)!,
        });
      case "ForOfS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
          body: simplifyStatement(stmt.body)!,
        });
      case "SwitchS":
        return updateStmt(stmt, {
          expr: simplifyExpression(stmt.expr),
          cases: simplifyExpressionList(stmt.cases) as SwitchCase[],
        });
      case "FuncD":
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
  return isUpdated ? deepFreeze(newStmtList) : stmts;
}

function simplifyDestructure(destr: ArrayDestructure | ObjectDestructure): ArrayDestructure | ObjectDestructure {
  const newArrayDestr = destr.aDestr?.map(simplifyDestructure);
  const newObjectDestr = destr.oDestr?.map(simplifyDestructure);
  const isUpdated =
    newArrayDestr?.some((destr, i) => destr !== destr.aDestr![i]) ||
    newObjectDestr?.some((destr, i) => destr !== destr.oDestr![i]);
  return isUpdated
    ? deepFreeze({
        ...destr,
        aDestr: newArrayDestr,
        oDestr: newObjectDestr,
      })
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
    ? deepFreeze({
        ...destr,
        aDestr: newArrayDestr,
        oDestr: newObjectDestr,
        expr: newEpr,
      })
    : destr;
}

function simplifyVarDeclarationList(decls: VarDeclaration[]): VarDeclaration[] {
  const newDeclList = decls.map(simplifyVarDeclaration);
  const isUpdated = newDeclList.some((decl, i) => decl !== decls[i]);
  return isUpdated ? deepFreeze(newDeclList) : decls;
}

function simplifyObjectLiteral(obj: ObjectLiteral): ObjectLiteral {
  const newProps = obj.props.map((prop) => {
    if (Array.isArray(prop)) {
      const prop0 = simplifyExpression(prop[0]);
      const prop1 = simplifyExpression(prop[1]);
      return prop0 !== prop[0] || prop1 !== prop[1] ? deepFreeze([prop0, prop1]) : prop;
    } else {
      return {
        ...prop,
        value: simplifyExpression(prop),
      };
    }
  });
  const isUpdated = newProps.some((prop, i) => prop !== obj.props[i]);
  return isUpdated ? deepFreeze({ ...obj, props: newProps }) : obj;
}

function updateExpr<T extends Expression>(expr: T, props: Partial<T>): T {
  const isUpdated = Object.keys(props).some((key: any) => (expr as any)[key] !== (props as any)[key]);
  return isUpdated ? deepFreeze({ ...expr, ...props }) : expr;
}

function updateStmt<T extends Statement>(stmt: T, props: Partial<T>): T {
  const isUpdated = Object.keys(props).some((key: any) => (stmt as any)[key] !== (props as any)[key]);
  return isUpdated ? deepFreeze({ ...stmt, ...props }) : stmt;
}

function simplifyUnaryExpression(unary: UnaryExpression): Expression {
  if (unary.expr.type === "LitE") {
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
      return deepFreeze({ type: "LitE", value: newValue });
    }
  }
  return unary;
}

function simplifyBinaryExpression(binary: BinaryExpression): Expression {
  if (binary.left.type === "LitE" && binary.right.type === "LitE") {
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
      return deepFreeze({ type: "LitE", value: newValue });
    }
  } else if (binary.op === "+" && binary.left.type === "LitE" && binary.left.value === 0) {
    return binary.right;
  } else if (binary.op === "+" && binary.right.type === "LitE" && binary.right.value === 0) {
    return binary.left;
  } else if (binary.op === "-" && binary.right.type === "LitE" && binary.right.value === 0) {
    return binary.left;
  } else if (binary.op === "*" && binary.left.type === "LitE" && binary.left.value === 1) {
    return binary.right;
  } else if (binary.op === "*" && binary.right.type === "LitE" && binary.right.value === 1) {
    return binary.left;
  } else if (binary.op === "*" && binary.right.type === "LitE" && binary.right.value === 0) {
    return deepFreeze({ type: "LitE", value: 0 });
  } else if (binary.op === "*" && binary.left.type === "LitE" && binary.left.value === 0) {
    return deepFreeze({ type: "LitE", value: 0 });
  } else if (binary.op === "/" && binary.right.type === "LitE" && binary.right.value === 1) {
    return binary.left;
  }
  return binary;
}
