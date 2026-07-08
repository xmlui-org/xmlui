import { createErrorDiagnostic, type ParserDiagnostic, type ScriptNode } from "../parser";
import type { SourceSpan } from "../parser";
import { isAppContextObjectProperty } from "../abstractions/AppContextDefs";
import { loopNeedsPacing, statementNeedsCheckpoint } from "./eventHandlerAnalysis";
import type { XmluiElement } from "./ir";

export type XmluiBindingKind = "local" | "global" | "props" | "special" | "context" | "reference";

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
  references: Map<string, XmluiBinding>;
};

export type CreateXmluiScopeOptions = {
  sourceId?: string;
  parent?: XmluiScope;
  allowImplicitGlobals?: boolean;
  specialNames?: Iterable<string>;
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
  kind: "local" | "global" | "handlerLocal" | "member" | "index" | "unresolved" | "invalid";
  name: string;
  path: string[];
  operator: "++" | "--" | "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "mutate";
  span: SourceSpan;
  binding?: XmluiBinding;
  object?: XmluiScriptIr;
  index?: XmluiScriptIr;
};

export type BoundScriptResult = {
  node: ScriptNode;
  dependencies: BoundDependency[];
  writes: BoundWriteTarget[];
  diagnostics: ParserDiagnostic[];
};

export type XmluiScriptIr =
  | XmluiLiteralIr
  | XmluiTemplateLiteralIr
  | XmluiIdentifierReadIr
  | XmluiScopedMemberReadIr
  | XmluiMemberReadIr
  | XmluiIndexReadIr
  | XmluiLogicalExpressionIr
  | XmluiBinaryExpressionIr
  | XmluiUnaryExpressionIr
  | XmluiConditionalExpressionIr
  | XmluiSequenceExpressionIr
  | XmluiArrayExpressionIr
  | XmluiObjectExpressionIr
  | XmluiCallExpressionIr
  | XmluiArrowFunctionExpressionIr
  | XmluiAssignmentExpressionIr
  | XmluiPrefixUpdateIr
  | XmluiPostfixUpdateIr
  | XmluiExpressionStatementIr
  | XmluiVariableDeclarationIr
  | XmluiBlockStatementIr
  | XmluiIfStatementIr
  | XmluiWhileStatementIr
  | XmluiReturnStatementIr
  | XmluiThrowStatementIr
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

export type XmluiTemplateLiteralIr = XmluiScriptIrBase & {
  kind: "TemplateLiteralExpression";
  parts: Array<string | XmluiScriptIr>;
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
  operator: "!" | "+" | "-" | "delete" | "typeof";
  argument: XmluiScriptIr;
};

export type XmluiConditionalExpressionIr = XmluiScriptIrBase & {
  kind: "ConditionalExpression";
  test: XmluiScriptIr;
  consequent: XmluiScriptIr;
  alternate: XmluiScriptIr;
};

export type XmluiSequenceExpressionIr = XmluiScriptIrBase & {
  kind: "SequenceExpression";
  expressions: XmluiScriptIr[];
};

export type XmluiArrayExpressionIr = XmluiScriptIrBase & {
  kind: "ArrayExpression";
  elements: Array<XmluiScriptIr | XmluiArraySpreadElementIr>;
};

export type XmluiArraySpreadElementIr = XmluiScriptIrBase & {
  kind: "ArraySpreadElement";
  argument: XmluiScriptIr;
};

