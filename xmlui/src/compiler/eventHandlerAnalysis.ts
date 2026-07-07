import type {
  XmluiAssignmentExpressionIr,
  XmluiEventHandlerIr,
  XmluiHandlerStatementIr,
  XmluiScriptIr,
} from "./scriptSemantics";

export function expressionContainsCall(expression: XmluiScriptIr): boolean {
  switch (expression.kind) {
    case "CallExpression":
      return true;
    case "MemberRead":
      return expressionContainsCall(expression.object);
    case "IndexRead":
      return expressionContainsCall(expression.object) || expressionContainsCall(expression.index);
    case "LogicalExpression":
    case "BinaryExpression":
      return expressionContainsCall(expression.left) || expressionContainsCall(expression.right);
    case "UnaryExpression":
      return expressionContainsCall(expression.argument);
    case "ConditionalExpression":
      return expressionContainsCall(expression.test) ||
        expressionContainsCall(expression.consequent) ||
        expressionContainsCall(expression.alternate);
    case "ArrayExpression":
      return expression.elements.some((element) =>
        expressionContainsCall(element.kind === "ArraySpreadElement" ? element.argument : element)
      );
    case "ObjectExpression":
      return expression.properties.some((property) =>
        expressionContainsCall(property.kind === "spread" ? property.argument : property.value)
      );
    case "ArrowFunctionExpression":
      return expressionContainsCall(expression.body);
    case "AssignmentExpression":
      return expressionContainsCall(expression.right);
    case "PrefixUpdate":
    case "PostfixUpdate":
    case "LiteralExpression":
    case "IdentifierRead":
    case "ScopedMemberRead":
    case "ExpressionStatement":
    case "VariableDeclaration":
    case "BlockStatement":
    case "IfStatement":
    case "WhileStatement":
    case "EventHandler":
    case "Unsupported":
      return false;
  }
}

export function isCheapExpression(expression: XmluiScriptIr): boolean {
  return !expressionContainsCall(expression);
}

export function statementNeedsCheckpoint(statement: XmluiHandlerStatementIr): boolean {
  switch (statement.kind) {
    case "ExpressionStatement":
      return expressionStatementNeedsCheckpoint(statement.expression);
    case "VariableDeclaration":
      return statement.declarations.some((declaration) =>
        declaration.init ? !isCheapExpression(declaration.init) : false,
      );
    case "BlockStatement":
      return false;
    case "IfStatement":
    case "WhileStatement":
      return true;
  }
}

export function loopNeedsPacing(statement: XmluiHandlerStatementIr): boolean {
  return statement.kind === "WhileStatement";
}

export function handlerUsesDedicatedYield(handler: XmluiEventHandlerIr): boolean {
  return handler.options.directives.includes("dedicatedYield");
}

export function handlerUsesSharedYield(handler: XmluiEventHandlerIr): boolean {
  return handler.options.executionMode !== "sync" && !handlerUsesDedicatedYield(handler);
}

function expressionStatementNeedsCheckpoint(expression: XmluiScriptIr): boolean {
  if (expression.kind === "AssignmentExpression") {
    return assignmentNeedsCheckpoint(expression);
  }
  if (expression.kind === "PrefixUpdate" || expression.kind === "PostfixUpdate") {
    return expression.target.kind === "local" || expression.target.kind === "global";
  }
  return !isCheapExpression(expression);
}

function assignmentNeedsCheckpoint(expression: XmluiAssignmentExpressionIr): boolean {
  if (expression.target.kind === "local" || expression.target.kind === "global") {
    return true;
  }
  return !isCheapExpression(expression.right);
}
