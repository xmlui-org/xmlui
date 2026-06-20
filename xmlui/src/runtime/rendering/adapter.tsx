import React, {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  attachBehaviors,
  type ComponentMetadata,
} from "../../components";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { resolveLayoutStyle } from "../../styling";
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
  booleanProp(name: string, fallback?: boolean): boolean;
  event(name: string): (...args: unknown[]) => Promise<unknown>;
  renderChildren(children?: XmluiNode[]): ReactNode;
  renderTemplate(name: string, fallbackChildren?: XmluiNode[]): ReactNode;
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
    }, rendered)}</>;
  }
  return WrappedXmluiComponent;
}

export function useXmluiComponentAdapter({
  name,
  metadata,
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
  const apiRef = useRef<Record<string, unknown>>({});
  const registeredIdRef = useRef<string>();
  const themeClass = useComponentThemeClass(name, metadata);
  const layoutStyle = useMemo(() => resolveLayoutStyle(props), [props]);

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
    style: {
      ...themeClass.style,
      ...layoutStyle,
    },
    rootAttrs: (part = defaultPart) => ({
      "data-xmlui-component": name,
      "data-xmlui-part": part,
      "data-xmlui-id": props.id,
      className: themeClass.className,
      style: {
        ...themeClass.style,
        ...(part === defaultPart ? layoutStyle : undefined),
      },
    }),
    prop: <T,>(propName: string, fallback?: T): T =>
      (props[propName] === undefined ? fallback : props[propName]) as T,
    stringProp: (propName, fallback) => {
      const value = props[propName];
      return value === undefined || value === null ? fallback : String(value);
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
    renderTemplate: (templateName, fallbackChildren) =>
      context.renderChildren(
        templateChildren(node, templateName) ?? fallbackChildren ?? [],
        scope,
      ),
    registerApi: (api) => {
      Object.assign(apiRef.current, api);
      const id = typeof props.id === "string" ? props.id : undefined;
      if (id) {
        scope.references[id] = apiRef.current;
        scope.store.invalidateReference(id);
      }
    },
    resourceUrl: (value) => value == null || value === "" ? undefined : String(value),
  }), [
    context,
    defaultPart,
    events,
    layoutStyle,
    metadata,
    name,
    node,
    props,
    scope,
    themeClass.className,
    themeClass.style,
  ]);

  return adapter;
}

function templateChildren(node: XmluiElement, name: string): XmluiNode[] | undefined {
  const property = node.children.find(
    (child): child is XmluiElement =>
      child.kind === "element" &&
      child.type === "property" &&
      child.props.name === name,
  );
  return property?.children;
}

function nonPropertyChildren(children: XmluiNode[]): XmluiNode[] {
  return children.filter((child) => !(child.kind === "element" && child.type === "property"));
}
