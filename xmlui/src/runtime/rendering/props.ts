import type { CSSProperties, ReactNode } from "react";

import type { XmluiElement } from "../../compiler/ir";
import type { RuntimeScope } from "../state";
import { evaluateExpressionOrText, dependenciesForBinding } from "./bindings";
import { useBindingRevision } from "./reactive";
import type { RenderContext } from "./types";

export function useEvaluatedProp(
  node: XmluiElement,
  scope: RuntimeScope,
  name: string,
  fallback?: unknown,
): unknown {
  const binding = node.parsed?.props?.[name];
  useBindingRevision(binding, scope);
  if (!Object.prototype.hasOwnProperty.call(node.props, name)) {
    return fallback;
  }
  return evaluateExpressionOrText(node.props[name], binding, scope, `${node.type}:${name}`);
}

export function useStringProp(
  node: XmluiElement,
  scope: RuntimeScope,
  name: string,
  fallback = "",
): string {
  const value = useEvaluatedProp(node, scope, name, fallback);
  return value == null ? fallback : String(value);
}

export function useBooleanProp(
  node: XmluiElement,
  scope: RuntimeScope,
  name: string,
  fallback = false,
): boolean {
  const value = useEvaluatedProp(node, scope, name, fallback);
  return coerceBoolean(value, fallback);
}

export function useChildrenRevision(node: XmluiElement, scope: RuntimeScope): void {
  useBindingRevision(
    node.children.flatMap((child) => child.kind === "text" ? child.segments ?? [] : []),
    scope,
  );
}

export function renderValueOrChildren(
  context: RenderContext,
  node: XmluiElement,
  scope: RuntimeScope,
  value: unknown,
): ReactNode {
  return value === undefined ? context.renderChildren(node.children, scope) : String(value);
}

export function flexStyle(
  direction: "row" | "column" | undefined,
  node: XmluiElement,
  scope: RuntimeScope,
): CSSProperties {
  return {
    display: direction ? "flex" : undefined,
    flexDirection: direction,
    gap: useStringProp(node, scope, "gap", ""),
    width: normalizeSize(useEvaluatedProp(node, scope, "width", undefined)),
    height: normalizeSize(useEvaluatedProp(node, scope, "height", undefined)),
    padding: normalizeSize(useEvaluatedProp(node, scope, "padding", undefined)),
    justifyContent: alignment(useStringProp(node, scope, "horizontalAlignment", "")),
    alignItems: alignment(useStringProp(node, scope, "verticalAlignment", "")),
  };
}

export function propDependencies(node: XmluiElement, name: string) {
  return dependenciesForBinding(node.parsed?.props?.[name]);
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }
  return value == null ? fallback : Boolean(value);
}

function normalizeSize(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (value === "*") {
    return "1 1 0";
  }
  return typeof value === "number" ? `${value}px` : String(value);
}

function alignment(value: string): CSSProperties["alignItems"] {
  switch (value) {
    case "center":
    case "middle":
      return "center";
    case "end":
    case "right":
    case "bottom":
      return "flex-end";
    case "space-between":
      return "space-between";
    case "stretch":
      return "stretch";
    case "start":
    case "left":
    case "top":
      return "flex-start";
    default:
      return undefined;
  }
}

