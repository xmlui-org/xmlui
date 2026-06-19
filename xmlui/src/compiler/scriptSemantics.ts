import { createErrorDiagnostic, type ParserDiagnostic, type ScriptNode } from "../parser";
import type { SourceSpan } from "../parser";
import type { XmluiElement } from "./ir";

export type XmluiBindingKind = "local" | "global" | "props" | "special";

export type XmluiBinding = {
  kind: XmluiBindingKind;
  name: string;
  mutable: boolean;
  span?: SourceSpan;
};

export type XmluiScope = {
  sourceId: string;
  parent?: XmluiScope;
  allowImplicitGlobals: boolean;
  locals: Map<string, XmluiBinding>;
  globals: Map<string, XmluiBinding>;
  specials: Map<string, XmluiBinding>;
};

export type CreateXmluiScopeOptions = {
  sourceId?: string;
  parent?: XmluiScope;
  allowImplicitGlobals?: boolean;
};

export type DependencyKind = XmluiBindingKind | "unresolved";

export type BoundDependency = {
  kind: DependencyKind;
  name: string;
  path: string[];
  span: SourceSpan;
  binding?: XmluiBinding;
};

export type BoundWriteTarget = {
  kind: "local" | "global" | "unresolved" | "invalid";
  name: string;
  path: string[];
  operator: "++";
  span: SourceSpan;
  binding?: XmluiBinding;
};

export type BoundScriptResult = {
  node: ScriptNode;
  dependencies: BoundDependency[];
  writes: BoundWriteTarget[];
  diagnostics: ParserDiagnostic[];
};

export type XmluiScriptIr =
  | XmluiLiteralIr
  | XmluiIdentifierReadIr
  | XmluiScopedMemberReadIr
  | XmluiMemberReadIr
  | XmluiIndexReadIr
  | XmluiLogicalExpressionIr
  | XmluiBinaryExpressionIr
  | XmluiUnaryExpressionIr
  | XmluiConditionalExpressionIr
  | XmluiArrayExpressionIr
  | XmluiObjectExpressionIr
  | XmluiCallExpressionIr
  | XmluiArrowFunctionExpressionIr
  | XmluiPostfixUpdateIr
  | XmluiExpressionStatementIr
  | XmluiEventHandlerIr
  | XmluiUnsupportedIr;

export type XmluiScriptIrBase = {
  kind: string;
  span: SourceSpan;
};

export type XmluiLiteralIr = XmluiScriptIrBase & {
  kind: "LiteralExpression";
  value: string | number | boolean | null | undefined;
};

export type XmluiIdentifierReadIr = XmluiScriptIrBase & {
  kind: "IdentifierRead";
  name: string;
  dependency?: BoundDependency;
};

export type XmluiScopedMemberReadIr = XmluiScriptIrBase & {
  kind: "ScopedMemberRead";
  scope: "$props";
  member: string;
  dependency?: BoundDependency;
};

export type XmluiMemberReadIr = XmluiScriptIrBase & {
  kind: "MemberRead";
  object: XmluiScriptIr;
  member: string;
  optional: boolean;
  dependency?: BoundDependency;
};

export type XmluiIndexReadIr = XmluiScriptIrBase & {
  kind: "IndexRead";
  object: XmluiScriptIr;
  index: XmluiScriptIr;
  optional: boolean;
};

export type XmluiLogicalExpressionIr = XmluiScriptIrBase & {
  kind: "LogicalExpression";
  operator: "||" | "&&" | "??";
  left: XmluiScriptIr;
  right: XmluiScriptIr;
};

export type XmluiBinaryExpressionIr = XmluiScriptIrBase & {
  kind: "BinaryExpression";
  operator: "+" | "-" | "*" | "/" | "%" | "<" | "<=" | ">" | ">=" | "==" | "!=" | "===" | "!==";
  left: XmluiScriptIr;
  right: XmluiScriptIr;
};

export type XmluiUnaryExpressionIr = XmluiScriptIrBase & {
  kind: "UnaryExpression";
  operator: "!" | "+" | "-";
  argument: XmluiScriptIr;
};

export type XmluiConditionalExpressionIr = XmluiScriptIrBase & {
  kind: "ConditionalExpression";
  test: XmluiScriptIr;
  consequent: XmluiScriptIr;
  alternate: XmluiScriptIr;
};

