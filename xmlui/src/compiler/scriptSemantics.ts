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
  | XmluiLogicalExpressionIr
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

export type XmluiLogicalExpressionIr = XmluiScriptIrBase & {
  kind: "LogicalExpression";
  operator: "||";
  left: XmluiScriptIr;
  right: XmluiScriptIr;
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

    if (current.object.kind === "Identifier") {
      const binding = resolveXmluiIdentifier(scope, current.object.name);
      if (!binding) {
        pushUnresolved(current.object.name, current.object.span);
        return;
      }
      result.dependencies.push({
        kind: binding.kind,
        name: current.object.name,
        path: [current.object.name, current.property.name],
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
      return unsupported(node);
    case "BinaryExpression":
      if (node.operator === "||") {
        return {
          kind: "LogicalExpression",
          span: node.span,
          operator: "||",
          left: lowerNode(node.left, bound),
          right: lowerNode(node.right, bound),
        };
      }
      return unsupported(node);
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
      samePath(dependency.path, path) &&
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

function emitExpression(ir: XmluiScriptIr): string {
  switch (ir.kind) {
    case "LiteralExpression":
      return JSON.stringify(ir.value);
    case "IdentifierRead":
      return emitRead(ir.dependency, ir.name);
    case "ScopedMemberRead":
      return `ctx.props?.[${JSON.stringify(ir.member)}]`;
    case "LogicalExpression":
      return `(${emitExpression(ir.left)} || ${emitExpression(ir.right)})`;
    default:
      throw new Error(`Cannot compile ${ir.kind} as an XMLUI expression.`);
  }
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
    default:
      throw new Error(`Cannot compile unresolved XMLUI identifier '${name}'.`);
  }
}

function executeExpressionIr(ir: XmluiScriptIr, context: CompiledExpressionContext): unknown {
  switch (ir.kind) {
    case "LiteralExpression":
      return ir.value;
    case "IdentifierRead":
      return executeRead(ir.dependency, ir.name, context);
    case "ScopedMemberRead":
      return context.props?.[ir.member];
    case "LogicalExpression":
      return executeExpressionIr(ir.left, context) || executeExpressionIr(ir.right, context);
    default:
      throw new Error(`Cannot execute ${ir.kind} as an XMLUI expression.`);
  }
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
): unknown {
  switch (dependency?.kind) {
    case "local":
      return context.readLocal(name);
    case "global":
      return context.readGlobal(name);
    default:
      throw new Error(`Cannot execute unresolved XMLUI identifier '${name}'.`);
  }
}
