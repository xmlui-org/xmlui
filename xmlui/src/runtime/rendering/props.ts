import type { CSSProperties, ReactNode } from "react";

import type { XmluiElement } from "../../compiler/ir";
import {
  isLayoutPropName,
  resolveLayoutStyle,
  type LayoutOrientation,
} from "../../styling";
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

export function useLayoutStyle(
  node: XmluiElement,
  scope: RuntimeScope,
  options: { orientation?: LayoutOrientation } = {},
): CSSProperties {
  const props: Record<string, unknown> = {};
  for (const name of Object.keys(node.props)) {
    if (isLayoutPropName(name)) {
      props[name] = useEvaluatedProp(node, scope, name, undefined);
    }
  }
  return resolveLayoutStyle(props, options);
}

export function flexStyle(
  direction: "row" | "column" | undefined,
  node: XmluiElement,
  scope: RuntimeScope,
): CSSProperties {
  return useLayoutStyle(node, scope, {
    orientation: direction === "row" ? "horizontal" : direction === "column" ? "vertical" : undefined,
  });
}

export function useThemeOverrideProps(
  node: XmluiElement,
  scope: RuntimeScope,
): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  for (const name of Object.keys(node.props)) {
    if ((isLayoutPropName(name) && name !== "fontSize" && !looksLikeComponentThemeVariable(name)) || name === "name") {
      continue;
    }
    variables[name] = useEvaluatedProp(node, scope, name, undefined);
  }
  return variables;
}

function looksLikeComponentThemeVariable(name: string): boolean {
  return /-[A-Z][A-Za-z0-9]*(?:-|$)/.test(name);
}

export function partAttrs(component: string, part = "root"): Record<string, string> {
  return {
    "data-xmlui-component": component,
    "data-xmlui-part": part,
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