export type XmluiArrayExpressionIr = XmluiScriptIrBase & {
  kind: "ArrayExpression";
  elements: XmluiScriptIr[];
};

export type XmluiObjectExpressionIr = XmluiScriptIrBase & {
  kind: "ObjectExpression";
  properties: Array<{
    key: string;
    value: XmluiScriptIr;
    shorthand?: boolean;
  }>;
};

export type XmluiCallExpressionIr = XmluiScriptIrBase & {
  kind: "CallExpression";
  callee: XmluiScriptIr;
  args: XmluiScriptIr[];
  optional: boolean;
};

export type XmluiArrowFunctionExpressionIr = XmluiScriptIrBase & {
  kind: "ArrowFunctionExpression";
  params: string[];
  body: XmluiScriptIr;
};

export type XmluiPostfixUpdateIr = XmluiScriptIrBase & {
  kind: "PostfixUpdate";
  operator: "++";
  target: BoundWriteTarget;
};

export type XmluiExpressionStatementIr = XmluiScriptIrBase & {
  kind: "ExpressionStatement";
  expression: XmluiScriptIr;
};

export type XmluiEventHandlerIr = XmluiScriptIrBase & {
  kind: "EventHandler";
  body: XmluiExpressionStatementIr[];
};

export type XmluiUnsupportedIr = XmluiScriptIrBase & {
  kind: "Unsupported";
  sourceKind: string;
};

export type LoweredScriptResult<TIr extends XmluiScriptIr = XmluiScriptIr> = BoundScriptResult & {
  ir: TIr;
};

export type CompiledExpressionContext = {
  props?: Record<string, unknown>;
  readLocal(name: string): unknown;
  readGlobal(name: string): unknown;
};

export type CompiledEventContext = CompiledExpressionContext & {
  writeLocal(name: string, value: unknown): void;
  writeGlobal(name: string, value: unknown): void;
};

export type CompiledExpression = {
  kind: "expression";
  source: string;
  dependencies: BoundDependency[];
  execute(context: CompiledExpressionContext): unknown;
};

export type CompiledEventHandler = {
  kind: "eventHandler";
  source: string;
  dependencies: BoundDependency[];
  writes: BoundWriteTarget[];
  invalidates: Array<{ kind: "local" | "global"; name: string }>;
  execute(context: CompiledEventContext): void;
};

