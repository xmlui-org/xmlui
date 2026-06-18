import { useMemo, useSyncExternalStore } from "react";

import type { BoundDependency } from "../../compiler/scriptSemantics";
import type { MixedTextSegment, ParsedExpression } from "../../compiler/ir";
import type { RuntimeScope } from "../state";
import { normalizeDependencies, stateDependencies } from "./bindings";

export function useBindingRevision(
  parsedOrDependencies: ParsedExpression | MixedTextSegment[] | BoundDependency[] | undefined,
  scope: RuntimeScope,
): number {
  const hasExplicitMetadata = parsedOrDependencies !== undefined;
  const rawDependencies = Array.isArray(parsedOrDependencies)
    ? isDependencyArray(parsedOrDependencies)
      ? parsedOrDependencies
      : parsedOrDependencies.flatMap((segment) =>
          segment.kind === "expression" ? segment.dependencies ?? [] : [],
        )
    : parsedOrDependencies?.dependencies ?? [];
  const dependencies = useMemo(
    () => stateDependencies(normalizeDependencies(rawDependencies, scope)),
    [rawDependencies, scope],
  );

  return useSyncExternalStore(
    (listener) => {
      if (dependencies.length === 0) {
        return hasExplicitMetadata ? () => {} : scope.store.subscribe(listener);
      }
      const unsubscribers = dependencies.map((dependency) =>
        scope.store.subscribeToSlot(dependency, listener),
      );
      return () => {
        for (const unsubscribe of unsubscribers) {
          unsubscribe();
        }
      };
    },
    () => (dependencies.length === 0 && hasExplicitMetadata ? 0 : scope.store.getSnapshot()),
    () => (dependencies.length === 0 && hasExplicitMetadata ? 0 : scope.store.getSnapshot()),
  );
}

function isDependencyArray(value: MixedTextSegment[] | BoundDependency[]): value is BoundDependency[] {
  return value.length === 0 || "path" in value[0];
}
