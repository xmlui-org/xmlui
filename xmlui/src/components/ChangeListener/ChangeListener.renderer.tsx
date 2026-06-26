import { useEffect, useMemo, useRef } from "react";

import { evaluateExpressionOrText, runEvent } from "../../runtime/rendering/bindings";
import { useEvaluatedProp } from "../../runtime/rendering/props";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const changeListenerRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const hasListenTo = Object.prototype.hasOwnProperty.call(node.props, "listenTo");
  const hasListenToSources = Object.prototype.hasOwnProperty.call(node.props, "listenToSources");
  const listenTo = useEvaluatedProp(node, scope, "listenTo", undefined);
  const listenToSources = useEvaluatedProp(node, scope, "listenToSources", undefined);
  const throttleWaitInMs = Number(useEvaluatedProp(node, scope, "throttleWaitInMs", 0) ?? 0);
  const debounceWaitInMs = Number(useEvaluatedProp(node, scope, "debounceWaitInMs", 0) ?? 0);
  useBindingRevision(node.parsed?.props?.listenTo, scope);
  useBindingRevision(node.parsed?.props?.listenToSources, scope);

  const active = hasListenToSources || hasListenTo;
  const listenedValue = hasListenToSources ? listenToSources : listenTo;
  const previousValueRef = useRef<unknown>(listenedValue);
  const mountedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const lastThrottleRef = useRef(0);
  const latestChangeRef = useRef<unknown>(undefined);
  const warnedAboutDuplicateSourcesRef = useRef(false);

  const emitChange = useMemo(() => {
    return (change: unknown) => {
      const run = () => {
        void runEvent(node.parsed?.events?.didChange, scope, [latestChangeRef.current]);
      };
      latestChangeRef.current = change;
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      if (debounceWaitInMs > 0) {
        timerRef.current = window.setTimeout(run, debounceWaitInMs);
        return;
      }
      if (throttleWaitInMs > 0) {
        const now = Date.now();
        if (now - lastThrottleRef.current >= throttleWaitInMs) {
          lastThrottleRef.current = now;
          run();
        }
        return;
      }
      run();
    };
  }, [debounceWaitInMs, node.parsed?.events?.didChange, scope, throttleWaitInMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasListenTo && hasListenToSources && !warnedAboutDuplicateSourcesRef.current) {
      console.warn(
        "[XMLUI] ChangeListener cannot use both listenTo and listenToSources; listenToSources will be used.",
      );
      warnedAboutDuplicateSourcesRef.current = true;
    }
  }, [hasListenTo, hasListenToSources]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousValueRef.current = cloneForCompare(listenedValue);
      return;
    }
    if (!active) {
      previousValueRef.current = cloneForCompare(listenedValue);
      return;
    }
    const previousValue = previousValueRef.current;
    if (deepEqual(previousValue, listenedValue)) {
      return;
    }
    previousValueRef.current = cloneForCompare(listenedValue);
    emitChange(hasListenToSources
      ? createSourcesChange(previousValue, listenedValue)
      : {
          prevValue: previousValue,
          newValue: listenedValue,
        });
  }, [active, emitChange, hasListenToSources, listenedValue]);

  return null;
};

export function readChangeListenerValue(
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): unknown {
  return evaluateExpressionOrText(
    node.props.listenTo ?? node.props.listenToSources ?? "",
    node.parsed?.props?.listenTo ?? node.parsed?.props?.listenToSources,
    scope,
    "ChangeListener:listenTo",
  );
}

type SourceKey = string | number;

function createSourcesChange(prevValue: unknown, newValue: unknown) {
  const changes: Record<string, { prevValue: unknown; newValue: unknown }> = {};
  const changedSources: SourceKey[] = [];
  for (const source of getSourceKeys(prevValue, newValue)) {
    const previousSourceValue = getSourceValue(prevValue, source);
    const newSourceValue = getSourceValue(newValue, source);
    if (!deepEqual(previousSourceValue, newSourceValue)) {
      changedSources.push(source);
      changes[String(source)] = {
        prevValue: previousSourceValue,
        newValue: newSourceValue,
      };
    }
  }
  return {
    prevValue,
    newValue,
    changedSources,
    changes,
  };
}

function getSourceKeys(prevValue: unknown, newValue: unknown): SourceKey[] {
  if (Array.isArray(prevValue) || Array.isArray(newValue)) {
    const maxLength = Math.max(
      Array.isArray(prevValue) ? prevValue.length : 0,
      Array.isArray(newValue) ? newValue.length : 0,
    );
    return Array.from({ length: maxLength }, (_entry, index) => index);
  }
  if (isRecord(prevValue) || isRecord(newValue)) {
    return Array.from(
      new Set([
        ...Object.keys(isRecord(prevValue) ? prevValue : {}),
        ...Object.keys(isRecord(newValue) ? newValue : {}),
      ]),
    );
  }
  return ["value"];
}

function getSourceValue(value: unknown, key: SourceKey): unknown {
  if (Array.isArray(value) || isRecord(value)) {
    return value[key as keyof typeof value];
  }
  return value;
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function cloneForCompare(value: unknown): unknown {
  try {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