export function createXmluiScope(
  element: XmluiElement,
  options: CreateXmluiScopeOptions = {},
): XmluiScope {
  const sourceId = options.sourceId ?? options.parent?.sourceId ?? "anonymous.xmlui";
  const scope: XmluiScope = {
    sourceId,
    parent: options.parent,
    allowImplicitGlobals: options.allowImplicitGlobals ?? options.parent?.allowImplicitGlobals ?? false,
    locals: new Map(),
    globals: new Map(options.parent?.globals),
    specials: new Map(options.parent?.specials),
  };

  if (!scope.specials.has("$props")) {
    scope.specials.set("$props", {
      kind: "special",
      name: "$props",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }

  for (const name of Object.keys(element.globals)) {
    scope.globals.set(name, {
      kind: "global",
      name,
      mutable: true,
      span: declarationSpan(sourceId, element, "globals", name),
    });
  }

  for (const name of Object.keys(element.vars)) {
    scope.locals.set(name, {
      kind: "local",
      name,
      mutable: true,
      span: declarationSpan(sourceId, element, "vars", name),
    });
  }

  return scope;
}

export function createChildXmluiScope(parent: XmluiScope, element: XmluiElement): XmluiScope {
  return createXmluiScope(element, {
    sourceId: parent.sourceId,
    parent,
  });
}

export function resolveXmluiIdentifier(scope: XmluiScope, name: string): XmluiBinding | undefined {
  if (scope.locals.has(name)) {
    return scope.locals.get(name);
  }
  if (scope.parent) {
    const parentLocal = resolveParentLocal(scope.parent, name);
    if (parentLocal) {
      return parentLocal;
    }
  }
  if (scope.globals.has(name)) {
    return scope.globals.get(name);
  }
  if (scope.specials.has(name)) {
    return scope.specials.get(name);
  }
  if (scope.allowImplicitGlobals && isImplicitGlobalCandidate(name)) {
    return {
      kind: "global",
      name,
      mutable: true,
    };
  }
  return undefined;
}

export function bindScriptExpression(node: ScriptNode, scope: XmluiScope): BoundScriptResult {
  const result: BoundScriptResult = {
    node,
    dependencies: [],
    writes: [],
    diagnostics: [],
  };
  const lexicalScopes: Array<Set<string>> = [];

  visit(node);
  result.dependencies = dedupeDependencies(result.dependencies);
  result.writes = dedupeWrites(result.writes);
  return result;

  function visit(current: ScriptNode): void {
    switch (current.kind) {
      case "Identifier":
        bindIdentifierRead(current.name, current.span);
        return;
      case "MemberExpression":
        bindMemberRead(current);
        return;
      case "IndexExpression":
        visit(current.object);
        visit(current.index);
        return;
      case "ArrayExpression":
        current.elements.forEach(visit);
        return;
      case "ObjectExpression":
        current.properties.forEach(visit);
        return;
      case "ObjectProperty":
        if (!current.shorthand) {
          visit(current.value);
        } else if (current.value.kind === "Identifier") {
          bindIdentifierRead(current.value.name, current.value.span);
        }
        return;
      case "ConditionalExpression":
        visit(current.test);
        visit(current.consequent);
        visit(current.alternate);
        return;
      case "BinaryExpression":
      case "AssignmentExpression":
        visit(current.left);
        visit(current.right);
        return;
      case "UnaryExpression":
        visit(current.argument);
        return;
      case "PostfixExpression":
        result.writes.push(bindPostfixWrite(current, scope, result));
        visit(current.argument);
        return;
      case "CallExpression":
        visit(current.callee);
        current.args.forEach(visit);
        validateCallExpression(current);
        return;
      case "ArrowFunctionExpression":
        lexicalScopes.push(new Set(current.params.map((param) => param.name)));
        visit(current.body);
        lexicalScopes.pop();
        return;
      case "ExpressionStatement":
        visit(current.expression);
        return;
      case "Program":
        current.body.forEach(visit);
        return;
    }
  }

  function bindMemberRead(current: Extract<ScriptNode, { kind: "MemberExpression" }>): void {
    if (current.object.kind === "Identifier" && current.object.name === "$props") {
      const root = resolveXmluiIdentifier(scope, "$props");
      result.dependencies.push({
        kind: "props",
        name: current.property.name,
        path: [current.property.name],
        span: current.span,
        ...(root ? { binding: root } : {}),
      });
      return;
    }

    const path = dependencyPathFromNode(current);
    if (path) {
      const [rootName] = path;
      if (isLexicalName(rootName)) {
        return;
      }
      const binding = resolveXmluiIdentifier(scope, rootName);
      if (!binding) {
        pushUnresolved(rootName, current.object.span);
        return;
      }
      result.dependencies.push({
        kind: binding.kind,
        name: rootName,
        path,
        span: current.span,
        binding,
      });
      return;
    }

    visit(current.object);
  }

  function bindIdentifierRead(name: string, span: SourceSpan): void {
    if (!name) {
      return;
    }
    if (isLexicalName(name)) {
      return;
    }
    const binding = resolveXmluiIdentifier(scope, name);
    if (!binding) {
      pushUnresolved(name, span);
      return;
    }
    if (binding.kind === "special") {
      return;
    }
    result.dependencies.push({
      kind: binding.kind,
      name,
      path: [name],
      span,
      binding,
    });
  }

  function isLexicalName(name: string): boolean {
    return lexicalScopes.some((names) => names.has(name));
  }

  function pushUnresolved(name: string, span: SourceSpan): void {
    result.dependencies.push({
      kind: "unresolved",
      name,
      path: [name],
      span,
    });
    result.diagnostics.push(
      createErrorDiagnostic("XS201", `Unresolved XMLUI script identifier '${name}'.`, span),
    );
  }

  function validateCallExpression(current: Extract<ScriptNode, { kind: "CallExpression" }>): void {
    if (isAllowedCall(current.callee)) {
      return;
    }
    result.diagnostics.push(
      createErrorDiagnostic("XS204", "Unsupported XMLUI expression call target.", current.callee.span),
    );
  }
}

export function lowerScriptExpression(
  node: ScriptNode,
  scope: XmluiScope,
): LoweredScriptResult {
  const bound = bindScriptExpression(node, scope);
  return {
    ...bound,
    ir: lowerNode(node, bound),
  };
}

export function lowerScriptEventHandler(
  node: ScriptNode,
  scope: XmluiScope,
): LoweredScriptResult<XmluiEventHandlerIr> {
  const bound = bindScriptExpression(node, scope);
  const body =
    node.kind === "Program"
      ? node.body.map((statement) => lowerExpressionStatement(statement, bound))
      : [lowerExpressionStatement(node, bound)];

  return {
    ...bound,
    ir: {
      kind: "EventHandler",
      span: node.span,
      body,
    },
  };
}

export function compileXmluiExpression(ir: XmluiScriptIr, dependencies: BoundDependency[] = []): CompiledExpression {
  return {
    kind: "expression",
    source: `return ${emitExpression(ir)};`,
    dependencies,
    execute: (context) => executeExpressionIr(ir, context),
  };
}

export function compileXmluiEventHandler(
  ir: XmluiEventHandlerIr,
  dependencies: BoundDependency[] = [],
  writes: BoundWriteTarget[] = [],
): CompiledEventHandler {
  return {
    kind: "eventHandler",
    source: ir.body.map((statement) => `${emitEventStatement(statement)};`).join("\n"),
    dependencies,
    writes,
    invalidates: writes
      .filter((write): write is BoundWriteTarget & { kind: "local" | "global" } =>
        write.kind === "local" || write.kind === "global",
      )
      .map((write) => ({ kind: write.kind, name: write.name })),
    execute: (context) => {
      for (const statement of ir.body) {
        executeEventStatement(statement, context);
      }
    },
  };
}

function bindPostfixWrite(
  node: Extract<ScriptNode, { kind: "PostfixExpression" }>,
  scope: XmluiScope,
  result: BoundScriptResult,
): BoundWriteTarget {
  const target = node.argument;

  if (target.kind === "Identifier") {
    return bindIdentifierWrite(target.name, target.span, node.operator, scope, result);
  }

  if (
    target.kind === "MemberExpression" &&
    target.object.kind === "Identifier" &&
    target.object.name === "$props"
  ) {
    const write: BoundWriteTarget = {
      kind: "invalid",
      name: target.property.name,
      path: [target.property.name],
      operator: node.operator as "++",
      span: target.span,
    };
    result.diagnostics.push(
      createErrorDiagnostic(
        "XS202",
        `Cannot write to read-only XMLUI script target '$props.${target.property.name}'.`,
        target.span,
      ),
    );
    return write;
  }

  result.diagnostics.push(
    createErrorDiagnostic("XS203", "Invalid XMLUI script write target.", target.span),
  );
  return {
    kind: "invalid",
    name: "",
    path: [],
    operator: node.operator as "++",
    span: target.span,
  };
}

function lowerNode(node: ScriptNode, bound: BoundScriptResult): XmluiScriptIr {
  switch (node.kind) {
    case "Literal":
      return {
        kind: "LiteralExpression",
        span: node.span,
        value: node.value,
      };
    case "Identifier":
      return identifierReadIr({
        kind: "IdentifierRead",
        span: node.span,
        name: node.name,
      }, findDependency(bound, [node.name], node.span));
    case "MemberExpression":
      if (node.object.kind === "Identifier" && node.object.name === "$props") {
        return scopedMemberReadIr({
          kind: "ScopedMemberRead",
          span: node.span,
          scope: "$props",
          member: node.property.name,
        }, findDependency(bound, [node.property.name], node.span));
      }
      return memberReadIr({
        kind: "MemberRead",
        span: node.span,
        object: lowerNode(node.object, bound),
        member: node.property.name,
        optional: node.optional ?? true,
      }, findDependency(bound, dependencyPathFromNode(node) ?? [], node.span));
    case "IndexExpression":
      return {
        kind: "IndexRead",
        span: node.span,
        object: lowerNode(node.object, bound),
        index: lowerNode(node.index, bound),
        optional: node.optional ?? true,
      };
    case "ArrayExpression":
      return {
        kind: "ArrayExpression",
        span: node.span,
        elements: node.elements.map((element) => lowerNode(element, bound)),
      };
    case "ObjectExpression":
      return {
        kind: "ObjectExpression",
        span: node.span,
        properties: node.properties.map((property) => ({
          key: objectKeyName(property.key),
          value: lowerNode(property.value, bound),
          ...(property.shorthand ? { shorthand: true } : {}),
        })),
      };
    case "ConditionalExpression":
      return {
        kind: "ConditionalExpression",
        span: node.span,
        test: lowerNode(node.test, bound),
        consequent: lowerNode(node.consequent, bound),
        alternate: lowerNode(node.alternate, bound),
      };
    case "BinaryExpression":
      if (node.operator === "||" || node.operator === "&&" || node.operator === "??") {
        return {
          kind: "LogicalExpression",
          span: node.span,
          operator: node.operator,
          left: lowerNode(node.left, bound),
          right: lowerNode(node.right, bound),
        };
      }
      if (isSupportedBinaryOperator(node.operator)) {
        return {
          kind: "BinaryExpression",
          span: node.span,
          operator: node.operator,
          left: lowerNode(node.left, bound),
          right: lowerNode(node.right, bound),
        };
      }
      return unsupported(node);
    case "UnaryExpression":
      if (node.operator === "!" || node.operator === "+" || node.operator === "-") {
        return {
          kind: "UnaryExpression",
          span: node.span,
          operator: node.operator,
          argument: lowerNode(node.argument, bound),
        };
      }
      return unsupported(node);
    case "CallExpression":
      return {
        kind: "CallExpression",
        span: node.span,
        callee: lowerNode(node.callee, bound),
        args: node.args.map((arg) => lowerNode(arg, bound)),
        optional: node.optional ?? false,
      };
    case "ArrowFunctionExpression":
      return {
        kind: "ArrowFunctionExpression",
        span: node.span,
        params: node.params.map((param) => param.name),
        body: lowerNode(node.body, bound),
      };
    case "PostfixExpression":
      return {
        kind: "PostfixUpdate",
        span: node.span,
        operator: "++",
        target: findWrite(bound, node.argument.span) ?? {
          kind: "invalid",
          name: "",
          path: [],
          operator: "++",
          span: node.argument.span,
        },
      };
    case "ExpressionStatement":
      return lowerExpressionStatement(node, bound);
    case "Program":
      return {
        kind: "EventHandler",
        span: node.span,
        body: node.body.map((statement) => lowerExpressionStatement(statement, bound)),
      };
    default:
      return unsupported(node);
  }
}

function lowerExpressionStatement(
  node: ScriptNode,
  bound: BoundScriptResult,
): XmluiExpressionStatementIr {
  if (node.kind === "ExpressionStatement") {
    return {
      kind: "ExpressionStatement",
      span: node.span,
      expression: lowerNode(node.expression, bound),
    };
  }

  return {
    kind: "ExpressionStatement",
    span: node.span,
    expression: lowerNode(node, bound),
  };
}

function unsupported(node: ScriptNode): XmluiUnsupportedIr {
  return {
    kind: "Unsupported",
    span: node.span,
    sourceKind: node.kind,
  };
}

function dependencyPathFromNode(node: ScriptNode): string[] | undefined {
  if (node.kind === "Identifier") {
    return node.name ? [node.name] : undefined;
  }
  if (node.kind === "MemberExpression") {
    const objectPath = dependencyPathFromNode(node.object);
    return objectPath ? [...objectPath, node.property.name] : undefined;
  }
  return undefined;
}

function objectKeyName(node: ScriptNode): string {
  if (node.kind === "Identifier") {
    return node.name;
  }
  if (node.kind === "Literal") {
    return String(node.value);
  }
  return "";
}

function isSupportedBinaryOperator(operator: string): operator is XmluiBinaryExpressionIr["operator"] {
  return [
    "+",
    "-",
    "*",
    "/",
    "%",
    "<",
    "<=",
    ">",
    ">=",
    "==",
    "!=",
    "===",
    "!==",
  ].includes(operator);
}

function isAllowedCall(callee: ScriptNode): boolean {
  if (callee.kind === "MemberExpression") {
    return isAllowedMethodName(callee.property.name);
  }
  return false;
}

function isAllowedMethodName(name: string): boolean {
  return [
    "map",
    "filter",
    "find",
    "some",
    "every",
    "includes",
    "join",
    "toLowerCase",
    "toUpperCase",
    "startsWith",
    "endsWith",
  ].includes(name);
}

function resolveParentLocal(scope: XmluiScope, name: string): XmluiBinding | undefined {
  if (scope.locals.has(name)) {
    return scope.locals.get(name);
  }
  return scope.parent ? resolveParentLocal(scope.parent, name) : undefined;
}

function isImplicitGlobalCandidate(name: string): boolean {
  return name.length > 0 && !name.startsWith("$");
}

function bindIdentifierWrite(
  name: string,
  span: SourceSpan,
  operator: string,
  scope: XmluiScope,
  result: BoundScriptResult,
): BoundWriteTarget {
  const binding = resolveXmluiIdentifier(scope, name);
  if (!binding) {
    result.diagnostics.push(
      createErrorDiagnostic("XS201", `Unresolved XMLUI script identifier '${name}'.`, span),
    );
    return {
      kind: "unresolved",
      name,
      path: [name],
      operator: operator as "++",
      span,
    };
  }

  if ((binding.kind !== "local" && binding.kind !== "global") || !binding.mutable) {
    result.diagnostics.push(
      createErrorDiagnostic(
        "XS202",
        `Cannot write to read-only XMLUI script target '${name}'.`,
        span,
      ),
    );
    return {
      kind: "invalid",
      name,
      path: [name],
      operator: operator as "++",
      span,
      binding,
    };
  }

  return {
    kind: binding.kind,
    name,
    path: [name],
    operator: operator as "++",
    span,
    binding,
  };
}

function declarationSpan(
  sourceId: string,
  element: XmluiElement,
  bucket: "vars" | "globals",
  name: string,
): SourceSpan {
  const parsed = element.parsed?.[bucket]?.[name];
  return spanFromRange(sourceId, parsed && !Array.isArray(parsed) ? parsed.range : element.range);
}

function spanFromRange(sourceId: string, range: { start: number; end: number }): SourceSpan {
  return {
    sourceId,
    start: range.start,
    end: range.end,
  };
}

function dedupeDependencies(dependencies: BoundDependency[]): BoundDependency[] {
  const seen = new Set<string>();
  return dependencies.filter((dependency) => {
    const key = `${dependency.kind}:${dependency.path.join(".")}:${dependency.span.start}:${dependency.span.end}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function dedupeWrites(writes: BoundWriteTarget[]): BoundWriteTarget[] {
  const seen = new Set<string>();
  return writes.filter((write) => {
    const key = `${write.kind}:${write.path.join(".")}:${write.operator}:${write.span.start}:${write.span.end}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function findDependency(
  bound: BoundScriptResult,
  path: string[],
  span: SourceSpan,
): BoundDependency | undefined {
  return bound.dependencies.find(
    (dependency) =>
      (samePath(dependency.path, path) ||
        (path.length === 1 && dependency.path[0] === path[0])) &&
      dependency.span.sourceId === span.sourceId &&
      dependency.span.start <= span.start &&
      dependency.span.end >= span.end,
  );
}

function findWrite(bound: BoundScriptResult, span: SourceSpan): BoundWriteTarget | undefined {
  return bound.writes.find(
    (write) =>
      write.span.sourceId === span.sourceId &&
      write.span.start === span.start &&
      write.span.end === span.end,
  );
}

function samePath(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function identifierReadIr(
  node: Omit<XmluiIdentifierReadIr, "dependency">,
  dependency: BoundDependency | undefined,
): XmluiIdentifierReadIr {
  return {
    ...node,
    ...(dependency ? { dependency } : {}),
  };
}

function scopedMemberReadIr(
  node: Omit<XmluiScopedMemberReadIr, "dependency">,
  dependency: BoundDependency | undefined,
): XmluiScopedMemberReadIr {
  return {
    ...node,
    ...(dependency ? { dependency } : {}),
  };
}

function memberReadIr(
  node: Omit<XmluiMemberReadIr, "dependency">,
  dependency: BoundDependency | undefined,
): XmluiMemberReadIr {
  return {
    ...node,
    ...(dependency ? { dependency } : {}),
  };
}

function emitExpression(ir: XmluiScriptIr): string {
  switch (ir.kind) {
    case "LiteralExpression":
      return JSON.stringify(ir.value);
    case "IdentifierRead":
      return emitRead(ir.dependency, ir.name);
    case "ScopedMemberRead":
      return `ctx.props?.[${JSON.stringify(ir.member)}]`;
    case "MemberRead":
      return emitOptionalMemberRead(ir.object, ir.member);
    case "IndexRead":
      return emitOptionalIndexRead(ir.object, ir.index);
    case "LogicalExpression":
      return `(${emitExpression(ir.left)} ${ir.operator} ${emitExpression(ir.right)})`;
    case "BinaryExpression":
      return `(${emitExpression(ir.left)} ${ir.operator} ${emitExpression(ir.right)})`;
    case "UnaryExpression":
      return `(${ir.operator}${emitExpression(ir.argument)})`;
    case "ConditionalExpression":
      return `(${emitExpression(ir.test)} ? ${emitExpression(ir.consequent)} : ${emitExpression(ir.alternate)})`;
    case "ArrayExpression":
      return `[${ir.elements.map(emitExpression).join(", ")}]`;
    case "ObjectExpression":
      return `{${ir.properties.map((property) => `${JSON.stringify(property.key)}: ${emitExpression(property.value)}`).join(", ")}}`;
    case "CallExpression":
      return emitCallExpression(ir);
    case "ArrowFunctionExpression":
      return `(${ir.params.join(", ")}) => ${emitExpression(ir.body)}`;
    default:
      throw new Error(`Cannot compile ${ir.kind} as an XMLUI expression.`);
  }
}

function emitOptionalMemberRead(object: XmluiScriptIr, member: string): string {
  const objectSource = emitExpression(object);
  return `(${objectSource} == null ? undefined : ${objectSource}[${JSON.stringify(member)}])`;
}

function emitOptionalIndexRead(object: XmluiScriptIr, index: XmluiScriptIr): string {
  const objectSource = emitExpression(object);
  return `(${objectSource} == null ? undefined : ${objectSource}[${emitExpression(index)}])`;
}

function emitCallExpression(ir: XmluiCallExpressionIr): string {
  if (ir.callee.kind !== "MemberRead" && ir.callee.kind !== "ScopedMemberRead") {
    throw new Error("Cannot compile unsupported XMLUI expression call target.");
  }
  const args = ir.args.map(emitExpression).join(", ");
  if (ir.callee.kind === "ScopedMemberRead") {
    throw new Error("Cannot compile unsupported XMLUI expression call target.");
  }
  if (!isAllowedMethodName(ir.callee.member)) {
    throw new Error(`Cannot compile unsupported XMLUI method call '${ir.callee.member}'.`);
  }
  const objectSource = emitExpression(ir.callee.object);
  return `(${objectSource})?.[${JSON.stringify(ir.callee.member)}]?.(${args})`;
}

function emitEventStatement(statement: XmluiExpressionStatementIr): string {
  const expression = statement.expression;
  if (expression.kind !== "PostfixUpdate") {
    return emitExpression(expression);
  }
  const target = expression.target;
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot compile invalid XMLUI event write target '${target.name}'.`);
  }
  const read = target.kind === "local" ? "readLocal" : "readGlobal";
  const write = target.kind === "local" ? "writeLocal" : "writeGlobal";
  return `ctx.${write}(${JSON.stringify(target.name)}, Number(ctx.${read}(${JSON.stringify(target.name)})) + 1)`;
}

function emitRead(dependency: BoundDependency | undefined, name: string): string {
  switch (dependency?.kind) {
    case "local":
      return `ctx.readLocal(${JSON.stringify(name)})`;
    case "global":
      return `ctx.readGlobal(${JSON.stringify(name)})`;
    case undefined:
      return name;
    default:
      throw new Error(`Cannot compile unresolved XMLUI identifier '${name}'.`);
  }
}

function executeExpressionIr(
  ir: XmluiScriptIr,
  context: CompiledExpressionContext,
  lexical: Record<string, unknown> = {},
): unknown {
  switch (ir.kind) {
    case "LiteralExpression":
      return ir.value;
    case "IdentifierRead":
      return executeRead(ir.dependency, ir.name, context, lexical);
    case "ScopedMemberRead":
      return context.props?.[ir.member];
    case "MemberRead": {
      const object = executeExpressionIr(ir.object, context, lexical) as Record<string, unknown> | null | undefined;
      return object == null ? undefined : object[ir.member];
    }
    case "IndexRead": {
      const object = executeExpressionIr(ir.object, context, lexical) as Record<PropertyKey, unknown> | null | undefined;
      const index = executeExpressionIr(ir.index, context, lexical) as PropertyKey;
      return object == null ? undefined : object[index];
    }
    case "LogicalExpression":
      if (ir.operator === "||") {
        return executeExpressionIr(ir.left, context, lexical) || executeExpressionIr(ir.right, context, lexical);
      }
      if (ir.operator === "&&") {
        return executeExpressionIr(ir.left, context, lexical) && executeExpressionIr(ir.right, context, lexical);
      }
      return executeExpressionIr(ir.left, context, lexical) ?? executeExpressionIr(ir.right, context, lexical);
    case "BinaryExpression":
      return executeBinaryExpression(ir, context, lexical);
    case "UnaryExpression": {
      const argument = executeExpressionIr(ir.argument, context, lexical);
      if (ir.operator === "!") {
        return !argument;
      }
      if (ir.operator === "+") {
        return +Number(argument);
      }
      return -Number(argument);
    }
    case "ConditionalExpression":
      return executeExpressionIr(ir.test, context, lexical)
        ? executeExpressionIr(ir.consequent, context, lexical)
        : executeExpressionIr(ir.alternate, context, lexical);
    case "ArrayExpression":
      return ir.elements.map((element) => executeExpressionIr(element, context, lexical));
    case "ObjectExpression":
      return Object.fromEntries(
        ir.properties.map((property) => [
          property.key,
          executeExpressionIr(property.value, context, lexical),
        ]),
      );
    case "ArrowFunctionExpression":
      return (...args: unknown[]) => {
        const nextLexical = { ...lexical };
        ir.params.forEach((param, index) => {
          nextLexical[param] = args[index];
        });
        return executeExpressionIr(ir.body, context, nextLexical);
      };
    case "CallExpression":
      return executeCallExpression(ir, context, lexical);
    default:
      throw new Error(`Cannot execute ${ir.kind} as an XMLUI expression.`);
  }
}

function executeBinaryExpression(
  ir: XmluiBinaryExpressionIr,
  context: CompiledExpressionContext,
  lexical: Record<string, unknown>,
): unknown {
  const left = executeExpressionIr(ir.left, context, lexical) as never;
  const right = executeExpressionIr(ir.right, context, lexical) as never;
  switch (ir.operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
    case "%":
      return left % right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "==":
      return left == right;
    case "!=":
      return left != right;
    case "===":
      return left === right;
    case "!==":
      return left !== right;
  }
}

function executeCallExpression(
  ir: XmluiCallExpressionIr,
  context: CompiledExpressionContext,
  lexical: Record<string, unknown>,
): unknown {
  if (ir.callee.kind !== "MemberRead" || !isAllowedMethodName(ir.callee.member)) {
    throw new Error("Cannot execute unsupported XMLUI expression call target.");
  }
  const object = executeExpressionIr(ir.callee.object, context, lexical) as
    | Record<string, unknown>
    | null
    | undefined;
  const method = object?.[ir.callee.member];
  if (typeof method !== "function") {
    return undefined;
  }
  return method.apply(object, ir.args.map((arg) => executeExpressionIr(arg, context, lexical)));
}

function executeEventStatement(
  statement: XmluiExpressionStatementIr,
  context: CompiledEventContext,
): void {
  const expression = statement.expression;
  if (expression.kind !== "PostfixUpdate") {
    executeExpressionIr(expression, context);
    return;
  }
  const target = expression.target;
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot execute invalid XMLUI event write target '${target.name}'.`);
  }
  const current =
    target.kind === "local" ? context.readLocal(target.name) : context.readGlobal(target.name);
  const next = Number(current) + 1;
  if (target.kind === "local") {
    context.writeLocal(target.name, next);
  } else {
    context.writeGlobal(target.name, next);
  }
}

function executeRead(
  dependency: BoundDependency | undefined,
  name: string,
  context: CompiledExpressionContext,
  lexical: Record<string, unknown>,
): unknown {
  switch (dependency?.kind) {
    case "local":
      return context.readLocal(name);
    case "global":
      return context.readGlobal(name);
    case undefined:
      return lexical[name];
    default:
      throw new Error(`Cannot execute unresolved XMLUI identifier '${name}'.`);
  }
}
