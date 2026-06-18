import React, { ReactNode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import type {
  MixedTextSegment,
  ParsedEvent,
  ParsedExpression,
  XmluiElement,
  XmluiNode,
  XmluiParsedBindings,
  XmluiText,
} from "../compiler/ir";
import {
  compileXmluiEventHandler,
  compileXmluiExpression,
  type CompiledEventContext,
  type CompiledEventHandler,
  type CompiledExpression,
  type CompiledExpressionContext,
} from "../compiler/scriptSemantics";
import type { XmluiComponentModule, XmluiDocumentInput, XmluiModule } from "./types";

type StateBag = Record<string, unknown>;
type SetStateBag = React.Dispatch<React.SetStateAction<StateBag>>;

type RenderScope = {
  parent?: RenderScope;
  globals: StateBag;
  setGlobals: SetStateBag;
  locals: StateBag;
  setLocals: SetStateBag;
  props: Record<string, unknown>;
};

type RenderContext = {
  components: Record<string, XmluiComponentModule>;
};

const expressionCache = new WeakMap<object, CompiledExpression>();
const eventCache = new WeakMap<ParsedEvent, CompiledEventHandler>();

export function createXmluiModule(
  document: XmluiDocumentInput,
  components: XmluiModule[] = [],
): XmluiModule {
  if (document.kind === "component") {
    return {
      kind: "component",
      name: document.name,
      root: document.root,
    };
  }

  const componentMap: Record<string, XmluiComponentModule> = {};
  for (const component of components) {
    if (component.kind === "component") {
      componentMap[component.name] = component;
    }
  }

  return {
    kind: "app",
    root: document.root,
    components: componentMap,
  };
}

export function renderXmluiApp(module: XmluiModule, container: HTMLElement): void {
  if (module.kind !== "app") {
    throw new Error("renderXmluiApp expected an app module.");
  }

  createRoot(container).render(<XmluiRoot module={module} />);
}

function XmluiRoot({ module }: { module: Extract<XmluiModule, { kind: "app" }> }) {
  const [globals, setGlobals] = useState<StateBag>(() =>
    initializeValues(module.root.globals, module.root.parsed?.globals),
  );
  const [locals, setLocals] = useState<StateBag>(() =>
    initializeValues(module.root.vars, module.root.parsed?.vars),
  );
  const scope = useMemo<RenderScope>(
    () => ({
      globals,
      setGlobals,
      locals,
      setLocals,
      props: {},
    }),
    [globals, locals],
  );
  const context = useMemo<RenderContext>(() => ({ components: module.components }), [module]);

  return <NodeRenderer context={context} node={module.root} scope={scope} />;
}

function NodeRenderer({
  context,
  node,
  scope,
}: {
  context: RenderContext;
  node: XmluiNode;
  scope: RenderScope;
}): ReactNode {
  if (node.kind === "text") {
    return <>{renderText(node, scope)}</>;
  }

  if (Object.keys(node.vars).length > 0 && node.type !== "App") {
    return (
      <ScopedElement context={context} node={node} parentScope={scope} props={scope.props} />
    );
  }

  return renderElement(context, node, scope);
}

function ScopedElement({
  context,
  node,
  parentScope,
  props,
}: {
  context: RenderContext;
  node: XmluiElement;
  parentScope: RenderScope;
  props: Record<string, unknown>;
}) {
  const [locals, setLocals] = useState<StateBag>(() =>
    initializeValues(node.vars, node.parsed?.vars, parentScope, props),
  );
  const scope = useMemo<RenderScope>(
    () => ({
      parent: parentScope,
      globals: parentScope.globals,
      setGlobals: parentScope.setGlobals,
      locals,
      setLocals,
      props,
    }),
    [locals, parentScope, props],
  );

  return <>{renderElement(context, node, scope)}</>;
}

function renderElement(context: RenderContext, node: XmluiElement, scope: RenderScope): ReactNode {
  if (node.type === "App") {
    return renderChildren(context, node.children, scope);
  }

  if (node.type === "H1") {
    return <h1>{renderChildren(context, node.children, scope)}</h1>;
  }

  if (node.type === "Button") {
    const label = node.props.label
      ? evaluateExpressionOrText(node.props.label, node.parsed?.props?.label, scope)
      : undefined;
    return (
      <button type="button" onClick={() => runEvent(node.parsed?.events?.click, scope)}>
        {node.children.length > 0 ? renderChildren(context, node.children, scope) : String(label ?? "")}
      </button>
    );
  }

  const component = context.components[node.type];
  if (component) {
    return <ComponentInstance component={component} context={context} node={node} scope={scope} />;
  }

  throw new Error(`Unknown XMLUI component: ${node.type}`);
}

function ComponentInstance({
  component,
  context,
  node,
  scope,
}: {
  component: XmluiComponentModule;
  context: RenderContext;
  node: XmluiElement;
  scope: RenderScope;
}) {
  const props = useMemo(
    () => evaluateProps(node.props, node.parsed?.props, scope),
    [node.props, node.parsed?.props, scope],
  );
  const [locals, setLocals] = useState<StateBag>(() =>
    initializeValues(component.root.vars, component.root.parsed?.vars, scope, props),
  );
  const componentScope = useMemo<RenderScope>(
    () => ({
      parent: scope,
      globals: scope.globals,
      setGlobals: scope.setGlobals,
      locals,
      setLocals,
      props,
    }),
    [locals, props, scope],
  );

  return <>{renderChildren(context, component.root.children, componentScope)}</>;
}

function renderChildren(context: RenderContext, children: XmluiNode[], scope: RenderScope): ReactNode {
  return children.map((child, index) => (
    <React.Fragment key={index}>
      <NodeRenderer context={context} node={child} scope={scope} />
    </React.Fragment>
  ));
}

function renderText(node: XmluiText, scope: RenderScope): string {
  return renderMixedText(node.segments, node.value, scope);
}

function evaluateProps(
  props: Record<string, string>,
  parsed: XmluiParsedBindings["props"] | undefined,
  scope: RenderScope,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      evaluateExpressionOrText(value, parsed?.[key], scope),
    ]),
  );
}

