import type {
  MixedTextSegment,
  ParsedExpression,
  XmluiParsedBindings,
} from "../../compiler/ir";
import type { BoundDependency } from "../../compiler/scriptSemantics";
import { resolveLocalOwner, type RuntimeScope } from "./scope";
import type { RuntimeDependencyKey, StateBag, StateOwnerId, StateSlotKind } from "./types";

export type RuntimeBindingEvaluator = (
  value: string,
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  scope: RuntimeScope | undefined,
) => unknown;

export function initializeStateValues(
  expressions: Record<string, string>,
  parsed: XmluiParsedBindings["vars"] | XmluiParsedBindings["globals"] | undefined,
  scope: RuntimeScope | undefined,
  evaluate: RuntimeBindingEvaluator,
): StateBag {
  const result: StateBag = {};
  for (const [key, value] of Object.entries(expressions)) {
    result[key] = evaluate(value, parsed?.[key], scope);
  }
  return result;
}

export function initializeStateValuesIntoStore({
  kind,
  ownerId,
  expressions,
  parsed,
  scope,
  evaluate,
}: {
  kind: StateSlotKind;
  ownerId?: StateOwnerId;
  expressions: Record<string, string>;
  parsed: XmluiParsedBindings["vars"] | XmluiParsedBindings["globals"] | undefined;
  scope: RuntimeScope;
  evaluate: RuntimeBindingEvaluator;
}): StateBag {
  const result: StateBag = {};
  const order = orderStateInitializers(kind, expressions, parsed);

  for (const name of order) {
    const value = evaluate(expressions[name], parsed?.[name], scope);
    result[name] = value;
    if (kind === "global") {
      scope.store.setInitialGlobalValue(name, value);
    } else {
      if (!ownerId) {
        throw new Error(`Local XMLUI state slot "${name}" requires an owner ID.`);
      }
      scope.store.setInitialLocalValue(ownerId, name, value);
    }
  }

  for (const name of Object.keys(expressions)) {
    const parsedValue = parsed?.[name];
    const dependencies = runtimeDependenciesForBinding(parsedValue, scope);
    scope.store.registerReactiveVariable({
      slot: kind === "global" ? { kind, name } : { kind, ownerId, name },
      mode: dependencies.length > 0 ? "derived" : "source",
      dependencies,
      evaluate: () => evaluate(expressions[name], parsedValue, scope),
    });
  }

  return result;
}

function orderStateInitializers(
  kind: StateSlotKind,
  expressions: Record<string, string>,
  parsed: XmluiParsedBindings["vars"] | XmluiParsedBindings["globals"] | undefined,
): string[] {
  const names = new Set(Object.keys(expressions));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: string[] = [];

  for (const name of names) {
    visit(name);
  }
  return ordered;

  function visit(name: string): void {
    if (visited.has(name)) {
      return;
    }
    if (visiting.has(name)) {
      throw new Error(`Reactive XMLUI variable cycle detected at '${name}'.`);
    }
    visiting.add(name);
    for (const dependency of dependenciesInSameInitializerBucket(kind, parsed?.[name], names)) {
      visit(dependency);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(name);
  }
}

function dependenciesInSameInitializerBucket(
  kind: StateSlotKind,
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  names: Set<string>,
): string[] {
  return bindingDependencies(parsed)
    .filter((dependency) => dependency.kind === kind && names.has(dependency.name))
    .map((dependency) => dependency.name);
}

export function runtimeDependenciesForBinding(
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  scope: RuntimeScope,
): RuntimeDependencyKey[] {
  const dependencies: RuntimeDependencyKey[] = [];
  const seen = new Set<string>();
  for (const dependency of bindingDependencies(parsed)) {
    let runtimeDependency: RuntimeDependencyKey | undefined;
    if (dependency.kind === "local") {
      const ownerId = resolveLocalOwner(scope, dependency.name) ?? scope.localOwnerId;
      if (ownerId) {
        runtimeDependency = { kind: "local", ownerId, name: dependency.name };
      }
    } else if (dependency.kind === "global") {
      runtimeDependency = { kind: "global", name: dependency.name };
    } else if (dependency.kind === "props") {
      runtimeDependency = {
        kind: "prop",
        ownerId: scope.localOwnerId,
        name: dependency.path[0] ?? dependency.name,
      };
    }
    if (!runtimeDependency) {
      continue;
    }
    const key = runtimeDependency.kind === "prop"
      ? `prop:${runtimeDependency.ownerId ?? ""}:${runtimeDependency.name}`
      : `${runtimeDependency.kind}:${runtimeDependency.ownerId ?? ""}:${runtimeDependency.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      dependencies.push(runtimeDependency);
    }
  }
  return dependencies;
}

function bindingDependencies(
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