export type XmluiObjectExpressionIr = XmluiScriptIrBase & {
  kind: "ObjectExpression";
  properties: Array<
    | {
        kind: "property";
        key: string;
        value: XmluiScriptIr;
        shorthand?: boolean;
      }
    | {
        kind: "spread";
        argument: XmluiScriptIr;
      }
  >;
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

export type XmluiAssignmentExpressionIr = XmluiScriptIrBase & {
  kind: "AssignmentExpression";
  operator: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
  target: BoundWriteTarget;
  right: XmluiScriptIr;
};

export type XmluiPrefixUpdateIr = XmluiScriptIrBase & {
  kind: "PrefixUpdate";
  operator: "++" | "--";
  target: BoundWriteTarget;
};

export type XmluiPostfixUpdateIr = XmluiScriptIrBase & {
  kind: "PostfixUpdate";
  operator: "++" | "--";
  target: BoundWriteTarget;
};

export type XmluiExpressionStatementIr = XmluiScriptIrBase & {
  kind: "ExpressionStatement";
  expression: XmluiScriptIr;
};

export type XmluiVariableDeclarationIr = XmluiScriptIrBase & {
  kind: "VariableDeclaration";
  declarationKind: "let" | "const";
  declarations: Array<{
    name: string;
    init?: XmluiScriptIr;
    span: SourceSpan;
  }>;
};

export type XmluiBlockStatementIr = XmluiScriptIrBase & {
  kind: "BlockStatement";
  body: XmluiHandlerStatementIr[];
};

export type XmluiIfStatementIr = XmluiScriptIrBase & {
  kind: "IfStatement";
  test: XmluiScriptIr;
  consequent: XmluiHandlerStatementIr;
  alternate?: XmluiHandlerStatementIr;
};

export type XmluiWhileStatementIr = XmluiScriptIrBase & {
  kind: "WhileStatement";
  test: XmluiScriptIr;
  body: XmluiHandlerStatementIr;
};

export type XmluiReturnStatementIr = XmluiScriptIrBase & {
  kind: "ReturnStatement";
  argument?: XmluiScriptIr;
};

export type XmluiThrowStatementIr = XmluiScriptIrBase & {
  kind: "ThrowStatement";
  argument: XmluiScriptIr;
};

export type XmluiHandlerStatementIr =
  | XmluiExpressionStatementIr
  | XmluiVariableDeclarationIr
  | XmluiBlockStatementIr
  | XmluiIfStatementIr
  | XmluiWhileStatementIr
  | XmluiReturnStatementIr
  | XmluiThrowStatementIr;

export type XmluiHandlerExecutionMode = "sync" | "async";

export type XmluiHandlerSchedulingPolicy = "parallel" | "drop-while-running" | "queue";

export type XmluiHandlerDirective = "sync" | "async" | "block" | "queue" | "dedicatedYield";

export type XmluiHandlerOptions = {
  directives: XmluiHandlerDirective[];
  executionMode: XmluiHandlerExecutionMode;
  schedulingPolicy: XmluiHandlerSchedulingPolicy;
};

export type XmluiEventHandlerIr = XmluiScriptIrBase & {
  kind: "EventHandler";
  body: XmluiHandlerStatementIr[];
  options: XmluiHandlerOptions;
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
  readContext?(name: string): unknown;
  readReference?(name: string): unknown;
  debug?: XmluiDebugBridge;
};

export type CompiledEventContext = CompiledExpressionContext & {
  writeLocal(name: string, value: unknown): void;
  writeGlobal(name: string, value: unknown): void;
  delay?(ms: number): Promise<void>;
  emitEvent?(name: string, args: unknown[]): unknown | Promise<unknown>;
  call?(target: unknown, methodName: string, args: unknown[]): unknown | Promise<unknown>;
  complete?(value: unknown): Promise<unknown>;
  navigate?(target: unknown, queryParams?: Record<string, unknown>): void;
  callFunction?(name: string, args: unknown[]): unknown | Promise<unknown>;
  yieldIfNeeded?(iteration: number): Promise<void> | void;
};

export type XmluiDebugEvent = {
  kind: "watch" | "log" | "trace" | "break";
  label?: unknown;
  value?: unknown;
  args?: unknown[];
  metadata: {
    timestamp: number;
  };
};

export type XmluiDebugBridge = {
  version: 1;
  current?: unknown;
  subscribe(listener: (event: XmluiDebugEvent) => void): () => void;
  emit(event: XmluiDebugEvent): void;
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
  options: XmluiHandlerOptions;
  dependencies: BoundDependency[];
  writes: BoundWriteTarget[];
  invalidates: Array<{ kind: "local" | "global"; name: string }>;
  execute(context: CompiledEventContext): Promise<unknown>;
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
    references: new Map(options.parent?.references),
  };

  if (!scope.specials.has("$props")) {
    scope.specials.set("$props", {
      kind: "special",
      name: "$props",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }
  if (!scope.specials.has("delay")) {
    scope.specials.set("delay", {
      kind: "special",
      name: "delay",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }
  if (!scope.specials.has("emitEvent")) {
    scope.specials.set("emitEvent", {
      kind: "special",
      name: "emitEvent",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }
  if (!scope.specials.has("navigate")) {
    scope.specials.set("navigate", {
      kind: "special",
      name: "navigate",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }
  if (!scope.specials.has("NaN")) {
    scope.specials.set("NaN", {
      kind: "special",
      name: "NaN",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }
  if (!scope.specials.has("Infinity")) {
    scope.specials.set("Infinity", {
      kind: "special",
      name: "Infinity",
      mutable: false,
      span: spanFromRange(sourceId, element.range),
    });
  }
  for (const name of options.specialNames ?? []) {
    if (!scope.specials.has(name)) {
      scope.specials.set(name, {
        kind: "special",
        name,
        mutable: false,
        span: spanFromRange(sourceId, element.range),
      });
    }
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

  collectStaticReferenceBindings(element, sourceId, scope.references);

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
  if (scope.references.has(name)) {
    return scope.references.get(name);
  }
  if (isBuiltInReferenceName(name)) {
    return {
      kind: "reference",
      name,
      mutable: false,
    };
  }
  if (name === "$self") {
    return {
      kind: "reference",
      name,
      mutable: false,
    };
  }
  if (name.startsWith("$")) {
    return {
      kind: "context",
      name,
      mutable: false,
    };
  }
  if (isAppContextObjectProperty(name)) {
    return {
      kind: "context",
      name,
      mutable: false,
    };
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
  const lexicalScopes: Array<Map<string, { mutable: boolean; span: SourceSpan }>> = [new Map()];

  visit(node);
  result.dependencies = dedupeDependencies(result.dependencies);
  result.writes = dedupeWrites(result.writes);
  return result;

  function visit(current: ScriptNode): void {
    switch (current.kind) {
      case "BlockStatement":
        lexicalScopes.push(new Map());
        current.body.forEach(visit);
        lexicalScopes.pop();
        return;
      case "IfStatement":
        visit(current.test);
        visit(current.consequent);
        if (current.alternate) {
          visit(current.alternate);
        }
        return;
      case "WhileStatement":
        visit(current.test);
        visit(current.body);
        return;
      case "ReturnStatement":
        if (current.argument) {
          visit(current.argument);
        }
        return;
      case "ThrowStatement":
        visit(current.argument);
        return;
      case "VariableDeclaration":
        for (const declaration of current.declarations) {
          if (declaration.init) {
            visit(declaration.init);
          }
          declareLexical(
            declaration.id.name,
            current.declarationKind === "let",
            declaration.id.span,
          );
        }
        return;
      case "VariableDeclarator":
        if (current.init) {
          visit(current.init);
        }
        return;
      case "Identifier":
        bindIdentifierRead(current.name, current.span);
        return;
      case "TemplateLiteral":
        current.parts.forEach((part) => {
          if (typeof part !== "string") {
            visit(part);
          }
        });
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
      case "ArraySpreadElement":
        visit(current.argument);
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
      case "ObjectSpreadProperty":
        visit(current.argument);
        return;
      case "ConditionalExpression":
        visit(current.test);
        visit(current.consequent);
        visit(current.alternate);
        return;
      case "SequenceExpression":
        current.expressions.forEach(visit);
        return;
      case "AssignmentExpression":
        result.writes.push(bindWriteTarget(current.left, current.operator, scope, result, findLexicalBinding));
        if (current.operator !== "=") {
          visit(current.left);
        }
        visit(current.right);
        return;
      case "BinaryExpression":
        visit(current.left);
        visit(current.right);
        return;
      case "UnaryExpression":
        visit(current.argument);
        return;
      case "PrefixExpression":
        result.writes.push(bindWriteTarget(current.argument, current.operator, scope, result, findLexicalBinding));
        visit(current.argument);
        return;
      case "PostfixExpression":
        result.writes.push(bindWriteTarget(current.argument, current.operator, scope, result, findLexicalBinding));
        visit(current.argument);
        return;
      case "CallExpression":
        bindMutatingMethodCall(current);
        if (!isDebugHelperCallee(current.callee)) {
          visit(current.callee);
        }
        current.args.forEach(visit);
        validateCallExpression(current);
        return;
      case "ArrowFunctionExpression":
        lexicalScopes.push(new Map(current.params.map((param) => [param.name, {
          mutable: false,
          span: param.span,
        }])));
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
      if (findLexicalBinding(rootName)) {
        return;
      }
      const binding = resolveXmluiIdentifier(scope, rootName);
      if (!binding) {
        result.dependencies.push({
          kind: "reference",
          name: rootName,
          path,
          span: current.span,
          binding: {
            kind: "reference",
            name: rootName,
            mutable: false,
            span: current.object.span,
          },
        });
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
    if (findLexicalBinding(name)) {
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

  function findLexicalBinding(name: string): { mutable: boolean; span: SourceSpan } | undefined {
    for (let index = lexicalScopes.length - 1; index >= 0; index--) {
      const binding = lexicalScopes[index].get(name);
      if (binding) {
        return binding;
      }
    }
    return undefined;
  }

  function declareLexical(name: string, mutable: boolean, span: SourceSpan): void {
    if (!name) {
      return;
    }
    lexicalScopes.at(-1)?.set(name, { mutable, span });
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
    if (isAllowedCall(current.callee, scope)) {
      return;
    }
    result.diagnostics.push(
      createErrorDiagnostic("XS204", "Unsupported XMLUI expression call target.", current.callee.span),
    );
  }

  function bindMutatingMethodCall(current: Extract<ScriptNode, { kind: "CallExpression" }>): void {
    if (
      current.callee.kind !== "MemberExpression" ||
      current.callee.property.kind !== "Identifier" ||
      !isAllowedMutatingMethodName(current.callee.property.name)
    ) {
      return;
    }
    const target = mutatingMethodRootWrite(current.callee.object, current.callee.property.name, current.span);
    if (target) {
      result.writes.push(target);
    }
  }

  function mutatingMethodRootWrite(
    object: ScriptNode,
    methodName: string,
    span: SourceSpan,
  ): BoundWriteTarget | undefined {
    const path = dependencyPathFromNode(object);
    if (!path?.length) {
      return undefined;
    }
    const [rootName] = path;
    if (findLexicalBinding(rootName)) {
      return undefined;
    }
    const binding = resolveXmluiIdentifier(scope, rootName);
    if (!binding) {
      return undefined;
    }
    if ((binding.kind !== "local" && binding.kind !== "global") || !binding.mutable) {
      result.diagnostics.push(
        createErrorDiagnostic(
          "XS202",
          `Cannot mutate read-only XMLUI script target '${rootName}.${methodName}'.`,
          span,
        ),
      );
      return {
        kind: "invalid",
        name: rootName,
        path,
        operator: "mutate",
        span,
        binding,
      };
    }
    return {
      kind: binding.kind,
      name: rootName,
      path,
      operator: "mutate",
      span,
      binding,
    };
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
  const bodyNodes =
    node.kind === "Program"
      ? node.body
      : [node];
  const prologue = extractHandlerDirectivePrologue(bodyNodes, bound);
  const body = prologue.body.map((statement) => lowerHandlerStatement(statement, bound));
  diagnoseSyncHandlerSafety(prologue.options, body, bound);

  return {
    ...bound,
    ir: {
      kind: "EventHandler",
      span: node.span,
      options: prologue.options,
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
  const context = createEventCodegenContext(
    ir.options.executionMode === "sync",
    collectHandlerLocalNames(ir.body),
  );
  const source = [
    ...context.prologue,
    ...ir.body.map((statement) => emitEventStatement(statement, context)),
  ].join("\n");
  return {
    kind: "eventHandler",
    source,
    options: ir.options,
    dependencies,
    writes,
    invalidates: dedupeInvalidates(writes
      .filter((write): write is BoundWriteTarget & { kind: "local" | "global" } =>
        write.kind === "local" || write.kind === "global",
      )
      .map((write) => ({ kind: write.kind, name: write.name }))),
    execute: async (context) => {
      const lexical: Record<string, unknown> = {};
      const yieldState = ir.options.executionMode === "sync" ? undefined : createEventYieldState();
      let result: unknown;
      for (const statement of ir.body) {
        result = await executeEventStatement(statement, context, lexical, yieldState);
        if (isReturnSignal(result)) {
          return result.value;
        }
      }
      return result;
    },
  };
}

type EventCodegenContext = {
  prologue: string[];
  checkpointCall: string;
  allocateLoopCheckpointName(): string;
};

function createArrowBlockCodegenContext(): EventCodegenContext {
  return {
    prologue: [],
    checkpointCall: "",
    allocateLoopCheckpointName: () => "__xmluiLoopCheckpoint",
  };
}

function createEventCodegenContext(sync: boolean, userNames: Set<string>): EventCodegenContext {
  const usedNames = new Set(userNames);
  let nextLoopCheckpointId = 0;
  const allocateLoopCheckpointName = () => {
    while (true) {
      const name = `__xmluiLoopCheckpoint${nextLoopCheckpointId++}`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
  };
  return sync
    ? { prologue: [], checkpointCall: "", allocateLoopCheckpointName }
    : { prologue: eventYieldPrologue(), checkpointCall: "await __xmluiYieldIfNeeded();", allocateLoopCheckpointName };
}

function eventYieldPrologue(): string[] {
  return [
    `const __xmluiNow = () => typeof performance !== "undefined" ? performance.now() : Date.now();`,
    `let __xmluiLastYield = __xmluiNow();`,
    `const __xmluiYieldIfNeeded = async () => {`,
    `const __xmluiElapsed = __xmluiNow() - __xmluiLastYield;`,
    `if (__xmluiElapsed < 100) return;`,
    `await ((ctx.yieldIfNeeded ?? (() => new Promise((resolve) => setTimeout(resolve, 0))))(0));`,
    `__xmluiLastYield = __xmluiNow();`,
    `};`,
  ];
}

function defaultHandlerOptions(): XmluiHandlerOptions {
  return {
    directives: [],
    executionMode: "async",
    schedulingPolicy: "parallel",
  };
}

function extractHandlerDirectivePrologue(
  body: ScriptNode[],
  bound: BoundScriptResult,
): { body: ScriptNode[]; options: XmluiHandlerOptions } {
  const directives: XmluiHandlerDirective[] = [];
  let index = 0;

  while (index < body.length) {
    const statement = body[index];
    const expression =
      statement.kind === "ExpressionStatement" ? statement.expression : statement;
    if (expression.kind !== "Literal" || typeof expression.value !== "string") {
      break;
    }

    for (const directive of splitHandlerDirective(expression.value)) {
      if (isHandlerDirective(directive)) {
        directives.push(directive);
      } else {
        bound.diagnostics.push(
          createErrorDiagnostic(
            "XS205",
            `Unknown XMLUI event handler directive '${directive}'.`,
            expression.span,
          ),
        );
      }
    }
    index++;
  }

  const options = handlerOptionsFromDirectives(directives, bound, body[0]?.span);
  return {
    body: body.slice(index),
    options,
  };
}

function splitHandlerDirective(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((directive) => directive.trim())
    .filter(Boolean);
}

function isHandlerDirective(value: string): value is XmluiHandlerDirective {
  return value === "sync" ||
    value === "async" ||
    value === "block" ||
    value === "queue" ||
    value === "dedicatedYield";
}

function handlerOptionsFromDirectives(
  directives: XmluiHandlerDirective[],
  bound: BoundScriptResult,
  span: SourceSpan | undefined,
): XmluiHandlerOptions {
  const unique = Array.from(new Set(directives));
  const options = defaultHandlerOptions();
  options.directives = unique;

  if (unique.includes("sync")) {
    options.executionMode = "sync";
  }
  if (unique.includes("async")) {
    options.executionMode = "async";
  }
  if (unique.includes("sync") && unique.includes("async")) {
    bound.diagnostics.push(
      createErrorDiagnostic(
        "XS206",
        "Conflicting XMLUI event handler directives 'sync' and 'async'.",
        span ?? fallbackSpan(bound.node),
      ),
    );
  }

  if (unique.includes("sync") && unique.includes("dedicatedYield")) {
    bound.diagnostics.push(
      createErrorDiagnostic(
        "XS206",
        "Conflicting XMLUI event handler directives 'sync' and 'dedicatedYield'.",
        span ?? fallbackSpan(bound.node),
      ),
    );
  }

  if (unique.includes("block")) {
    options.schedulingPolicy = "drop-while-running";
  }
  if (unique.includes("queue")) {
    options.schedulingPolicy = "queue";
  }
  if (unique.includes("block") && unique.includes("queue")) {
    bound.diagnostics.push(
      createErrorDiagnostic(
        "XS206",
        "Conflicting XMLUI event handler directives 'block' and 'queue'.",
        span ?? fallbackSpan(bound.node),
      ),
    );
  }

  return options;
}

function fallbackSpan(node: ScriptNode): SourceSpan {
  return node.span;
}

function bindWriteTarget(
  target: ScriptNode,
  operator: string,
  scope: XmluiScope,
  result: BoundScriptResult,
  findLexicalBinding: (name: string) => { mutable: boolean; span: SourceSpan } | undefined,
): BoundWriteTarget {
  if (target.kind === "Identifier") {
    const lexical = findLexicalBinding(target.name);
    if (lexical) {
      if (!lexical.mutable) {
        result.diagnostics.push(
          createErrorDiagnostic(
            "XS202",
            `Cannot write to read-only XMLUI script target '${target.name}'.`,
            target.span,
          ),
        );
        return {
          kind: "invalid",
          name: target.name,
          path: [target.name],
          operator: operator as BoundWriteTarget["operator"],
          span: target.span,
        };
      }
      return {
        kind: "handlerLocal",
        name: target.name,
        path: [target.name],
        operator: operator as BoundWriteTarget["operator"],
        span: target.span,
      };
    }
    return bindIdentifierWrite(target.name, target.span, operator, scope, result);
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
      operator: operator as BoundWriteTarget["operator"],
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

  if (target.kind === "MemberExpression" && target.property.kind === "Identifier") {
    return {
      kind: "member",
      name: target.property.name,
      path: [target.property.name],
      operator: operator as BoundWriteTarget["operator"],
      span: target.span,
      object: lowerWriteTargetObject(target.object, scope, findLexicalBinding, result),
    };
  }

  if (target.kind === "IndexExpression") {
    return {
      kind: "index",
      name: "[]",
      path: [],
      operator: operator as BoundWriteTarget["operator"],
      span: target.span,
      object: lowerWriteTargetObject(target.object, scope, findLexicalBinding, result),
      index: lowerNode(target.index, result),
    };
  }

  result.diagnostics.push(
    createErrorDiagnostic("XS203", "Invalid XMLUI script write target.", target.span),
  );
  return {
    kind: "invalid",
    name: "",
    path: [],
    operator: operator as BoundWriteTarget["operator"],
    span: target.span,
  };
}

function lowerWriteTargetObject(
  object: ScriptNode,
  scope: XmluiScope,
  findLexicalBinding: (name: string) => { mutable: boolean; span: SourceSpan } | undefined,
  result: BoundScriptResult,
): XmluiScriptIr {
  if (object.kind !== "Identifier" || findLexicalBinding(object.name)) {
    return lowerNode(object, result);
  }
  const binding = resolveXmluiIdentifier(scope, object.name);
  if (!binding || binding.kind === "special") {
    return lowerNode(object, result);
  }
  return identifierReadIr({
    kind: "IdentifierRead",
    span: object.span,
    name: object.name,
  }, {
    kind: binding.kind,
    name: object.name,
    path: [object.name],
    span: object.span,
    binding,
  });
}

function lowerNode(node: ScriptNode, bound: BoundScriptResult): XmluiScriptIr {
  switch (node.kind) {
    case "Literal":
      return {
        kind: "LiteralExpression",
        span: node.span,
        value: node.value,
      };
    case "TemplateLiteral":
      return {
        kind: "TemplateLiteralExpression",
        span: node.span,
        parts: node.parts.map((part) => typeof part === "string" ? part : lowerNode(part, bound)),
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
        elements: node.elements.map((element) =>
          element.kind === "ArraySpreadElement"
            ? {
                kind: "ArraySpreadElement",
                span: element.span,
                argument: lowerNode(element.argument, bound),
              }
            : lowerNode(element, bound)
        ),
      };
    case "ObjectExpression":
      return {
        kind: "ObjectExpression",
        span: node.span,
        properties: node.properties.map((property) =>
          property.kind === "ObjectSpreadProperty"
            ? {
                kind: "spread",
                argument: lowerNode(property.argument, bound),
              }
            : {
                kind: "property",
                key: objectKeyName(property.key),
                value: lowerNode(property.value, bound),
                ...(property.shorthand ? { shorthand: true } : {}),
              }
        ),
      };
    case "ConditionalExpression":
      return {
        kind: "ConditionalExpression",
        span: node.span,
        test: lowerNode(node.test, bound),
        consequent: lowerNode(node.consequent, bound),
        alternate: lowerNode(node.alternate, bound),
      };
    case "SequenceExpression":
      return {
        kind: "SequenceExpression",
        span: node.span,
        expressions: node.expressions.map((expression) => lowerNode(expression, bound)),
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
      if (
        node.operator === "!" ||
        node.operator === "+" ||
        node.operator === "-" ||
        node.operator === "delete" ||
        node.operator === "typeof"
      ) {
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
    case "AssignmentExpression":
      if (isSupportedAssignmentOperator(node.operator)) {
        return {
          kind: "AssignmentExpression",
          span: node.span,
          operator: node.operator,
          target: findWrite(bound, node.left.span) ?? invalidWrite(node.left.span),
          right: lowerNode(node.right, bound),
        };
      }
      return unsupported(node);
    case "PrefixExpression":
      if (node.operator === "++" || node.operator === "--") {
        return {
          kind: "PrefixUpdate",
          span: node.span,
          operator: node.operator,
          target: findWrite(bound, node.argument.span) ?? invalidWrite(node.argument.span),
        };
      }
      return unsupported(node);
    case "PostfixExpression":
      return {
        kind: "PostfixUpdate",
        span: node.span,
        operator: node.operator === "--" ? "--" : "++",
        target: findWrite(bound, node.argument.span) ?? invalidWrite(node.argument.span),
      };
    case "ExpressionStatement":
      return lowerExpressionStatement(node, bound);
    case "BlockStatement":
    case "IfStatement":
    case "WhileStatement":
    case "ReturnStatement":
    case "ThrowStatement":
    case "VariableDeclaration":
      return lowerHandlerStatement(node, bound);
    case "Program":
      return eventHandlerIrFromProgram(node, bound);
    default:
      return unsupported(node);
  }
}

function eventHandlerIrFromProgram(
  node: Extract<ScriptNode, { kind: "Program" }>,
  bound: BoundScriptResult,
): XmluiEventHandlerIr {
  const prologue = extractHandlerDirectivePrologue(node.body, bound);
  const body = prologue.body.map((statement) => lowerHandlerStatement(statement, bound));
  diagnoseSyncHandlerSafety(prologue.options, body, bound);
  return {
    kind: "EventHandler",
    span: node.span,
    options: prologue.options,
    body,
  };
}

function diagnoseSyncHandlerSafety(
  options: XmluiHandlerOptions,
  body: readonly XmluiHandlerStatementIr[],
  bound: BoundScriptResult,
): void {
  if (options.executionMode !== "sync") {
    return;
  }
  for (const statement of body) {
    const unsafe = findSyncUnsafeStatement(statement);
    if (!unsafe) {
      continue;
    }
    bound.diagnostics.push(
      createErrorDiagnostic("XS207", unsafe.message, unsafe.span),
    );
  }
}

function findSyncUnsafeStatement(
  statement: XmluiHandlerStatementIr,
): { message: string; span: SourceSpan } | undefined {
  switch (statement.kind) {
    case "ExpressionStatement":
      return expressionContainsSyncUnsafeCall(statement.expression)
        ? {
            message: "Sync XMLUI event handlers cannot contain async-capable function calls.",
            span: statement.expression.span,
          }
        : undefined;
    case "VariableDeclaration": {
      const declaration = statement.declarations.find((item) =>
        item.init ? expressionContainsSyncUnsafeCall(item.init) : false,
      );
      return declaration?.init
        ? {
            message: "Sync XMLUI event handlers cannot contain async-capable function calls.",
            span: declaration.init.span,
          }
        : undefined;
    }
    case "BlockStatement":
      return statement.body.map(findSyncUnsafeStatement).find(Boolean);
    case "IfStatement":
      return expressionContainsSyncUnsafeCall(statement.test)
        ? {
            message: "Sync XMLUI event handlers cannot contain async-capable function calls.",
            span: statement.test.span,
          }
        : findSyncUnsafeStatement(statement.consequent) ??
            (statement.alternate ? findSyncUnsafeStatement(statement.alternate) : undefined);
    case "WhileStatement":
      return undefined;
    case "ReturnStatement":
      return statement.argument && expressionContainsSyncUnsafeCall(statement.argument)
        ? {
            message: "Sync XMLUI event handlers cannot contain async-capable function calls.",
            span: statement.argument.span,
          }
        : undefined;
    case "ThrowStatement":
      return expressionContainsSyncUnsafeCall(statement.argument)
        ? {
            message: "Sync XMLUI event handlers cannot contain async-capable function calls.",
            span: statement.argument.span,
          }
        : undefined;
  }
}

function expressionContainsSyncUnsafeCall(expression: XmluiScriptIr): boolean {
  switch (expression.kind) {
    case "CallExpression":
      return isSyncUnsafeCall(expression) ||
        expressionContainsSyncUnsafeCall(expression.callee) ||
        expression.args.some(expressionContainsSyncUnsafeCall);
    case "MemberRead":
      return expressionContainsSyncUnsafeCall(expression.object);
    case "IndexRead":
      return expressionContainsSyncUnsafeCall(expression.object) ||
        expressionContainsSyncUnsafeCall(expression.index);
    case "LogicalExpression":
    case "BinaryExpression":
      return expressionContainsSyncUnsafeCall(expression.left) ||
        expressionContainsSyncUnsafeCall(expression.right);
    case "UnaryExpression":
      return expressionContainsSyncUnsafeCall(expression.argument);
    case "ConditionalExpression":
      return expressionContainsSyncUnsafeCall(expression.test) ||
        expressionContainsSyncUnsafeCall(expression.consequent) ||
        expressionContainsSyncUnsafeCall(expression.alternate);
    case "SequenceExpression":
      return expression.expressions.some(expressionContainsSyncUnsafeCall);
    case "ArrayExpression":
      return expression.elements.some((element) =>
        expressionContainsSyncUnsafeCall(
          element.kind === "ArraySpreadElement" ? element.argument : element,
        )
      );
    case "TemplateLiteralExpression":
      return expression.parts.some((part) =>
        typeof part !== "string" && expressionContainsSyncUnsafeCall(part)
      );
    case "ObjectExpression":
      return expression.properties.some((property) =>
        expressionContainsSyncUnsafeCall(property.kind === "spread" ? property.argument : property.value)
      );
    case "ArrowFunctionExpression":
      return expressionContainsSyncUnsafeCall(expression.body);
    case "AssignmentExpression":
      return expressionContainsSyncUnsafeCall(expression.right);
    case "ExpressionStatement":
      return expressionContainsSyncUnsafeCall(expression.expression);
    case "VariableDeclaration":
      return expression.declarations.some((declaration) =>
        declaration.init ? expressionContainsSyncUnsafeCall(declaration.init) : false
      );
    case "BlockStatement":
      return expression.body.some((statement) => findSyncUnsafeStatement(statement) !== undefined);
    case "IfStatement":
      return expressionContainsSyncUnsafeCall(expression.test) ||
        findSyncUnsafeStatement(expression.consequent) !== undefined ||
        (expression.alternate ? findSyncUnsafeStatement(expression.alternate) !== undefined : false);
    case "WhileStatement":
      return expressionContainsSyncUnsafeCall(expression.test) ||
        findSyncUnsafeStatement(expression.body) !== undefined;
    case "ReturnStatement":
      return expression.argument ? expressionContainsSyncUnsafeCall(expression.argument) : false;
    case "ThrowStatement":
      return expressionContainsSyncUnsafeCall(expression.argument);
    case "PrefixUpdate":
    case "PostfixUpdate":
    case "LiteralExpression":
    case "IdentifierRead":
    case "ScopedMemberRead":
    case "EventHandler":
    case "Unsupported":
      return false;
  }
}

function isSyncUnsafeCall(expression: Extract<XmluiScriptIr, { kind: "CallExpression" }>): boolean {
  return expression.callee.kind === "IdentifierRead" &&
    (expression.callee.name === "delay" ||
      expression.callee.name === "emitEvent" ||
      expression.callee.name === "navigate");
}

function lowerHandlerStatement(
  node: ScriptNode,
  bound: BoundScriptResult,
): XmluiHandlerStatementIr {
  switch (node.kind) {
    case "BlockStatement":
      return {
        kind: "BlockStatement",
        span: node.span,
        body: node.body.map((statement) => lowerHandlerStatement(statement, bound)),
      };
    case "IfStatement":
      return {
        kind: "IfStatement",
        span: node.span,
        test: lowerNode(node.test, bound),
        consequent: lowerHandlerStatement(node.consequent, bound),
        ...(node.alternate ? { alternate: lowerHandlerStatement(node.alternate, bound) } : {}),
      };
    case "WhileStatement":
      return {
        kind: "WhileStatement",
        span: node.span,
        test: lowerNode(node.test, bound),
        body: lowerHandlerStatement(node.body, bound),
      };
    case "ReturnStatement":
      return {
        kind: "ReturnStatement",
        span: node.span,
        ...(node.argument ? { argument: lowerNode(node.argument, bound) } : {}),
      };
    case "ThrowStatement":
      return {
        kind: "ThrowStatement",
        span: node.span,
        argument: lowerNode(node.argument, bound),
      };
    case "VariableDeclaration":
      return {
        kind: "VariableDeclaration",
        span: node.span,
        declarationKind: node.declarationKind,
        declarations: node.declarations.map((declaration) => ({
          name: declaration.id.name,
          span: declaration.id.span,
          ...(declaration.init ? { init: lowerNode(declaration.init, bound) } : {}),
        })),
      };
    default:
      return lowerExpressionStatement(node, bound);
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

function invalidWrite(span: SourceSpan): BoundWriteTarget {
  return {
    kind: "invalid",
    name: "",
    path: [],
    operator: "=",
    span,
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

function isSupportedAssignmentOperator(
  operator: string,
): operator is XmluiAssignmentExpressionIr["operator"] {
  return ["=", "+=", "-=", "*=", "/=", "%="].includes(operator);
}

function isAllowedCall(callee: ScriptNode, scope?: XmluiScope): boolean {
  if (isDebugHelperCallee(callee)) {
    return true;
  }
  if (callee.kind === "Identifier" && callee.name === "delay") {
    return true;
  }
  if (callee.kind === "Identifier" && callee.name === "emitEvent") {
    return true;
  }
  if (callee.kind === "Identifier" && callee.name === "navigate") {
    return true;
  }
  if (callee.kind === "Identifier" && isAllowedBuiltInCallName(callee.name)) {
    return true;
  }
  if (callee.kind === "Identifier" && scope?.specials.has(callee.name)) {
    return true;
  }
  if (callee.kind === "Identifier" && scope && resolveXmluiIdentifier(scope, callee.name)?.kind === "context") {
    return true;
  }
  if (callee.kind === "Identifier" && scope) {
    const binding = resolveXmluiIdentifier(scope, callee.name);
    if (binding?.kind === "local" || binding?.kind === "global") {
      return true;
    }
  }
  if (callee.kind === "MemberExpression") {
    return true;
  }
  return false;
}

function isDebugHelperCallee(callee: ScriptNode): boolean {
  return callee.kind === "Identifier" &&
    (callee.name === "debugBreak" ||
      callee.name === "debugLog" ||
      callee.name === "debugTrace" ||
      callee.name === "debugWatch");
}

const allowedMutatingMethodNames = ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];

function isAllowedMutatingMethodName(name: string): boolean {
  return allowedMutatingMethodNames.includes(name);
}

function isAllowedBuiltInCallName(name: string): boolean {
  return name === "Date" || name === "getDate" || name === "Symbol" || name === "BigInt";
}

function isBuiltInReferenceName(name: string): boolean {
  return name === "App" ||
    name === "Array" ||
    name === "Date" ||
    name === "Math" ||
    name === "getDate" ||
    name === "Symbol" ||
    name === "BigInt";
}

function resolveParentLocal(scope: XmluiScope, name: string): XmluiBinding | undefined {
  if (scope.locals.has(name)) {
    return scope.locals.get(name);
  }
  return scope.parent ? resolveParentLocal(scope.parent, name) : undefined;
}

function collectStaticReferenceBindings(
  element: XmluiElement,
  sourceId: string,
  references: Map<string, XmluiBinding>,
): void {
  const id = staticReferenceName(element, "id") ?? staticReferenceName(element, "ref");
  if (id && !references.has(id)) {
    references.set(id, {
      kind: "reference",
      name: id,
      mutable: false,
      span: propSpan(sourceId, element, Object.prototype.hasOwnProperty.call(element.props, "id") ? "id" : "ref"),
    });
  }
  for (const child of element.children) {
    if (child.kind === "element") {
      collectStaticReferenceBindings(child, sourceId, references);
    }
  }
}

function staticReferenceName(element: XmluiElement, propName: "id" | "ref"): string | undefined {
  const value = element.props[propName];
  if (typeof value !== "string" || value.trim() === "" || value.trim().startsWith("{")) {
    return undefined;
  }
  return value;
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
      operator: operator as BoundWriteTarget["operator"],
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
      operator: operator as BoundWriteTarget["operator"],
      span,
      binding,
    };
  }

  return {
    kind: binding.kind,
    name,
    path: [name],
    operator: operator as BoundWriteTarget["operator"],
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

function propSpan(sourceId: string, element: XmluiElement, name: string): SourceSpan {
  const parsed = element.parsed?.props?.[name];
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

function dedupeInvalidates(
  invalidates: Array<{ kind: "local" | "global"; name: string }>,
): Array<{ kind: "local" | "global"; name: string }> {
  const seen = new Set<string>();
  return invalidates.filter((invalidate) => {
    const key = `${invalidate.kind}:${invalidate.name}`;
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
    case "TemplateLiteralExpression":
      return `[${ir.parts.map((part) =>
        typeof part === "string" ? JSON.stringify(part) : emitExpression(part)
      ).join(", ")}].join("")`;
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
      if (ir.operator === "delete") {
        return emitDeleteExpression(ir.argument);
      }
      if (ir.operator === "typeof") {
        return `(typeof ${emitExpression(ir.argument)})`;
      }
      return `(${ir.operator}${emitExpression(ir.argument)})`;
    case "ConditionalExpression":
      return `(${emitExpression(ir.test)} ? ${emitExpression(ir.consequent)} : ${emitExpression(ir.alternate)})`;
    case "SequenceExpression":
      return `(${ir.expressions.map(emitExpression).join(", ")})`;
    case "ArrayExpression":
      return `[${ir.elements.map((element) =>
        element.kind === "ArraySpreadElement"
          ? `...${emitExpression(element.argument)}`
          : emitExpression(element)
      ).join(", ")}]`;
    case "ObjectExpression":
      return `{${ir.properties.map((property) =>
        property.kind === "spread"
          ? `...${emitExpression(property.argument)}`
          : `${JSON.stringify(property.key)}: ${emitExpression(property.value)}`
      ).join(", ")}}`;
    case "CallExpression":
      return emitCallExpression(ir);
    case "ArrowFunctionExpression":
      if (ir.body.kind === "BlockStatement") {
        const body = markArrowParameterReads(ir.body, new Set(ir.params));
        return `async (${ir.params.join(", ")}) => {\nlet __xmluiResult;\n${emitArrowBlockStatement(body as XmluiBlockStatementIr)}\nreturn __xmluiResult;\n}`;
      }
      return `(${ir.params.join(", ")}) => (${emitExpression(markArrowParameterReads(ir.body, new Set(ir.params)))})`;
    case "AssignmentExpression":
      return emitAssignmentExpression(ir);
    case "PrefixUpdate":
    case "PostfixUpdate":
      return emitUpdateExpression(ir);
    default:
      throw new Error(`Cannot compile ${ir.kind} as an XMLUI expression.`);
  }
}

function emitArrowBlockStatement(statement: XmluiBlockStatementIr): string {
  const context = createArrowBlockCodegenContext();
  const body = statement.body;
  const emitted = body.map((child, index) => {
    const isLast = index === body.length - 1;
    if (isLast && child.kind === "ExpressionStatement" && !isDebugBreakCall(child.expression)) {
      return `__xmluiResult = ${emitEventExpression(child.expression)};`;
    }
    return emitEventStatement(child, context);
  }).join("\n");
  return `{\n${emitted}\n}`;
}

function markArrowParameterReads(ir: XmluiScriptIr, params: Set<string>): XmluiScriptIr {
  switch (ir.kind) {
    case "IdentifierRead":
      return params.has(ir.name)
        ? { ...ir, dependency: { kind: "special", name: ir.name } as BoundDependency }
        : ir;
    case "ScopedMemberRead":
    case "LiteralExpression":
    case "Unsupported":
      return ir;
    case "TemplateLiteralExpression":
      return {
        ...ir,
        parts: ir.parts.map((part) =>
          typeof part === "string" ? part : markArrowParameterReads(part, params)
        ),
      };
    case "MemberRead":
      return { ...ir, object: markArrowParameterReads(ir.object, params) };
    case "IndexRead":
      return {
        ...ir,
        object: markArrowParameterReads(ir.object, params),
        index: markArrowParameterReads(ir.index, params),
      };
    case "LogicalExpression":
    case "BinaryExpression":
      return {
        ...ir,
        left: markArrowParameterReads(ir.left, params),
        right: markArrowParameterReads(ir.right, params),
      };
    case "UnaryExpression":
      return { ...ir, argument: markArrowParameterReads(ir.argument, params) };
    case "ConditionalExpression":
      return {
        ...ir,
        test: markArrowParameterReads(ir.test, params),
        consequent: markArrowParameterReads(ir.consequent, params),
        alternate: markArrowParameterReads(ir.alternate, params),
      };
    case "SequenceExpression":
      return {
        ...ir,
        expressions: ir.expressions.map((expression) => markArrowParameterReads(expression, params)),
      };
    case "ArrayExpression":
      return {
        ...ir,
        elements: ir.elements.map((element) =>
          element.kind === "ArraySpreadElement"
            ? { ...element, argument: markArrowParameterReads(element.argument, params) }
            : markArrowParameterReads(element, params)
        ),
      };
    case "ObjectExpression":
      return {
        ...ir,
        properties: ir.properties.map((property) =>
          property.kind === "spread"
            ? { ...property, argument: markArrowParameterReads(property.argument, params) }
            : { ...property, value: markArrowParameterReads(property.value, params) },
        ),
      };
    case "CallExpression":
      return {
        ...ir,
        callee: markArrowParameterReads(ir.callee, params) as XmluiCallExpressionIr["callee"],
        args: ir.args.map((arg) => markArrowParameterReads(arg, params)),
      };
    case "ArrowFunctionExpression": {
      const nestedParams = new Set(params);
      ir.params.forEach((param) => nestedParams.delete(param));
      return { ...ir, body: markArrowParameterReads(ir.body, nestedParams) };
    }
    case "AssignmentExpression":
      return { ...ir, right: markArrowParameterReads(ir.right, params) };
    case "PrefixUpdate":
    case "PostfixUpdate":
      return ir;
    case "EventHandler":
      return { ...ir, body: ir.body.map((statement) => markArrowParameterReads(statement, params) as XmluiHandlerStatementIr) };
    case "ExpressionStatement":
      return { ...ir, expression: markArrowParameterReads(ir.expression, params) };
    case "VariableDeclaration":
      return {
        ...ir,
        declarations: ir.declarations.map((declaration) => ({
          ...declaration,
          ...(declaration.init ? { init: markArrowParameterReads(declaration.init, params) } : {}),
        })),
      };
    case "BlockStatement":
      return { ...ir, body: ir.body.map((statement) => markArrowParameterReads(statement, params) as XmluiHandlerStatementIr) };
    case "IfStatement":
      return {
        ...ir,
        test: markArrowParameterReads(ir.test, params),
        consequent: markArrowParameterReads(ir.consequent, params) as XmluiHandlerStatementIr,
        ...(ir.alternate
          ? { alternate: markArrowParameterReads(ir.alternate, params) as XmluiHandlerStatementIr }
          : {}),
      };
    case "WhileStatement":
      return {
        ...ir,
        test: markArrowParameterReads(ir.test, params),
        body: markArrowParameterReads(ir.body, params) as XmluiHandlerStatementIr,
      };
    case "ReturnStatement":
      return {
        ...ir,
        ...(ir.argument ? { argument: markArrowParameterReads(ir.argument, params) } : {}),
      };
    case "ThrowStatement":
      return { ...ir, argument: markArrowParameterReads(ir.argument, params) };
  }
}

function emitDeleteExpression(argument: XmluiScriptIr): string {
  if (argument.kind === "MemberRead") {
    return `(delete (${emitExpression(argument.object)})[${JSON.stringify(argument.member)}])`;
  }
  if (argument.kind === "IndexRead") {
    return `(delete (${emitExpression(argument.object)})[${emitExpression(argument.index)}])`;
  }
  return `(delete (${emitExpression(argument)}))`;
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
  const args = ir.args.map(emitExpression).join(", ");
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "Date") {
    return `new Date(${args})`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.dependency?.kind === "context") {
    return `((__xmluiContextFn) => typeof __xmluiContextFn === "function" ? __xmluiContextFn(${args}) : undefined)(ctx.readContext?.(${JSON.stringify(ir.callee.name)}))`;
  }
  if (ir.callee.kind === "IdentifierRead" && isAllowedBuiltInCallName(ir.callee.name)) {
    return `((__xmluiBuiltInFn) => typeof __xmluiBuiltInFn === "function" ? __xmluiBuiltInFn(${args}) : undefined)(${emitRead(ir.callee.dependency, ir.callee.name)})`;
  }
  if (
    ir.callee.kind === "IdentifierRead" &&
    (ir.callee.dependency?.kind === "local" || ir.callee.dependency?.kind === "global")
  ) {
    return `((__xmluiLocalFn) => typeof __xmluiLocalFn === "function" ? __xmluiLocalFn(${args}) : undefined)(${emitRead(ir.callee.dependency, ir.callee.name)})`;
  }
  if (ir.callee.kind !== "MemberRead" && ir.callee.kind !== "ScopedMemberRead") {
    throw new Error("Cannot compile unsupported XMLUI expression call target.");
  }
  if (ir.callee.kind === "ScopedMemberRead") {
    throw new Error("Cannot compile unsupported XMLUI expression call target.");
  }
  const objectSource = emitExpression(ir.callee.object);
  return `(${objectSource})?.[${JSON.stringify(ir.callee.member)}]?.(${args})`;
}

function emitEventStatement(statement: XmluiHandlerStatementIr, context: EventCodegenContext): string {
  const emitted = emitEventStatementBody(statement, context);
  return context.checkpointCall && statementNeedsCheckpoint(statement)
    ? `${emitted}\n${context.checkpointCall}`
    : emitted;
}

function emitEventStatementBody(statement: XmluiHandlerStatementIr, context: EventCodegenContext): string {
  switch (statement.kind) {
    case "ExpressionStatement":
      if (isDebugBreakCall(statement.expression)) {
        return `${emitDebugBreakStatement()}\nundefined;`;
      }
      return `${emitEventExpression(statement.expression)};`;
    case "VariableDeclaration":
      return emitVariableDeclaration(statement);
    case "BlockStatement":
      return emitBlockStatement(statement, context);
    case "IfStatement":
      return emitIfStatement(statement, context);
    case "WhileStatement":
      return emitWhileStatement(statement, context);
    case "ReturnStatement":
      return statement.argument
        ? `return ${emitAsyncExpression(statement.argument)};`
        : "return;";
    case "ThrowStatement":
      return `throw ${emitThrowStatementError(emitAsyncExpression(statement.argument))};`;
  }
}

function emitEventExpression(expression: XmluiScriptIr): string {
  switch (expression.kind) {
    case "AssignmentExpression":
      return emitAssignmentExpression(expression);
    case "PrefixUpdate":
    case "PostfixUpdate":
      return emitUpdateExpression(expression);
    case "ArrowFunctionExpression":
      if (expression.params.length === 0) {
        if (expression.body.kind === "BlockStatement") {
          return emitExpression(expression);
        }
        return emitEventExpression(expression.body);
      }
      return emitExpression(expression);
    default:
      return emitAsyncExpression(expression);
  }
}

function emitAsyncExpression(expression: XmluiScriptIr): string {
  if (expression.kind === "CallExpression") {
    return emitAsyncCallExpression(expression);
  }
  if (expression.kind === "SequenceExpression") {
    return `(${expression.expressions.map(emitAsyncExpression).join(", ")})`;
  }
  if (expression.kind === "TemplateLiteralExpression") {
    return `[${expression.parts.map((part) =>
      typeof part === "string" ? JSON.stringify(part) : emitAsyncExpression(part)
    ).join(", ")}].join("")`;
  }
  return emitExpression(expression);
}

function emitAsyncCallExpression(ir: XmluiCallExpressionIr): string {
  const args = ir.args.map(emitAsyncExpression);
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugBreak") {
    return "undefined";
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugLog") {
    return emitDebugHelperCall("log", args, "console.log");
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugTrace") {
    return emitDebugHelperCall("trace", args, "console.trace");
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugWatch") {
    return emitDebugHelperCall("watch", args, "console.log", "[xmlui watch]");
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "delay") {
    return `await ((ctx.delay ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))))(${args.join(", ")}))`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "emitEvent") {
    const [name, ...eventArgs] = args;
    return `await ((ctx.complete ?? ((value) => Promise.resolve(value)))(await ctx.emitEvent?.(${name ?? "undefined"}, [${eventArgs.join(", ")}])))`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "navigate") {
    const [target, queryParams] = args;
    return `ctx.navigate?.(${target ?? "undefined"}, ${queryParams ?? "undefined"})`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "Date") {
    return `new Date(${args.join(", ")})`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.dependency?.kind === "context") {
    return `await (async (__xmluiContextFn) => typeof __xmluiContextFn === "function" ? await ((ctx.complete ?? ((value) => Promise.resolve(value)))(await __xmluiContextFn(${args.join(", ")}))) : undefined)(ctx.readContext?.(${JSON.stringify(ir.callee.name)}))`;
  }
  if (ir.callee.kind === "IdentifierRead") {
    return `await ((ctx.complete ?? ((value) => Promise.resolve(value)))(await ctx.callFunction?.(${JSON.stringify(ir.callee.name)}, [${args.join(", ")}])))`;
  }
  if (ir.callee.kind !== "MemberRead") {
    throw new Error("Cannot compile unsupported XMLUI event call target.");
  }
  const objectSource = emitAsyncExpression(ir.callee.object);
  return `await (ctx.complete ?? ((value) => Promise.resolve(value)))(await (ctx.call ?? ((target, methodName, args) => target?.[methodName]?.(...args)))(${objectSource}, ${JSON.stringify(ir.callee.member)}, [${args.join(", ")}]))`;
}

function isDebugBreakCall(expression: XmluiScriptIr): boolean {
  return expression.kind === "CallExpression" &&
    expression.callee.kind === "IdentifierRead" &&
    expression.callee.name === "debugBreak";
}

function emitDebugHelperCall(
  kind: "watch" | "log" | "trace",
  args: string[],
  consoleMethod: "console.log" | "console.trace",
  consolePrefix?: string,
): string {
  const consoleArgs = consolePrefix
    ? `${JSON.stringify(consolePrefix)}, ...__xmluiDebugArgs`
    : "...__xmluiDebugArgs";
  const eventFields = kind === "watch"
    ? `kind: "watch", label: __xmluiDebugArgs[0], value: __xmluiDebugArgs[1], args: __xmluiDebugArgs`
    : `kind: ${JSON.stringify(kind)}, args: __xmluiDebugArgs`;
  return `((...__xmluiDebugArgs) => { ctx.debug?.emit({ ${eventFields}, metadata: { timestamp: ${debugTimestampExpression()} } }); ${consoleMethod}(${consoleArgs}); return undefined; })(${args.join(", ")})`;
}

function emitDebugBreakStatement(): string {
  return `ctx.debug?.emit({ kind: "break", args: [], metadata: { timestamp: ${debugTimestampExpression()} } });\ndebugger;`;
}

function debugTimestampExpression(): string {
  return `(typeof performance !== "undefined" ? performance.now() : Date.now())`;
}

function emitVariableDeclaration(statement: XmluiVariableDeclarationIr): string {
  const declarations = statement.declarations
    .map((declaration) =>
      declaration.init
        ? `${declaration.name} = ${emitAsyncExpression(declaration.init)}`
        : declaration.name,
    )
    .join(", ");
  return `${statement.declarationKind} ${declarations};`;
}

function emitBlockStatement(statement: XmluiBlockStatementIr, context: EventCodegenContext): string {
  return `{\n${statement.body.map((child) => emitEventStatement(child, context)).join("\n")}\n}`;
}

function emitIfStatement(statement: XmluiIfStatementIr, context: EventCodegenContext): string {
  const consequent = emitStatementBlock(statement.consequent, context);
  const alternate = statement.alternate ? ` else ${emitStatementBlock(statement.alternate, context)}` : "";
  return `if (${emitAsyncExpression(statement.test)}) ${consequent}${alternate}`;
}

function emitWhileStatement(statement: XmluiWhileStatementIr, context: EventCodegenContext): string {
  if (!context.checkpointCall || !loopNeedsPacing(statement)) {
    return `{\nwhile (${emitAsyncExpression(statement.test)}) {\n${emitEventStatement(statement.body, context)}\n}\n}`;
  }
  const checkpointName = context.allocateLoopCheckpointName();
  return `{\nlet ${checkpointName} = 0;\nwhile (${emitAsyncExpression(statement.test)}) {\n${emitEventStatement(statement.body, context)}\nif (((++${checkpointName}) & 255) === 0) {\n${context.checkpointCall}\n}\n}\n}`;
}

function emitStatementBlock(statement: XmluiHandlerStatementIr, context: EventCodegenContext): string {
  return statement.kind === "BlockStatement" ? emitBlockStatement(statement, context) : `{\n${emitEventStatement(statement, context)}\n}`;
}

function emitAssignmentExpression(expression: XmluiAssignmentExpressionIr): string {
  const target = expression.target;
  const right = emitAsyncExpression(expression.right);
  if (target.kind === "handlerLocal") {
    if (expression.operator === "=") {
      return `${target.name} = ${right}`;
    }
    return `${target.name} ${expression.operator} ${right}`;
  }
  const next = expression.operator === "="
    ? right
    : `(${emitTargetRead(target)} ${compoundOperator(expression.operator)} ${right})`;
  return emitTargetWrite(target, next);
}

function emitUpdateExpression(expression: XmluiPrefixUpdateIr | XmluiPostfixUpdateIr): string {
  const delta = expression.operator === "--" ? "- 1" : "+ 1";
  const target = expression.target;
  if (target.kind === "handlerLocal") {
    return `${expression.kind === "PrefixUpdate" ? expression.operator : ""}${target.name}${expression.kind === "PostfixUpdate" ? expression.operator : ""}`;
  }
  const current = emitTargetRead(target);
  const result = expression.kind === "PrefixUpdate" ? "__xmluiNext" : "__xmluiCurrent";
  return `((__xmluiCurrent) => { const __xmluiNext = Number(__xmluiCurrent) ${delta}; ${emitTargetWrite(target, "__xmluiNext")}; return ${result}; })(${current})`;
}

function emitTargetRead(target: BoundWriteTarget): string {
  if (target.kind === "handlerLocal") {
    return target.name;
  }
  if (target.kind === "member" && target.object) {
    return emitOptionalMemberRead(target.object, target.name);
  }
  if (target.kind === "index" && target.object && target.index) {
    return emitOptionalIndexRead(target.object, target.index);
  }
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot compile invalid XMLUI event write target '${target.name}'.`);
  }
  const read = target.kind === "local" ? "readLocal" : "readGlobal";
  return `ctx.${read}(${JSON.stringify(target.name)})`;
}

function emitTargetWrite(target: BoundWriteTarget, valueSource: string): string {
  if (target.kind === "member" && target.object) {
    return `((${emitWriteTargetObject(target.object)})[${JSON.stringify(target.name)}] = ${valueSource})`;
  }
  if (target.kind === "index" && target.object && target.index) {
    return `((${emitWriteTargetObject(target.object)})[${emitExpression(target.index)}] = ${valueSource})`;
  }
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot compile invalid XMLUI event write target '${target.name}'.`);
  }
  const write = target.kind === "local" ? "writeLocal" : "writeGlobal";
  return `ctx.${write}(${JSON.stringify(target.name)}, ${valueSource})`;
}

function emitWriteTargetObject(object: XmluiScriptIr): string {
  if (object.kind === "IdentifierRead" && !object.dependency) {
    return `(ctx.readLocal(${JSON.stringify(object.name)}) ?? ctx.readGlobal(${JSON.stringify(object.name)}) ?? ctx.readReference?.(${JSON.stringify(object.name)}))`;
  }
  if (object.kind === "MemberRead") {
    const objectSource = emitWriteTargetObject(object.object);
    return `(${objectSource} == null ? undefined : ${objectSource}[${JSON.stringify(object.member)}])`;
  }
  if (object.kind === "IndexRead") {
    const objectSource = emitWriteTargetObject(object.object);
    return `(${objectSource} == null ? undefined : ${objectSource}[${emitExpression(object.index)}])`;
  }
  return emitExpression(object);
}

function compoundOperator(operator: XmluiAssignmentExpressionIr["operator"]): string {
  return operator === "=" ? "=" : operator.slice(0, -1);
}

function emitRead(dependency: BoundDependency | undefined, name: string): string {
  switch (dependency?.kind) {
    case "local":
      return `ctx.readLocal(${JSON.stringify(name)})`;
    case "global":
      return `(ctx.readGlobal(${JSON.stringify(name)}) ?? ctx.readReference?.(${JSON.stringify(name)}))`;
    case "context":
      return `ctx.readContext?.(${JSON.stringify(name)})`;
    case "reference":
      return `ctx.readReference?.(${JSON.stringify(name)})`;
    case "special":
      return name;
    case undefined:
      return `(ctx.readLocal(${JSON.stringify(name)}) ?? ctx.readGlobal(${JSON.stringify(name)}) ?? ctx.readReference?.(${JSON.stringify(name)}))`;
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
    case "TemplateLiteralExpression":
      return ir.parts.map((part) =>
        typeof part === "string" ? part : String(executeExpressionIr(part, context, lexical))
      ).join("");
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
      if (ir.operator === "delete") {
        return executeDeleteExpression(ir.argument, context, lexical);
      }
      const argument = executeExpressionIr(ir.argument, context, lexical);
      if (ir.operator === "typeof") {
        return typeof argument;
      }
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
    case "SequenceExpression": {
      let result: unknown;
      for (const expression of ir.expressions) {
        result = executeExpressionIr(expression, context, lexical);
      }
      return result;
    }
    case "ArrayExpression":
      return ir.elements.flatMap((element) =>
        element.kind === "ArraySpreadElement"
          ? Array.from(executeExpressionIr(element.argument, context, lexical) as Iterable<unknown>)
          : [executeExpressionIr(element, context, lexical)]
      );
    case "ObjectExpression":
      return ir.properties.reduce<Record<string, unknown>>((result, property) => {
        if (property.kind === "spread") {
          return Object.assign(result, executeExpressionIr(property.argument, context, lexical));
        }
        result[property.key] = executeExpressionIr(property.value, context, lexical);
        return result;
      }, {});
    case "ArrowFunctionExpression":
      return (...args: unknown[]) => {
        const nextLexical = { ...lexical };
        ir.params.forEach((param, index) => {
          nextLexical[param] = args[index];
        });
        if (ir.body.kind === "BlockStatement") {
          return executeEventStatement(ir.body, context as CompiledEventContext, nextLexical, undefined);
        }
        if (isEventMutationExpression(ir.body)) {
          return executeExpressionIrAsync(ir.body, context as CompiledEventContext, nextLexical);
        }
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
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "Date") {
    return createDate(ir.args.map((arg) => executeExpressionIr(arg, context, lexical)));
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.dependency?.kind === "context") {
    const target = context.readContext?.(ir.callee.name);
    if (typeof target !== "function") {
      return undefined;
    }
    return target(...ir.args.map((arg) => executeExpressionIr(arg, context, lexical)));
  }
  if (ir.callee.kind === "IdentifierRead" && isAllowedBuiltInCallName(ir.callee.name)) {
    const target = context.readReference?.(ir.callee.name);
    if (typeof target !== "function") {
      return undefined;
    }
    return target(...ir.args.map((arg) => executeExpressionIr(arg, context, lexical)));
  }
  if (
    ir.callee.kind === "IdentifierRead" &&
    (ir.callee.dependency?.kind === "local" || ir.callee.dependency?.kind === "global")
  ) {
    const target = executeRead(ir.callee.dependency, ir.callee.name, context, lexical);
    if (typeof target !== "function") {
      return undefined;
    }
    return target(...ir.args.map((arg) => executeExpressionIr(arg, context, lexical)));
  }
  if (ir.callee.kind !== "MemberRead") {
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

async function executeExpressionIrAsync(
  ir: XmluiScriptIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown> = {},
): Promise<unknown> {
  switch (ir.kind) {
    case "AssignmentExpression":
      return executeAssignmentExpression(ir, context, lexical);
    case "PrefixUpdate":
    case "PostfixUpdate":
      return executeUpdateExpression(ir, context, lexical);
    case "LogicalExpression":
      if (ir.operator === "||") {
        return await executeExpressionIrAsync(ir.left, context, lexical) ||
          await executeExpressionIrAsync(ir.right, context, lexical);
      }
      if (ir.operator === "&&") {
        return await executeExpressionIrAsync(ir.left, context, lexical) &&
          await executeExpressionIrAsync(ir.right, context, lexical);
      }
      return await executeExpressionIrAsync(ir.left, context, lexical) ??
        await executeExpressionIrAsync(ir.right, context, lexical);
    case "BinaryExpression":
      return executeBinaryExpressionAsync(ir, context, lexical);
    case "UnaryExpression": {
      if (ir.operator === "delete") {
        return executeDeleteExpressionAsync(ir.argument, context, lexical);
      }
      const argument = await executeExpressionIrAsync(ir.argument, context, lexical);
      if (ir.operator === "typeof") {
        return typeof argument;
      }
      if (ir.operator === "!") {
        return !argument;
      }
      if (ir.operator === "+") {
        return +Number(argument);
      }
      return -Number(argument);
    }
    case "ConditionalExpression":
      return await executeExpressionIrAsync(ir.test, context, lexical)
        ? executeExpressionIrAsync(ir.consequent, context, lexical)
        : executeExpressionIrAsync(ir.alternate, context, lexical);
    case "SequenceExpression": {
      let result: unknown;
      for (const expression of ir.expressions) {
        result = await executeExpressionIrAsync(expression, context, lexical);
      }
      return result;
    }
    case "TemplateLiteralExpression":
      return (await Promise.all(ir.parts.map(async (part) =>
        typeof part === "string" ? part : String(await executeExpressionIrAsync(part, context, lexical))
      ))).join("");
    case "ArrayExpression":
      return (await Promise.all(ir.elements.map(async (element) =>
        element.kind === "ArraySpreadElement"
          ? Array.from(await executeExpressionIrAsync(element.argument, context, lexical) as Iterable<unknown>)
          : [await executeExpressionIrAsync(element, context, lexical)]
      ))).flat();
    case "ObjectExpression": {
      const result: Record<string, unknown> = {};
      for (const property of ir.properties) {
        if (property.kind === "spread") {
          Object.assign(result, await executeExpressionIrAsync(property.argument, context, lexical));
        } else {
          result[property.key] = await executeExpressionIrAsync(property.value, context, lexical);
        }
      }
      return result;
    }
    case "CallExpression":
      return executeCallExpressionAsync(ir, context, lexical);
    default:
      return executeExpressionIr(ir, context, lexical);
  }
}

async function executeBinaryExpressionAsync(
  ir: XmluiBinaryExpressionIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): Promise<unknown> {
  const left = await executeExpressionIrAsync(ir.left, context, lexical) as never;
  const right = await executeExpressionIrAsync(ir.right, context, lexical) as never;
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

async function executeCallExpressionAsync(
  ir: XmluiCallExpressionIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): Promise<unknown> {
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugBreak") {
    context.debug?.emit({
      kind: "break",
      args: [],
      metadata: { timestamp: debugTimestamp() },
    });
    debugger;
    return undefined;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugLog") {
    const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    context.debug?.emit({
      kind: "log",
      args,
      metadata: { timestamp: debugTimestamp() },
    });
    console.log(...args);
    return undefined;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugTrace") {
    const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    context.debug?.emit({
      kind: "trace",
      args,
      metadata: { timestamp: debugTimestamp() },
    });
    console.trace(...args);
    return undefined;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "debugWatch") {
    const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    context.debug?.emit({
      kind: "watch",
      label: args[0],
      value: args[1],
      args,
      metadata: { timestamp: debugTimestamp() },
    });
    console.log("[xmlui watch]", ...args);
    return undefined;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "delay") {
    const [ms] = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    await (context.delay ?? defaultDelay)(Number(ms));
    return undefined;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "emitEvent") {
    const [name, ...args] = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    return (context.complete ?? completeValue)(await context.emitEvent?.(String(name), args));
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "navigate") {
    const [target, queryParams] = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    context.navigate?.(target, queryParams as Record<string, unknown> | undefined);
    return undefined;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "Date") {
    const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    return createDate(args);
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.dependency?.kind === "context") {
    const target = context.readContext?.(ir.callee.name);
    if (typeof target !== "function") {
      return undefined;
    }
    const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    return (context.complete ?? completeValue)(await target(...args));
  }
  if (ir.callee.kind === "IdentifierRead") {
    const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
    return completeValue(context.callFunction?.(ir.callee.name, args));
  }
  if (ir.callee.kind !== "MemberRead") {
    throw new Error("Cannot execute unsupported XMLUI event call target.");
  }
  const object = await executeExpressionIrAsync(ir.callee.object, context, lexical);
  const args = await Promise.all(ir.args.map((arg) => executeExpressionIrAsync(arg, context, lexical)));
  const call = context.call ?? defaultCall;
  return (context.complete ?? completeValue)(await call(object, ir.callee.member, args));
}

function defaultDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function debugTimestamp(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function defaultCall(target: unknown, methodName: string, args: unknown[]): unknown {
  const method = (target as Record<string, unknown> | null | undefined)?.[methodName];
  if (typeof method !== "function") {
    return undefined;
  }
  return method.apply(target, args);
}

function createDate(args: unknown[]): Date {
  return new (Date as any)(...args) as Date;
}

async function completeValue(value: unknown): Promise<unknown> {
  const settled = await value;
  if (Array.isArray(settled)) {
    return Promise.all(settled.map(completeValue));
  }
  if (isPlainObject(settled)) {
    const entries = await Promise.all(
      Object.entries(settled).map(async ([key, entryValue]) => [
        key,
        await completeValue(entryValue),
      ] as const),
    );
    return Object.fromEntries(entries);
  }
  return settled;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

type EventYieldState = {
  lastYield: number;
};

function createEventYieldState(): EventYieldState {
  return {
    lastYield: currentTimestamp(),
  };
}

function currentTimestamp(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

async function yieldAfterStatementIfNeeded(
  context: CompiledEventContext,
  state: EventYieldState | undefined,
): Promise<void> {
  if (!state) {
    return;
  }
  if (currentTimestamp() - state.lastYield < 100) {
    return;
  }
  await (context.yieldIfNeeded ?? defaultYieldIfNeeded)(0);
  state.lastYield = currentTimestamp();
}

function defaultYieldIfNeeded(_iteration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function executeEventStatement(
  statement: XmluiHandlerStatementIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
  yieldState: EventYieldState | undefined,
): Promise<unknown> {
  const result = await executeEventStatementBody(statement, context, lexical, yieldState);
  if (statementNeedsCheckpoint(statement)) {
    await yieldAfterStatementIfNeeded(context, yieldState);
  }
  return result;
}

async function executeEventStatementBody(
  statement: XmluiHandlerStatementIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
  yieldState: EventYieldState | undefined,
): Promise<unknown> {
  switch (statement.kind) {
    case "ExpressionStatement":
      return executeEventExpression(statement.expression, context, lexical);
    case "VariableDeclaration":
      for (const declaration of statement.declarations) {
        lexical[declaration.name] = declaration.init
          ? await executeExpressionIrAsync(declaration.init, context, lexical)
          : undefined;
      }
      return undefined;
    case "BlockStatement": {
      const blockLexical = Object.create(lexical) as Record<string, unknown>;
      let blockResult: unknown;
      for (const child of statement.body) {
        blockResult = await executeEventStatement(child, context, blockLexical, yieldState);
        if (isReturnSignal(blockResult)) {
          return blockResult;
        }
      }
      return blockResult;
    }
    case "IfStatement":
      if (await executeExpressionIrAsync(statement.test, context, lexical)) {
        return executeEventStatement(statement.consequent, context, lexical, yieldState);
      } else if (statement.alternate) {
        return executeEventStatement(statement.alternate, context, lexical, yieldState);
      }
      return undefined;
    case "WhileStatement": {
      let loopResult: unknown;
      let loopCheckpoint = 0;
      while (await executeExpressionIrAsync(statement.test, context, lexical)) {
        loopResult = await executeEventStatement(statement.body, context, lexical, yieldState);
        if (isReturnSignal(loopResult)) {
          return loopResult;
        }
        if (loopNeedsPacing(statement) && ((++loopCheckpoint) & 255) === 0) {
          await yieldAfterStatementIfNeeded(context, yieldState);
        }
      }
      return loopResult;
    }
    case "ReturnStatement":
      return returnSignal(
        statement.argument
          ? await executeExpressionIrAsync(statement.argument, context, lexical)
          : undefined,
      );
    case "ThrowStatement":
      throw createThrowStatementError(await executeExpressionIrAsync(statement.argument, context, lexical));
  }
}

type ReturnSignal = {
  readonly __xmluiReturnSignal: true;
  value: unknown;
};

function returnSignal(value: unknown): ReturnSignal {
  return { __xmluiReturnSignal: true, value };
}

function isReturnSignal(value: unknown): value is ReturnSignal {
  return !!value &&
    typeof value === "object" &&
    (value as { __xmluiReturnSignal?: unknown }).__xmluiReturnSignal === true;
}

function emitThrowStatementError(argumentSource: string): string {
  return `((__xmluiThrown) => __xmluiThrown instanceof Error ? __xmluiThrown : Object.assign(new Error(typeof __xmluiThrown === "string" ? __xmluiThrown : (__xmluiThrown?.message || "Error without message")), { name: "ThrowStatementError", errorObject: __xmluiThrown }))(${argumentSource})`;
}

function createThrowStatementError(errorObject: unknown): Error & { errorObject?: unknown } {
  if (errorObject instanceof Error) {
    return errorObject;
  }
  const message = typeof errorObject === "string"
    ? errorObject
    : (errorObject as { message?: unknown } | null | undefined)?.message || "Error without message";
  return Object.assign(new Error(String(message)), {
    name: "ThrowStatementError",
    errorObject,
  });
}

async function executeEventExpression(
  expression: XmluiScriptIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): Promise<unknown> {
  switch (expression.kind) {
    case "AssignmentExpression":
      return executeAssignmentExpression(expression, context, lexical);
    case "PrefixUpdate":
    case "PostfixUpdate":
      return executeUpdateExpression(expression, context, lexical);
    default:
      return executeExpressionIrAsync(expression, context, lexical);
  }
}

function executeDeleteExpression(
  argument: XmluiScriptIr,
  context: CompiledExpressionContext,
  lexical: Record<string, unknown>,
): boolean {
  if (argument.kind === "MemberRead") {
    const object = executeExpressionIr(argument.object, context, lexical) as Record<PropertyKey, unknown>;
    return delete object[argument.member];
  }
  if (argument.kind === "IndexRead") {
    const object = executeExpressionIr(argument.object, context, lexical) as Record<PropertyKey, unknown>;
    const index = executeExpressionIr(argument.index, context, lexical) as PropertyKey;
    return delete object[index];
  }
  return true;
}

async function executeDeleteExpressionAsync(
  argument: XmluiScriptIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): Promise<boolean> {
  if (argument.kind === "MemberRead") {
    const object = await executeExpressionIrAsync(argument.object, context, lexical) as Record<PropertyKey, unknown>;
    return delete object[argument.member];
  }
  if (argument.kind === "IndexRead") {
    const object = await executeExpressionIrAsync(argument.object, context, lexical) as Record<PropertyKey, unknown>;
    const index = await executeExpressionIrAsync(argument.index, context, lexical) as PropertyKey;
    return delete object[index];
  }
  return true;
}

async function executeAssignmentExpression(
  expression: XmluiAssignmentExpressionIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): Promise<unknown> {
  const target = expression.target;
  const right = await executeExpressionIrAsync(expression.right, context, lexical);
  const next = expression.operator === "="
    ? right
    : executeCompoundAssignment(expression.operator, executeTargetRead(target, context, lexical), right);
  executeTargetWrite(target, next, context, lexical);
  return next;
}

function executeUpdateExpression(
  expression: XmluiPrefixUpdateIr | XmluiPostfixUpdateIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): unknown {
  const current = Number(executeTargetRead(expression.target, context, lexical));
  const next = expression.operator === "--" ? current - 1 : current + 1;
  executeTargetWrite(expression.target, next, context, lexical);
  return expression.kind === "PrefixUpdate" ? next : current;
}

function executeTargetRead(
  target: BoundWriteTarget,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): unknown {
  if (target.kind === "handlerLocal") {
    return lexical[target.name];
  }
  if (target.kind === "member" && target.object) {
    const object = executeWriteTargetObject(target.object, context, lexical) as Record<string, unknown> | null | undefined;
    return object == null ? undefined : object[target.name];
  }
  if (target.kind === "index" && target.object && target.index) {
    const object = executeWriteTargetObject(target.object, context, lexical) as Record<PropertyKey, unknown> | null | undefined;
    const index = executeExpressionIr(target.index, context, lexical) as PropertyKey;
    return object == null ? undefined : object[index];
  }
  if (target.kind === "local") {
    return context.readLocal(target.name);
  }
  if (target.kind === "global") {
    return context.readGlobal(target.name);
  }
  throw new Error(`Cannot execute invalid XMLUI event write target '${target.name}'.`);
}

function executeTargetWrite(
  target: BoundWriteTarget,
  value: unknown,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): void {
  if (target.kind === "handlerLocal") {
    writeLexical(lexical, target.name, value);
    return;
  }
  if (target.kind === "member" && target.object) {
    const object = executeWriteTargetObject(target.object, context, lexical) as Record<string, unknown> | null | undefined;
    if (object == null) {
      throw new Error(`Cannot write XMLUI script member '${target.name}' on null or undefined.`);
    }
    object[target.name] = value;
    return;
  }
  if (target.kind === "index" && target.object && target.index) {
    const object = executeWriteTargetObject(target.object, context, lexical) as Record<PropertyKey, unknown> | null | undefined;
    const index = executeExpressionIr(target.index, context, lexical) as PropertyKey;
    if (object == null) {
      throw new Error("Cannot write XMLUI script index on null or undefined.");
    }
    object[index] = value;
    return;
  }
  if (target.kind === "local") {
    context.writeLocal(target.name, value);
    return;
  }
  if (target.kind === "global") {
    context.writeGlobal(target.name, value);
    return;
  }
  throw new Error(`Cannot execute invalid XMLUI event write target '${target.name}'.`);
}

function executeWriteTargetObject(
  object: XmluiScriptIr,
  context: CompiledEventContext,
  lexical: Record<string, unknown>,
): unknown {
  if (object.kind === "IdentifierRead" && !object.dependency) {
    const lexicalValue = readLexical(lexical, object.name);
    if (lexicalValue.found) {
      return lexicalValue.value;
    }
    const localValue = context.readLocal(object.name);
    if (localValue != null) {
      return localValue;
    }
    const globalValue = context.readGlobal(object.name);
    return globalValue == null ? context.readReference?.(object.name) : globalValue;
  }
  if (object.kind === "MemberRead") {
    const parent = executeWriteTargetObject(object.object, context, lexical) as Record<string, unknown> | null | undefined;
    return parent == null ? undefined : parent[object.member];
  }
  if (object.kind === "IndexRead") {
    const parent = executeWriteTargetObject(object.object, context, lexical) as Record<PropertyKey, unknown> | null | undefined;
    const index = executeExpressionIr(object.index, context, lexical) as PropertyKey;
    return parent == null ? undefined : parent[index];
  }
  return executeExpressionIr(object, context, lexical);
}

function writeLexical(lexical: Record<string, unknown>, name: string, value: unknown): void {
  let current: Record<string, unknown> | null = lexical;
  while (current) {
    if (Object.prototype.hasOwnProperty.call(current, name)) {
      current[name] = value;
      return;
    }
    current = Object.getPrototypeOf(current) as Record<string, unknown> | null;
  }
  lexical[name] = value;
}

function readLexical(
  lexical: Record<string, unknown>,
  name: string,
): { found: true; value: unknown } | { found: false } {
  let current: Record<string, unknown> | null = lexical;
  while (current) {
    if (Object.prototype.hasOwnProperty.call(current, name)) {
      return { found: true, value: current[name] };
    }
    current = Object.getPrototypeOf(current) as Record<string, unknown> | null;
  }
  return { found: false };
}

function executeCompoundAssignment(
  operator: XmluiAssignmentExpressionIr["operator"],
  left: unknown,
  right: unknown,
): unknown {
  switch (operator) {
    case "+=":
      return (left as never) + (right as never);
    case "-=":
      return Number(left) - Number(right);
    case "*=":
      return Number(left) * Number(right);
    case "/=":
      return Number(left) / Number(right);
    case "%=":
      return Number(left) % Number(right);
    case "=":
      return right;
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
      {
        const lexicalValue = readLexical(lexical, name);
        if (lexicalValue.found) {
          return lexicalValue.value;
        }
      }
      return context.readLocal(name);
    case "global":
      {
        const lexicalValue = readLexical(lexical, name);
        if (lexicalValue.found) {
          return lexicalValue.value;
        }
      }
      return context.readGlobal(name) ?? context.readReference?.(name);
    case "context":
      {
        const lexicalValue = readLexical(lexical, name);
        if (lexicalValue.found) {
          return lexicalValue.value;
        }
      }
      return context.readContext?.(name);
    case "reference":
      return context.readReference?.(name);
    case "special":
      if (name === "NaN") {
        return Number.NaN;
      }
      if (name === "Infinity") {
        return Number.POSITIVE_INFINITY;
      }
      return lexical[name];
    case undefined:
      {
        const lexicalValue = readLexical(lexical, name);
        if (lexicalValue.found) {
          return lexicalValue.value;
        }
      }
      {
        const localValue = context.readLocal(name);
        if (localValue != null) {
          return localValue;
        }
        const globalValue = context.readGlobal(name);
        return globalValue == null ? context.readReference?.(name) : globalValue;
      }
    default:
      throw new Error(`Cannot execute unresolved XMLUI identifier '${name}'.`);
  }
}

function collectHandlerLocalNames(statements: readonly XmluiHandlerStatementIr[]): Set<string> {
  const names = new Set<string>();
  const visit = (statement: XmluiHandlerStatementIr) => {
    switch (statement.kind) {
      case "VariableDeclaration":
        for (const declaration of statement.declarations) {
          names.add(declaration.name);
        }
        break;
      case "BlockStatement":
        statement.body.forEach(visit);
        break;
      case "IfStatement":
        visit(statement.consequent);
        if (statement.alternate) {
          visit(statement.alternate);
        }
        break;
      case "WhileStatement":
        visit(statement.body);
        break;
      case "ReturnStatement":
        break;
      case "ThrowStatement":
        break;
      case "ExpressionStatement":
        break;
    }
  };
  statements.forEach(visit);
  return names;
}

function isEventMutationExpression(ir: XmluiScriptIr): boolean {
  switch (ir.kind) {
    case "AssignmentExpression":
    case "PrefixUpdate":
    case "PostfixUpdate":
      return true;
    case "LogicalExpression":
    case "BinaryExpression":
      return isEventMutationExpression(ir.left) || isEventMutationExpression(ir.right);
    case "UnaryExpression":
      return isEventMutationExpression(ir.argument);
    case "ConditionalExpression":
      return isEventMutationExpression(ir.test) ||
        isEventMutationExpression(ir.consequent) ||
        isEventMutationExpression(ir.alternate);
    case "SequenceExpression":
      return ir.expressions.some(isEventMutationExpression);
    case "ArrayExpression":
      return ir.elements.some((element) =>
        isEventMutationExpression(element.kind === "ArraySpreadElement" ? element.argument : element)
      );
    case "ObjectExpression":
      return ir.properties.some((property) =>
        isEventMutationExpression(property.kind === "spread" ? property.argument : property.value)
      );
    case "TemplateLiteralExpression":
      return ir.parts.some((part) => typeof part !== "string" && isEventMutationExpression(part));
    case "CallExpression":
      return ir.args.some(isEventMutationExpression);
    case "MemberRead":
      return isEventMutationExpression(ir.object);
    case "IndexRead":
      return isEventMutationExpression(ir.object) || isEventMutationExpression(ir.index);
    case "ArrowFunctionExpression":
      return isEventMutationExpression(ir.body);
    case "ExpressionStatement":
      return isEventMutationExpression(ir.expression);
    case "VariableDeclaration":
      return ir.declarations.some((declaration) =>
        declaration.init ? isEventMutationExpression(declaration.init) : false
      );
    case "BlockStatement":
      return true;
    case "IfStatement":
    case "WhileStatement":
      return true;
    case "ReturnStatement":
      return ir.argument ? isEventMutationExpression(ir.argument) : false;
    default:
      return false;
  }
}
