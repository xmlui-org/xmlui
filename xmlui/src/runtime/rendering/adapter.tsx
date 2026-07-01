import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import { attachBehaviors } from "../../component-core/behaviors";
import type { ComponentMetadata } from "../../component-core/metadata";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import {
  COMPONENT_PART_KEY,
  resolveLayoutStyle,
  resolveResponsiveLayoutStyles,
  responsiveBreakpoints,
  supportedLayoutPropNames,
  supportedResponsiveLayoutPropNames,
} from "../../styling";
import type { RuntimeScope } from "../state";
import { evaluateProps, runEvent } from "./bindings";
import { useBindingRevision } from "./reactive";
import { useComponentThemeClass } from "./theme";
import type { RenderContext } from "./types";

export type XmluiAdapterRendererProps = {
  adapter: XmluiComponentAdapter;
};

export type XmluiAdapterRenderer = (props: XmluiAdapterRendererProps) => ReactNode;

export type XmluiComponentAdapterOptions = {
  name: string;
  metadata: ComponentMetadata;
  themeContributors?: readonly ComponentMetadata[];
  renderer: XmluiAdapterRenderer;
  defaultPart?: string;
};

export type XmluiWrappedRenderer = (props: {
  context: RenderContext;
  node: XmluiElement;
  scope: RuntimeScope;
}) => ReactNode;

export type XmluiComponentAdapter = {
  name: string;
  metadata: ComponentMetadata;
  node: XmluiElement;
  scope: RuntimeScope;
  context: RenderContext;
  props: Record<string, unknown>;
  events: Record<string, (...args: unknown[]) => Promise<unknown>>;
  api: Record<string, unknown>;
  className: string;
  style: CSSProperties;
  rootAttrs(part?: string): Record<string, unknown>;
  prop<T = unknown>(name: string, fallback?: T): T;
  stringProp(name: string, fallback?: string): string | undefined;
  numberProp(name: string, fallback?: number): number;
  booleanProp(name: string, fallback?: boolean): boolean;
  event(name: string): (...args: unknown[]) => Promise<unknown>;
  renderChildren(children?: XmluiNode[]): ReactNode;
  renderTemplate(name: string, fallbackChildren?: XmluiNode[], renderScope?: RuntimeScope): ReactNode;
  registerApi(api: Record<string, unknown>): void;
  resourceUrl(value: unknown): string | undefined;
};

export function wrapComponent(options: XmluiComponentAdapterOptions): XmluiWrappedRenderer {
  function WrappedXmluiComponent({ context, node, scope }: Parameters<XmluiWrappedRenderer>[0]) {
    const adapter = useXmluiComponentAdapter({
      ...options,
      context,
      node,
      scope,
    });
    const rendered = options.renderer({ adapter });
    return <>{attachBehaviors({
      componentName: options.name,
      metadata: options.metadata,
      props: adapter.props,
      layoutContext: scope.layoutContext,
    }, rendered)}</>;
  }
  return WrappedXmluiComponent;
}

