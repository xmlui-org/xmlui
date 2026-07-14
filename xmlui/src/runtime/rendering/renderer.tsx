import React, { useEffect, useState, type ReactNode } from "react";

import type { XmluiNode, XmluiText } from "../../compiler/ir";
import { builtInComponentRenderers } from "../../component-core";
import { responsiveBreakpoints } from "../../styling";
import type { RuntimeScope } from "../state";
import { evaluateExpressionOrText, renderMixedText } from "./bindings";
import { ComponentInstance, ScopedElement } from "./components";
import { ExtensionComponentInstance } from "./extensionComponent";
import { useBindingRevision } from "./reactive";
import type { RenderContext, RuntimeRenderLayoutContext } from "./types";
import { XmluiRenderError } from "./types";

export function createRenderContext(
  components: RenderContext["components"],
  extensionRenderers: RenderContext["extensionRenderers"] = {},
): RenderContext {
  const context: RenderContext = {
    components,
    extensionRenderers,
    renderElement: (node, scope, layoutContext) => renderElement(context, node, scope, layoutContext),
    renderChildren: (children, scope, parentEnd, layoutContext) =>
      renderChildren(context, children, scope, parentEnd, layoutContext),
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
  textPrefix,
  textSuffix,
  layoutContext,
}: {
  context: RenderContext;
  node: XmluiNode;
  scope: RuntimeScope;
  textPrefix?: string;
  textSuffix?: string;
  layoutContext?: RuntimeRenderLayoutContext;
}): ReactNode {
  if (node.kind === "text") {
    return <XmluiTextRenderer node={node} scope={scope} prefix={textPrefix} suffix={textSuffix} />;
  }
  if (hasConditionalProps(node.props)) {
    return (
      <ConditionalElementRenderer
        context={context}
        node={node}
        scope={scope}
        layoutContext={layoutContext}
      />
    );
  }

  if (Object.keys(node.vars).length > 0 && node.type !== "App") {
    return <ScopedElement context={context} node={node} parentScope={scope} props={scope.props} />;
  }

  return renderElement(context, node, scope, layoutContext);
}

function ConditionalElementRenderer({
  context,
  node,
  scope,
  layoutContext,
}: {
  context: RenderContext;
  node: Extract<XmluiNode, { kind: "element" }>;
  scope: RuntimeScope;
  layoutContext?: RuntimeRenderLayoutContext;
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
  return <>{renderElement(context, node, scope, layoutContext)}</>;
}

function renderElement(
  context: RenderContext,
  node: Extract<XmluiNode, { kind: "element" }>,
  scope: RuntimeScope,
  layoutContext?: RuntimeRenderLayoutContext,
) {
  const renderer = builtInComponentRenderers[node.type];
  if (renderer) {
    const BuiltInRenderer = renderer;
    return <BuiltInRenderer context={context} node={node} scope={scope} layoutContext={layoutContext} />;
  }

  const component = context.components[node.type];
  if (component) {
    return (
      <ComponentInstance
        component={component}
        context={context}
        node={node}
        scope={scope}
        layoutContext={layoutContext}
      />
    );
  }

  const extensionRenderer = context.extensionRenderers[node.type];
  if (extensionRenderer) {
    return (
      <ExtensionComponentInstance
        renderer={extensionRenderer}
        context={context}
        node={node}
        scope={scope}
        layoutContext={layoutContext}
      />
    );
  }

  if (isNativeElementName(node.type)) {
    return <NativeElement context={context} node={node} scope={scope} layoutContext={layoutContext} />;
  }

  throw new XmluiRenderError(`Unknown XMLUI component: ${node.type}`, node);
}

function NativeElement({
  context,
  node,
  scope,
  layoutContext,
}: {
  context: RenderContext;
  node: Extract<XmluiNode, { kind: "element" }>;
  scope: RuntimeScope;
  layoutContext?: RuntimeRenderLayoutContext;
}) {
  const props = Object.fromEntries(
    Object.entries(node.props).map(([name, value]) => [
      name === "class" ? "className" : name,
      evaluateExpressionOrText(value, node.parsed?.props?.[name], scope, `native:${node.type}:${name}`),
    ]),
  );
  return React.createElement(node.type, props, context.renderChildren(node.children, scope, node.range.end, layoutContext));
}

function isNativeElementName(type: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(type);
}

export function renderChildren(
  context: RenderContext,
  children: XmluiNode[],
  scope: RuntimeScope,
  parentEnd?: number,
  layoutContext?: RuntimeRenderLayoutContext,
): ReactNode {
  return children.map((child, index) => {
    const previous = children[index - 1];
    const next = children[index + 1];
    const needsBoundarySpace =
      child.kind === "text" &&
      previous?.kind === "element" &&
      child.range.start > previous.range.end &&
      !child.value.startsWith(" ");
    const needsFollowingBoundarySpace =
      child.kind === "text" &&
      next?.kind === "element" &&
      textContentEnd(child) < next.range.start &&
      !child.value.endsWith(" ");
    const needsTrailingBoundarySpace =
      child.kind === "text" &&
      previous?.kind === "element" &&
      !next &&
      parentEnd !== undefined &&
      child.range.end < parentEnd &&
      !child.value.endsWith(" ");

    const renderedChild =
      layoutContext?.wrapChild && child.kind === "element"
        ? renderElement(context, child, scope, layoutContext)
        : (
          <XmluiNodeRenderer
            context={context}
            node={child}
            scope={scope}
            textPrefix={needsBoundarySpace ? " " : undefined}
            textSuffix={needsFollowingBoundarySpace || needsTrailingBoundarySpace ? " " : undefined}
            layoutContext={layoutContext}
          />
        );
    const wrappedChild =
      layoutContext?.wrapChild && child.kind === "element"
        ? layoutContext.wrapChild({ node: child, scope }, renderedChild)
        : renderedChild;

    return (
      <React.Fragment key={index}>
        {wrappedChild}
      </React.Fragment>
    );
  });
}

function textContentEnd(node: XmluiText): number {
  const segments = node.segments;
  return segments && segments.length > 0
    ? segments[segments.length - 1].range.end
    : node.range.end;
}

function XmluiTextRenderer({
  node,
  scope,
  prefix = "",
  suffix = "",
}: {
  node: XmluiText;
  scope: RuntimeScope;
  prefix?: string;
  suffix?: string;
}) {
  useBindingRevision(node.segments, scope);
  return <>{prefix + renderMixedText(node.segments, node.value, scope, `text:${node.range.start}:${node.range.end}`) + suffix}</>;
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

function hasConditionalProps(props?: Record<string, string>): boolean {
  if (!props) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(props, "when") ||
    Object.prototype.hasOwnProperty.call(props, "if") ||
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
    return evaluateWhenValue(node, scope, "when") ??
      evaluateWhenValue(node, scope, "if") ??
      true;
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
    : Object.prototype.hasOwnProperty.call(node.props, "if")
      ? evaluateWhenValue(node, scope, "if")
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
  name: "when" | "if" | ResponsiveWhenPropName,
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
