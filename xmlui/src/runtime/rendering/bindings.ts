import type {
  MixedTextSegment,
  ParsedEvent,
  ParsedExpression,
  XmluiParsedBindings,
} from "../../compiler/ir";
import {
  compileXmluiEventHandler,
  compileXmluiExpression,
  type BoundDependency,
  type BoundWriteTarget,
  type CompiledEventHandler,
  type CompiledExpression,
  type XmluiScriptIr,
} from "../../compiler/scriptSemantics";
import {
  createEventContext,
  createExpressionContext,
  resolveLocalOwner,
  type RuntimeScope,
} from "../state";
import type { NormalizedRuntimeDependency } from "./types";

type ExpressionLike = ParsedExpression | Extract<MixedTextSegment, { kind: "expression" }>;

const expressionCache = new WeakMap<object, CompiledExpression>();
const eventCache = new WeakMap<ParsedEvent, CompiledEventHandler>();
const eventSchedules = new WeakMap<ParsedEvent, EventScheduleState>();

const bindingCounters = new Map<string, number>();

type EventScheduleState = {
  running: boolean;
  tail: Promise<unknown>;
};

export function normalizeDependencies(
  dependencies: BoundDependency[] | undefined,
  scope: RuntimeScope | undefined,
): NormalizedRuntimeDependency[] {
  if (!dependencies || !scope) {
    return [];
  }
  const normalized: NormalizedRuntimeDependency[] = [];
  const seen = new Set<string>();
  for (const dependency of dependencies) {
    if (dependency.kind === "local") {
      const ownerId = resolveLocalOwner(scope, dependency.name);
      if (!ownerId) {
        continue;
      }
      const key = `local:${ownerId}:${dependency.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push({ kind: "local", ownerId, name: dependency.name, source: dependency });
      }
    } else if (dependency.kind === "global") {
      const key = `global:${dependency.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push({ kind: "global", name: dependency.name, source: dependency });
      }
    } else if (dependency.kind === "props") {
      const name = dependency.path[0] ?? dependency.name;
      const key = `prop:${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push({ kind: "prop", name, source: dependency });
      }
    } else if (dependency.kind === "reference") {
      const key = `reference:${dependency.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push({ kind: "reference", name: dependency.name, source: dependency });
      }
    } else if (dependency.kind === "context" && isRouteContextName(dependency.name)) {
      const key = `route:${dependency.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push({ kind: "route", name: dependency.name, source: dependency });
      }
    }
  }
  return normalized;
}

export function stateDependencies(
  dependencies: NormalizedRuntimeDependency[],
): Array<{ kind: "local"; ownerId: string; name: string } | { kind: "global"; name: string }> {
  return dependencies.filter(
    (
      dependency,
    ): dependency is
      | { kind: "local"; ownerId: string; name: string; source: BoundDependency }
      | { kind: "global"; name: string; source: BoundDependency } =>
      dependency.kind === "local" || dependency.kind === "global",
  );
}

function isRouteContextName(name: string): boolean {
  return name === "pathname" ||
    name === "$pathname" ||
    name === "routeParams" ||
    name === "$routeParams" ||
    name === "queryParams" ||
    name === "$queryParams" ||
    name === "queryString" ||
    name === "$queryString";
}

export function dependenciesForBinding(
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
): BoundDependency[] {
  if (!parsed) {
    return [];
  }
  if (Array.isArray(parsed)) {
    return parsed.flatMap((segment) => (segment.kind === "expression" ? segment.dependencies ?? [] : []));
  }
  return parsed.dependencies ?? [];
}

export function evaluateProps(
  props: Record<string, string>,
  parsed: XmluiParsedBindings["props"] | undefined,
  scope: RuntimeScope,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => {
      try {
        return [
          key,
          evaluateExpressionOrText(value, parsed?.[key], scope, `prop:${key}`),
        ];
      } catch {
        return [key, value];
      }
    }),
  );
}

export function evaluateExpressionOrText(
  value: string,
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  scope: RuntimeScope | undefined,
  counterKey?: string,
): unknown {
  recordBindingEvaluation(counterKey);
  if (Array.isArray(parsed)) {
    return renderMixedText(parsed, value, scope, counterKey);
  }
  if (parsed?.evaluate || parsed?.ir) {
    return executeExpression(parsed, scope);
  }
  const expression = unwrapExpression(value);
  if (expression) {
    return literalInitialValue(value);
  }
  return value;
}

export function renderMixedText(
  segments: MixedTextSegment[] | undefined,
  fallback: string,
  scope: RuntimeScope | undefined,
  counterKey?: string,
): string {
  recordBindingEvaluation(counterKey ? `${counterKey}:mixed` : undefined);
  if (!segments) {
    return decodeXmlEntities(fallback);
  }
  return segments
    .map((segment, index) =>
      segment.kind === "literal"
        ? decodeXmlEntities(segment.value)
        : stringify(executeExpression(segment, scope, counterKey ? `${counterKey}:${index}` : undefined)),
    )
    .join("");
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

export function executeExpression(
  expression: ExpressionLike,
  scope: RuntimeScope | undefined,
  counterKey?: string,
): unknown {
  recordBindingEvaluation(counterKey);
  const context = createExpressionContext(scope);
  if (expression.evaluate) {
    return expression.evaluate(context);
  }
  if (!expression.ir) {
    throw new Error(`XMLUI expression was not compiled: ${expression.source}`);
  }
  let compiled = expressionCache.get(expression);
  if (!compiled) {
    compiled = compileXmluiExpression(expression.ir, expression.dependencies ?? []);
    expressionCache.set(expression, compiled);
  }
  return compiled.execute(context);
}

export function runEvent(event: ParsedEvent | undefined, scope: RuntimeScope, args: unknown[] = []): Promise<unknown> {
  if (!event) {
    return Promise.resolve();
  }
  return scheduleEvent(event, () => executeEvent(event, scope, args));
}

function executeEvent(event: ParsedEvent, scope: RuntimeScope, args: unknown[]): Promise<unknown> {
  const context = createEventContext(scope);
  const completeEvent = async (promise: Promise<unknown>) => {
    const result = await promise;
    invalidateMutatedState(event, scope);
    return result;
  };
  const arrow = event.ir?.body.length === 1 &&
    event.ir.body[0].kind === "ExpressionStatement" &&
    event.ir.body[0].expression.kind === "ArrowFunctionExpression"
      ? event.ir.body[0].expression
      : undefined;
  if (arrow) {
    const fn = compileXmluiExpression(arrow, event.dependencies ?? []).execute(context);
    if (typeof fn === "function") {
      return completeEvent(Promise.resolve(fn(...args)));
    }
  }
  if (event.execute && !hasNestedWrites(event)) {
    return completeEvent(
      Promise.resolve(event.execute(context)).then((result) =>
        typeof result === "function"
          ? (result as (...args: unknown[]) => unknown | Promise<unknown>)(...args)
          : result
      ),
    );
  }
  if (!event.ir) {
    throw new Error(`XMLUI event handler was not compiled: ${event.source}`);
  }
  let compiled = eventCache.get(event);
  if (!compiled) {
    compiled = compileXmluiEventHandler(event.ir, event.dependencies ?? [], event.writes ?? []);
    eventCache.set(event, compiled);
  }
  return completeEvent(compiled.execute(context));
}

function hasNestedWrites(event: ParsedEvent): boolean {
  return (event.writes ?? []).some((write) => write.kind === "member" || write.kind === "index");
}

function invalidateMutatedState(event: ParsedEvent, scope: RuntimeScope): void {
  for (const write of event.writes ?? []) {
    const invalidatedRoot = invalidationRoot(write);
    if (invalidatedRoot?.kind === "global" || (invalidatedRoot?.kind === "unknown" && scope.store.hasGlobal(invalidatedRoot.name))) {
      scope.store.invalidateGlobal(invalidatedRoot.name);
    } else if (invalidatedRoot?.kind === "local" || invalidatedRoot?.kind === "unknown") {
      const ownerId = resolveLocalOwner(scope, invalidatedRoot.name);
      if (ownerId) {
        scope.store.invalidateLocal(ownerId, invalidatedRoot.name);
      }
    } else if (write.operator !== "mutate") {
      continue;
    } else if (write.kind === "global") {
      scope.store.invalidateGlobal(write.name);
    } else if (write.kind === "local") {
      const ownerId = resolveLocalOwner(scope, write.name);
      if (ownerId) {
        scope.store.invalidateLocal(ownerId, write.name);
      }
    }
  }
}

type InvalidationRoot =
  | BoundDependency
  | {
      kind: "unknown";
      name: string;
    };

function invalidationRoot(write: BoundWriteTarget): InvalidationRoot | undefined {
  if ((write.kind === "member" || write.kind === "index") && write.object) {
    return rootDependency(write.object) ?? rootIdentifier(write.object);
  }
  return undefined;
}

function rootDependency(expression: XmluiScriptIr): BoundDependency | undefined {
  if (expression.kind === "IdentifierRead") {
    return expression.dependency;
  }
  if (expression.kind === "MemberRead" || expression.kind === "IndexRead") {
    return rootDependency(expression.object);
  }
  return undefined;
}

function rootIdentifier(expression: XmluiScriptIr): InvalidationRoot | undefined {
  if (expression.kind === "IdentifierRead") {
    return { kind: "unknown", name: expression.name };
  }
  if (expression.kind === "MemberRead" || expression.kind === "IndexRead") {
    return rootIdentifier(expression.object);
  }
  return undefined;
}

function scheduleEvent(event: ParsedEvent, execute: () => Promise<unknown>): Promise<unknown> {
  const policy = event.options?.schedulingPolicy ?? event.ir?.options.schedulingPolicy ?? "parallel";
  if (policy === "parallel") {
    return execute();
  }

  const state = eventSchedules.get(event) ?? { running: false, tail: Promise.resolve() };
  eventSchedules.set(event, state);

  if (policy === "drop-while-running") {
    if (state.running) {
      return Promise.resolve();
    }
    state.running = true;
    const running = execute();
    return running.finally(() => {
      state.running = false;
    });
  }

  const next = state.tail.catch(() => undefined).then(execute);
  state.tail = next.catch(() => undefined);
  return next;
}

export function resetBindingEvaluationCounters(): void {
  bindingCounters.clear();
}

export function getBindingEvaluationCount(key: string): number {
  return bindingCounters.get(key) ?? 0;
}

function recordBindingEvaluation(key: string | undefined): void {
  if (!key) {
    return;
  }
  bindingCounters.set(key, (bindingCounters.get(key) ?? 0) + 1);
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