export function useXmluiComponentAdapter({
  name,
  metadata,
  themeContributors = [],
  context,
  node,
  scope,
  defaultPart = "root",
}: XmluiComponentAdapterOptions & {
  context: RenderContext;
  node: XmluiElement;
  scope: RuntimeScope;
}): XmluiComponentAdapter {
  const propDependencies = Object.values(node.parsed?.props ?? {}).flatMap((parsed) =>
    Array.isArray(parsed)
      ? parsed.flatMap((segment) => (segment.kind === "expression" ? segment.dependencies ?? [] : []))
      : parsed.dependencies ?? [],
  );
  useBindingRevision(propDependencies, scope);
  const props = useMemo(
    () => evaluateProps(node.props, node.parsed?.props, scope),
    [node.props, node.parsed?.props, scope, scope.store.getSnapshot()],
  );
  const events = useMemo(
    () => Object.fromEntries(Object.keys(node.events).map((eventName) => [
      eventName,
      (...args: unknown[]) => Promise.resolve(runEvent(node.parsed?.events?.[eventName], scope, args)),
    ])),
    [node.events, node.parsed?.events, scope],
  );
  const rootPart =
    typeof props.__xmluiPartId === "string" && props.__xmluiPartId.length > 0
      ? props.__xmluiPartId
      : defaultPart;
  const explicitRootPart = typeof props.__xmluiPartId === "string" && props.__xmluiPartId.length > 0;
  const apiRef = useRef<Record<string, unknown>>({});
  const registeredIdRef = useRef<string>();
  const variant = typeof props.variant === "string" ? props.variant : undefined;
  const themeClass = useComponentThemeClass(name, metadata, themeContributors, variant);
  const viewportWidth = useViewportWidth();
  const parentOrientation = scope.layoutContext?.orientation;
  const layoutStyle = useMemo(
    () => resolveActiveLayoutStyle(props, viewportWidth, { parentOrientation }),
    [parentOrientation, props, viewportWidth],
  );
  const layoutStyles = useMemo(
    () => resolveResponsiveLayoutStyles(props, { parentOrientation }),
    [parentOrientation, props],
  );
  const layoutStyleForPart = useCallback((part: string): CSSProperties | undefined => {
    if (part === defaultPart || part === rootPart) {
      return {
        ...layoutStyle,
        ...resolveActiveLayoutStyleForPart(layoutStyles, part, viewportWidth),
      };
    }
    return resolveActiveLayoutStyleForPart(layoutStyles, part, viewportWidth);
  }, [defaultPart, layoutStyle, layoutStyles, rootPart, viewportWidth]);
  const registerApi = useCallback((api: Record<string, unknown>) => {
    const id = typeof props.id === "string" ? props.id : undefined;
    const referenceChanged = id ? scope.references[id] !== apiRef.current : false;
    let valueChanged = false;
    for (const [key, value] of Object.entries(api)) {
      if (typeof value !== "function" && !Object.is(apiRef.current[key], value)) {
        valueChanged = true;
      }
      apiRef.current[key] = value;
    }
    if (id) {
      scope.references[id] = apiRef.current;
      if (referenceChanged || valueChanged) {
        scope.store.invalidateReference(id);
      }
    }
  }, [props.id, scope.references, scope.store]);

  useEffect(() => {
    const id = typeof props.id === "string" ? props.id : undefined;
    if (registeredIdRef.current && registeredIdRef.current !== id) {
      delete scope.references[registeredIdRef.current];
      scope.store.invalidateReference(registeredIdRef.current);
      registeredIdRef.current = undefined;
    }
    if (!id) {
      return;
    }
    scope.references[id] = apiRef.current;
    scope.store.invalidateReference(id);
    registeredIdRef.current = id;
    return () => {
      if (scope.references[id] === apiRef.current) {
        delete scope.references[id];
        scope.store.invalidateReference(id);
      }
    };
  }, [props.id, scope.references, scope.store]);

  const adapter = useMemo<XmluiComponentAdapter>(() => ({
    name,
    metadata,
    node,
    scope,
    context,
    props,
    events,
    api: apiRef.current,
    className: themeClass.className,
    style: layoutStyle,
    rootAttrs: (part = rootPart) => ({
      ...arbitraryRootAttrs(metadata, props),
      "data-xmlui-component": name,
      "data-xmlui-part": part,
      "data-part-id": explicitRootPart ? part : undefined,
      "data-xmlui-id": props.id,
      "data-testid": props.testId,
      className: themeClass.className,
      style: layoutStyleForPart(part),
    }),
    prop: <T,>(propName: string, fallback?: T): T =>
      (props[propName] === undefined ? fallback : props[propName]) as T,
    stringProp: (propName, fallback) => {
      const value = props[propName];
      return value === undefined || value === null ? fallback : String(value);
    },
    numberProp: (propName, fallback = 0) => {
      const value = props[propName];
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      }
      return value === undefined || value === null ? fallback : Number(value) || fallback;
    },
    booleanProp: (propName, fallback = false) => {
      const value = props[propName];
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        return value === "true";
      }
      return value === undefined || value === null ? fallback : Boolean(value);
    },
    event: (eventName) =>
      events[eventName] ?? ((..._args: unknown[]) => Promise.resolve(undefined)),
    renderChildren: (children = nonPropertyChildren(node.children)) =>
      context.renderChildren(children, scope),
    renderTemplate: (templateName, fallbackChildren, renderScope = scope) =>
      context.renderChildren(
        templateChildren(node, templateName) ?? fallbackChildren ?? [],
        renderScope,
      ),
    registerApi,
    resourceUrl: (value) => value == null || value === "" ? undefined : String(value),
  }), [
    context,
    events,
    explicitRootPart,
    layoutStyleForPart,
    metadata,
    themeContributors,
    name,
    node,
    props,
    registerApi,
    rootPart,
    scope,
    themeClass.className,
  ]);

  return adapter;
}

function resolveActiveLayoutStyle(
  props: Record<string, unknown>,
  viewportWidth: number | undefined,
  options: { parentOrientation?: string } = {},
): CSSProperties {
  const responsive = resolveResponsiveLayoutStyles(props, options);
  const componentStyle = responsive[COMPONENT_PART_KEY];
  if (!componentStyle) {
    return resolveLayoutStyle(props, options);
  }

  return resolveActiveLayoutStyleForPart(responsive, COMPONENT_PART_KEY, viewportWidth) ?? {};
}

function resolveActiveLayoutStyleForPart(
  responsive: ReturnType<typeof resolveResponsiveLayoutStyles>,
  part: string,
  viewportWidth: number | undefined,
): CSSProperties | undefined {
  const partStyle = responsive[part];
  if (!partStyle) {
    return undefined;
  }

  const style: CSSProperties = { ...partStyle.base };
  if (viewportWidth !== undefined) {
    for (const [breakpoint, minWidth] of Object.entries(responsiveBreakpoints)) {
      if (viewportWidth >= minWidth) {
        Object.assign(style, partStyle.breakpoints[breakpoint as keyof typeof responsiveBreakpoints]);
      }
    }
  }
  return style;
}

function useViewportWidth(): number | undefined {
  const [width, setWidth] = React.useState(() =>
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

export function templateChildren(node: XmluiElement, name: string): XmluiNode[] | undefined {
  const property = node.children.find(
    (child): child is XmluiElement =>
      child.kind === "element" &&
      child.type === "property" &&
      child.props.name === name,
  );
  return property?.children;
}

export function nonPropertyChildren(children: XmluiNode[]): XmluiNode[] {
  return children.filter((child) => !(child.kind === "element" && child.type === "property"));
}

function arbitraryRootAttrs(
  metadata: ComponentMetadata,
  props: Record<string, unknown>,
): Record<string, unknown> {
  if (!metadata.allowArbitraryProps) {
    return {};
  }
  const knownProps = new Set([
    ...Object.keys(metadata.props ?? {}),
    ...supportedLayoutPropNames,
    ...supportedResponsiveLayoutPropNames,
    "testId",
    "when",
    "when-xs",
    "when-sm",
    "when-md",
    "when-lg",
    "when-xl",
    "when-xxl",
    "tooltip",
    "tooltipMarkdown",
    "tooltipOptions",
  ]);
  return Object.fromEntries(
    Object.entries(props).filter(([name, value]) =>
      !knownProps.has(name) &&
      value !== undefined &&
      value !== null &&
      typeof value !== "object" &&
      typeof value !== "function" &&
      !name.startsWith("on"),
    ),
  );
}