function initializeValues(
  expressions: Record<string, string>,
  parsed?: XmluiParsedBindings["vars"] | XmluiParsedBindings["globals"],
  parentScope?: RenderScope,
  props: Record<string, unknown> = {},
): StateBag {
  const result: StateBag = {};
  const scope = parentScope
    ? {
        ...parentScope,
        locals: result,
        setLocals: (updater: React.SetStateAction<StateBag>) => {
          const next = typeof updater === "function" ? updater(result) : updater;
          Object.assign(result, next);
        },
        props,
      }
    : undefined;

  for (const [key, value] of Object.entries(expressions)) {
    result[key] = evaluateExpressionOrText(value, parsed?.[key], scope);
  }
  return result;
}

function evaluateExpressionOrText(
  value: string,
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  scope: RenderScope | undefined,
): unknown {
  if (Array.isArray(parsed)) {
    return renderMixedText(parsed, value, scope);
  }
  if (parsed?.ir) {
    return executeExpression(parsed, scope);
  }
  const expression = unwrapExpression(value);
  if (expression) {
    return literalInitialValue(value);
  }
  return value;
}

function renderMixedText(
  segments: MixedTextSegment[] | undefined,
  fallback: string,
  scope: RenderScope | undefined,
): string {
  if (!segments) {
    return fallback;
  }
  return segments
    .map((segment) =>
      segment.kind === "literal" ? segment.value : stringify(executeExpression(segment, scope)),
    )
    .join("");
}

function executeExpression(
  expression: ParsedExpression | Extract<MixedTextSegment, { kind: "expression" }>,
  scope: RenderScope | undefined,
): unknown {
  if (!expression.ir) {
    throw new Error(`XMLUI expression was not compiled: ${expression.source}`);
  }
  let compiled = expressionCache.get(expression);
  if (!compiled) {
    compiled = compileXmluiExpression(expression.ir, expression.dependencies ?? []);
    expressionCache.set(expression, compiled);
  }
  return compiled.execute(createExpressionContext(scope));
}

function runEvent(event: ParsedEvent | undefined, scope: RenderScope): void {
  if (!event) {
    return;
  }
  if (!event.ir) {
    throw new Error(`XMLUI event handler was not compiled: ${event.source}`);
  }
  let compiled = eventCache.get(event);
  if (!compiled) {
    compiled = compileXmluiEventHandler(event.ir, event.dependencies ?? [], event.writes ?? []);
    eventCache.set(event, compiled);
  }
  compiled.execute(createEventContext(scope));
}

function readName(scope: RenderScope, name: string): unknown {
  if (Object.prototype.hasOwnProperty.call(scope.locals, name)) {
    return scope.locals[name];
  }
  if (scope.parent) {
    const parentValue = readName(scope.parent, name);
    if (parentValue !== undefined || hasName(scope.parent, name)) {
      return parentValue;
    }
  }
  return scope.globals[name];
}

function writeName(scope: RenderScope, name: string, value: unknown): void {
  if (Object.prototype.hasOwnProperty.call(scope.locals, name)) {
    scope.setLocals((current) => ({ ...current, [name]: value }));
    return;
  }
  if (scope.parent && hasLocalName(scope.parent, name)) {
    writeName(scope.parent, name, value);
    return;
  }
  if (Object.prototype.hasOwnProperty.call(scope.globals, name)) {
    scope.setGlobals((current) => ({ ...current, [name]: value }));
    return;
  }
  throw new Error(`Cannot assign to unknown XMLUI variable "${name}".`);
}

function createExpressionContext(scope: RenderScope | undefined): CompiledExpressionContext {
  return {
    props: scope?.props,
    readLocal: (name) => {
      if (!scope) {
        return undefined;
      }
      return readName(scope, name);
    },
    readGlobal: (name) => scope?.globals[name],
  };
}

function createEventContext(scope: RenderScope): CompiledEventContext {
  return {
    ...createExpressionContext(scope),
    writeLocal: (name, value) => writeName(scope, name, value),
    writeGlobal: (name, value) => scope.setGlobals((current) => ({ ...current, [name]: value })),
  };
}

function hasName(scope: RenderScope, name: string): boolean {
  return hasLocalName(scope, name) || Object.prototype.hasOwnProperty.call(scope.globals, name);
}

function hasLocalName(scope: RenderScope, name: string): boolean {
  if (Object.prototype.hasOwnProperty.call(scope.locals, name)) {
    return true;
  }
  return scope.parent ? hasLocalName(scope.parent, name) : false;
}

function unwrapExpression(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.slice(1, -1).trim();
  }
  return undefined;
}

function literalInitialValue(value: string): unknown {
  const expression = unwrapExpression(value);
  if (!expression) {
    return value;
  }
  const number = Number(expression);
  if (!Number.isNaN(number)) {
    return number;
  }
  if (
    (expression.startsWith(`"`) && expression.endsWith(`"`)) ||
    (expression.startsWith(`'`) && expression.endsWith(`'`))
  ) {
    return expression.slice(1, -1);
  }
  throw new Error(`XMLUI expression was not compiled: ${expression}`);
}

function stringify(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

export type { XmluiModule } from "./types";
