import React, { useEffect, useState, type ReactNode } from "react";

import type { XmluiNode, XmluiText } from "../../compiler/ir";
import { builtInComponentRenderers } from "../../component-core";
import { responsiveBreakpoints } from "../../styling";
import type { RuntimeScope } from "../state";
import { evaluateExpressionOrText, renderMixedText } from "./bindings";
import { ComponentInstance, ScopedElement } from "./components";
import { ExtensionComponentInstance } from "./extensionComponent";
import { useBindingRevision } from "./reactive";
import type { RenderContext } from "./types";
import { XmluiRenderError } from "./types";

export function createRenderContext(
  components: RenderContext["components"],
  extensionRenderers: RenderContext["extensionRenderers"] = {},
): RenderContext {
  const context: RenderContext = {
    components,
    extensionRenderers,
    renderElement: (node, scope) => renderElement(context, node, scope),
    renderChildren: (children, scope) => renderChildren(context, children, scope),
    withComponents: (childComponents) =>
      createRenderContext(
        { ...components, ...childComponents },
        extensionRenderers,
      ),
  };
  return context;
}

export function XmluiNodeRenderer({
  context,
  node,
  scope,
}: {
  context: RenderContext;
  node: XmluiNode;
  scope: RuntimeScope;
}): ReactNode {
  if (node.kind === "text") {
    return <XmluiTextRenderer node={node} scope={scope} />;
  }
  if (hasConditionalProps(node.props)) {
    return <ConditionalElementRenderer context={context} node={node} scope={scope} />;
  }

  if (Object.keys(node.vars).length > 0 && node.type !== "App") {
    return <ScopedElement context={context} node={node} parentScope={scope} props={scope.props} />;
  }

  return renderElement(context, node, scope);
}

function ConditionalElementRenderer({
  context,
  node,
  scope,
}: {
  context: RenderContext;
  node: Extract<XmluiNode, { kind: "element" }>;
  scope: RuntimeScope;
}) {
  const binding = node.parsed?.props?.when;
  useBindingRevision(binding, scope);
  for (const name of responsiveWhenPropNames) {
    useBindingRevision(node.parsed?.props?.[name], scope);
  }
  const breakpoint = useCurrentBreakpoint();
  const visible = resolveResponsiveWhen(node, scope, breakpoint);
  if (!visible) {
    return null;
  }
  return <>{renderElement(context, node, scope)}</>;
}

function renderElement(context: RenderContext, node: Extract<XmluiNode, { kind: "element" }>, scope: RuntimeScope) {
  const renderer = builtInComponentRenderers[node.type];
  if (renderer) {
    const BuiltInRenderer = renderer;
    return <BuiltInRenderer context={context} node={node} scope={scope} />;
  }

  const component = context.components[node.type];
  if (component) {
    return <ComponentInstance component={component} context={context} node={node} scope={scope} />;
  }

  const extensionRenderer = context.extensionRenderers[node.type];
  if (extensionRenderer) {
    return <ExtensionComponentInstance renderer={extensionRenderer} context={context} node={node} scope={scope} />;
  }

  throw new XmluiRenderError(`Unknown XMLUI component: ${node.type}`, node);
}

export function renderChildren(context: RenderContext, children: XmluiNode[], scope: RuntimeScope): ReactNode {
  return children.map((child, index) => (
    <React.Fragment key={index}>
      <XmluiNodeRenderer context={context} node={child} scope={scope} />
    </React.Fragment>
  ));
}

function XmluiTextRenderer({ node, scope }: { node: XmluiText; scope: RuntimeScope }) {
  useBindingRevision(node.segments, scope);
  return <>{renderMixedText(node.segments, node.value, scope, `text:${node.range.start}:${node.range.end}`)}</>;
}

const responsiveWhenPropNames = [
  "when-xs",
  "when-sm",
  "when-md",
  "when-lg",
  "when-xl",
  "when-xxl",
] as const;

const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

type BreakpointName = (typeof breakpointOrder)[number];
type ResponsiveWhenPropName = (typeof responsiveWhenPropNames)[number];

function hasConditionalProps(props: Record<string, string>): boolean {
  return Object.prototype.hasOwnProperty.call(props, "when") ||
    responsiveWhenPropNames.some((name) => Object.prototype.hasOwnProperty.call(props, name));
}

function resolveResponsiveWhen(
  node: Extract<XmluiNode, { kind: "element" }>,
  scope: RuntimeScope,
  breakpoint: BreakpointName,
): boolean {
  const responsiveValues = Object.fromEntries(
    responsiveWhenPropNames
      .filter((name) => Object.prototype.hasOwnProperty.call(node.props, name))
      .map((name) => [propNameToBreakpoint(name), evaluateWhenValue(node, scope, name)]),
  ) as Partial<Record<BreakpointName, boolean>>;

  if (Object.keys(responsiveValues).length === 0) {
    return evaluateWhenValue(node, scope, "when") ?? true;
  }

  const currentIndex = breakpointOrder.indexOf(breakpoint);
  for (let index = currentIndex; index >= 0; index -= 1) {
    const value = responsiveValues[breakpointOrder[index]];
    if (value !== undefined) {
      return value;
    }
  }

  const baseValue = Object.prototype.hasOwnProperty.call(node.props, "when")
    ? evaluateWhenValue(node, scope, "when")
    : undefined;
  if (baseValue !== undefined) {
    return baseValue;
  }

  const firstResponsiveValue = breakpointOrder
    .map((name) => responsiveValues[name])
    .find((value) => value !== undefined);
  return firstResponsiveValue === undefined ? true : !firstResponsiveValue;
}

function evaluateWhenValue(
  node: Extract<XmluiNode, { kind: "element" }>,
  scope: RuntimeScope,
  name: "when" | ResponsiveWhenPropName,
): boolean | undefined {
  if (!Object.prototype.hasOwnProperty.call(node.props, name)) {
    return undefined;
  }
  const value = evaluateExpressionOrText(
    node.props[name],
    node.parsed?.props?.[name],
    scope,
    `${node.type}:${name}`,
  );
  return coerceWhenBoolean(value);
}

function coerceWhenBoolean(value: unknown): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "false") {
      return false;
    }
    if (normalized === "true") {
      return true;
    }
  }
  return Boolean(value);
}

function propNameToBreakpoint(name: ResponsiveWhenPropName): BreakpointName {
  return name.slice("when-".length) as BreakpointName;
}

function useCurrentBreakpoint(): BreakpointName {
  const [breakpoint, setBreakpoint] = useState(currentBreakpoint);
  useEffect(() => {
    const update = () => setBreakpoint(currentBreakpoint());
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, []);
  return breakpoint;
}

function currentBreakpoint(): BreakpointName {
  if (typeof window === "undefined") {
    return "xl";
  }
  const width = window.innerWidth;
  if (width >= responsiveBreakpoints.xxl) {
    return "xxl";
  }
  if (width >= responsiveBreakpoints.xl) {
    return "xl";
  }
  if (width >= responsiveBreakpoints.lg) {
    return "lg";
  }
  if (width >= responsiveBreakpoints.md) {
    return "md";
  }
  if (width >= responsiveBreakpoints.sm) {
    return "sm";
  }
  return "xs";
}
