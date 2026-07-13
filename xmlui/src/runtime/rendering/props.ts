import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

import type { XmluiElement } from "../../compiler/ir";
import {
  COMPONENT_PART_KEY,
  isLayoutPropName,
  looksLikeComponentThemeVariableName,
  parseStyleSelectorKey,
  responsiveBreakpoints,
  resolveResponsiveLayoutStyles,
  resolveLayoutStyle,
  supportedLayoutPropNames,
  type LayoutOrientation,
} from "../../styling";
import type { RuntimeScope } from "../state";
import { evaluateExpressionOrText, dependenciesForBinding } from "./bindings";
import { useBindingRevision } from "./reactive";
import type { RenderContext } from "./types";
import { useThemeRuntime } from "./theme";

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
    if (isLayoutPropName(name) || isResponsiveLayoutPropName(name)) {
      props[name] = useEvaluatedProp(node, scope, name, undefined);
    }
  }
  const themeRuntime = useThemeRuntime();
  const viewportWidth = useViewportWidth();
  return themeRuntime.disableInlineStyle ? {} : resolveActiveLayoutStyle(props, viewportWidth, options);
}

export function flexStyle(
  direction: "row" | "column" | undefined,
  node: XmluiElement,
  scope: RuntimeScope,
): CSSProperties {
  const style = useLayoutStyle(node, scope, {
    orientation: direction === "row" ? "horizontal" : direction === "column" ? "vertical" : undefined,
  });
  if (direction) {
    style.display = "flex";
    style.flexDirection = direction;
  }
  return style;
}

export function useThemeOverrideProps(
  node: XmluiElement,
  scope: RuntimeScope,
): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  for (const name of Object.keys(node.props)) {
    if ((isLayoutPropName(name) && name !== "fontSize" && !looksLikeComponentThemeVariableName(name)) || name === "name") {
      continue;
    }
    variables[name] = useEvaluatedProp(node, scope, name, undefined);
  }
  return variables;
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

function resolveActiveLayoutStyle(
  props: Record<string, unknown>,
  viewportWidth: number | undefined,
  options: { orientation?: LayoutOrientation },
): CSSProperties {
  const responsive = resolveResponsiveLayoutStyles(props, options);
  const componentStyle = responsive[COMPONENT_PART_KEY];
  if (!componentStyle) {
    return resolveLayoutStyle(props, options);
  }

  const style: CSSProperties = { ...componentStyle.base };
  if (viewportWidth !== undefined) {
    for (const [breakpoint, minWidth] of Object.entries(responsiveBreakpoints)) {
      if (viewportWidth >= minWidth) {
        Object.assign(style, componentStyle.breakpoints[breakpoint as keyof typeof responsiveBreakpoints]);
      }
    }
  }
  return style;
}

function isResponsiveLayoutPropName(name: string): boolean {
  if (looksLikeComponentThemeVariableName(name)) {
    return false;
  }
  const selector = parseStyleSelectorKey(name);
  return selector.breakpoint !== undefined &&
    supportedLayoutPropNames.includes(selector.property as never);
}

function useViewportWidth(): number | undefined {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? undefined : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const updateWidth = () => setWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return width;
}
