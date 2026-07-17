import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { evaluateExpressionOrText, runEvent } from "./bindings";
import type { XmluiBuiltInRenderer } from "./types";
import { useBindingRevision } from "./reactive";
import { createSlotScope, type RenderFragment } from "./components";
import { createRuntimeScope } from "../state";
import { applyResultSelector, managedFetchService } from "../data";
import { compileRoutePattern, matchRoutePattern, type RouteSnapshot } from "../routing";
import {
  flexStyle,
  partAttrs,
  renderValueOrChildren,
  useBooleanProp,
  useEvaluatedProp,
  useLayoutStyle,
  useStringProp,
} from "./props";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";

export const builtInRenderers: Record<string, XmluiBuiltInRenderer> = {
  App: ({ context, node, scope }) => (
    <div
      {...partAttrs("App")}
      style={useLayoutStyle(node, scope)}
    >
      {context.renderChildren(node.children, scope)}
    </div>
  ),
  AppHeader: ({ context, node, scope }) => (
    <header {...partAttrs("AppHeader")} style={useLayoutStyle(node, scope)}>
      {context.renderChildren(node.children, scope)}
    </header>
  ),
  H1: ({ context, node, scope }) => (
    <h1 {...partAttrs("H1")} style={useLayoutStyle(node, scope)}>
      {context.renderChildren(node.children, scope)}
    </h1>
  ),
  Icon: ({ node, scope }) => {
    const testId = useStringProp(node, scope, "testId", "");
    return (
      <span
        {...partAttrs("Icon")}
        data-testid={testId || undefined}
        style={{ display: "inline-flex", ...useLayoutStyle(node, scope) }}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
          <path d="M3 4h10M6 4V3h4v1m-5 2v7m3-7v7m3-7v7" stroke="currentColor" fill="none" />
        </svg>
      </span>
    );
  },
  Stack: ({ context, node, scope }) => {
    const orientation = useStringProp(node, scope, "orientation", "");
    const direction = orientation === "horizontal" ? "row" : orientation === "vertical" ? "column" : undefined;
    const testId = useStringProp(node, scope, "testId", "");
    return <div {...partAttrs("Stack")} data-testid={testId || undefined} style={flexStyle(direction, node, scope)}>{context.renderChildren(node.children, scope)}</div>;
  },
  FlowLayout: ({ context, node, scope }) => (
    <div {...partAttrs("FlowLayout")} style={{ ...flexStyle("row", node, scope), flexWrap: "wrap" }}>
      {context.renderChildren(node.children, scope)}
    </div>
  ),
  HStack: ({ context, node, scope }) => (
    <div {...partAttrs("HStack")} data-testid={useStringProp(node, scope, "testId", "") || undefined} style={flexStyle("row", node, scope)}>{context.renderChildren(node.children, scope)}</div>
  ),
  VStack: ({ context, node, scope }) => (
    <div {...partAttrs("VStack")} data-testid={useStringProp(node, scope, "testId", "") || undefined} style={flexStyle("column", node, scope)}>{context.renderChildren(node.children, scope)}</div>
  ),
  CHStack: ({ context, node, scope }) => (
    <div
      {...partAttrs("CHStack")}
      data-testid={useStringProp(node, scope, "testId", "") || undefined}
      style={{ ...flexStyle("row", node, scope), justifyContent: "center", alignItems: "center" }}
    >
      {context.renderChildren(node.children, scope)}
    </div>
  ),
  CVStack: ({ context, node, scope }) => (
    <div
      {...partAttrs("CVStack")}
      data-testid={useStringProp(node, scope, "testId", "") || undefined}
      style={{ ...flexStyle("column", node, scope), justifyContent: "center", alignItems: "center" }}
    >
      {context.renderChildren(node.children, scope)}
    </div>
  ),
  Text: ({ context, node, scope }) => {
    const value = useEvaluatedProp(node, scope, "value", undefined);
    const variant = useStringProp(node, scope, "variant", "");
    return (
      <span
        {...partAttrs("Text")}
        data-variant={variant || undefined}
        style={useLayoutStyle(node, scope)}
      >
        {renderValueOrChildren(context, node, scope, value)}
      </span>
    );
  },
  Button: ({ context, node, scope }) => {
    const label = useEvaluatedProp(node, scope, "label", undefined);
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const content: ReactNode =
      node.children.length > 0
        ? context.renderChildren(node.children, scope)
        : String(label ?? "");
    return (
      <button
        {...partAttrs("Button")}
        type="button"
        disabled={!enabled}
        style={useLayoutStyle(node, scope)}
        onClick={() => void runEvent(node.parsed?.events?.click, scope)}
      >
        {content}
      </button>
    );
  },
  Theme: ({ context, node, scope }) => <>{context.renderChildren(node.children, scope)}</>,
  variable: () => null,
  Slot: ({ context, node, scope }) => {
    const nameBinding = node.parsed?.props?.name;
    useBindingRevision(nameBinding, scope);
    const name = node.props.name
      ? String(evaluateExpressionOrText(node.props.name, nameBinding, scope, "slot:name"))
      : "default";
    const fragment = scope.slots[name] as RenderFragment | undefined;
    if (!fragment) {
      return <>{context.renderChildren(node.children, scope)}</>;
    }

    const contextValues = Object.fromEntries(
      Object.entries(node.props)
        .filter(([key]) => key !== "name")
        .map(([key, value]) => [
          `$${key}`,
          evaluateExpressionOrText(value, node.parsed?.props?.[key], scope, `slot:${name}:${key}`),
        ]),
    );
    return <>{context.renderChildren(fragment.children, createSlotScope(fragment.scope, contextValues))}</>;
  },
  TextBox: ({ node, scope }) => {
    const initialValue = useStringProp(node, scope, "initialValue", "");
    const placeholder = useStringProp(node, scope, "placeholder", "");
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const readOnly = useBooleanProp(node, scope, "readOnly", false);
    const [value, setValue] = useState(initialValue);
    useEffect(() => setValue(initialValue), [initialValue]);
    return (
      <input
        {...partAttrs("TextBox")}
        type="text"
        style={useLayoutStyle(node, scope)}
        value={value}
        placeholder={placeholder}
        disabled={!enabled}
        readOnly={readOnly}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          setValue(nextValue);
          void runEvent(node.parsed?.events?.didChange, scope, [nextValue]);
        }}
      />
    );
  },
  Checkbox: ({ context, node, scope }) => {
    const initialValue = useBooleanProp(node, scope, "initialValue", false);
    const label = useEvaluatedProp(node, scope, "label", undefined);
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const readOnly = useBooleanProp(node, scope, "readOnly", false);
    const indeterminate = useBooleanProp(node, scope, "indeterminate", false);
    const [checked, setChecked] = useState(initialValue);
    useEffect(() => setChecked(initialValue), [initialValue]);
    const input = (
      <input
        {...partAttrs("Checkbox", "input")}
        type="checkbox"
        checked={checked}
        disabled={!enabled}
        readOnly={readOnly}
        aria-checked={indeterminate ? "mixed" : checked}
        onClick={() => void runEvent(node.parsed?.events?.click, scope)}
        onChange={(event) => {
          if (readOnly) {
            event.preventDefault();
            return;
          }
          const nextValue = event.currentTarget.checked;
          setChecked(nextValue);
          void runEvent(node.parsed?.events?.didChange, scope, [nextValue]);
        }}
      />
    );
    const content = label === undefined ? context.renderChildren(node.children, scope) : String(label);
    return <label {...partAttrs("Checkbox")} style={useLayoutStyle(node, scope)}>{input}{content}</label>;
  },
  Select: ({ context, node, scope }) => {
    const initialValue = useStringProp(node, scope, "initialValue", "");
    const controlledValue = useEvaluatedProp(node, scope, "value", undefined);
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const readOnly = useBooleanProp(node, scope, "readOnly", false);
    const [value, setValue] = useState(initialValue);
    useEffect(() => setValue(initialValue), [initialValue]);
    const effectiveValue = controlledValue === undefined ? value : String(controlledValue ?? "");
    const options = optionDescriptors(node, scope);
    return (
      <select
        {...partAttrs("Select")}
        style={useLayoutStyle(node, scope)}
        value={effectiveValue}
        disabled={!enabled}
        onChange={(event) => {
          if (readOnly) {
            event.preventDefault();
            return;
          }
          const nextValue = event.currentTarget.value;
          setValue(nextValue);
          void runEvent(node.parsed?.events?.didChange, scope, [nextValue]);
        }}
      >
        {options.length > 0
          ? options.map((option, index) => (
              <option key={index} value={option.value} disabled={!option.enabled}>
                {option.label}
              </option>
            ))
          : context.renderChildren(node.children, scope)}
      </select>
    );
  },
  Option: () => null,
  Pages: PagesRenderer,
  Page: () => null,
  NavLink: NavLinkRenderer,
  NavPanel: ({ context, node, scope }) => <nav {...partAttrs("NavPanel")} style={useLayoutStyle(node, scope)}>{context.renderChildren(node.children, scope)}</nav>,
  DataSource: DataSourceRenderer,
  APICall: ApiCallRenderer,
};

function PagesRenderer({ context, node, scope }: Parameters<XmluiBuiltInRenderer>[0]) {
  const fallbackPath = useStringProp(node, scope, "fallbackPath", "");
  const snapshot = useRouteSnapshot(scope);
  const pages = node.children.filter(
    (child): child is XmluiElement => child.kind === "element" && child.type === "Page",
  );
  const restChildren = node.children.filter(
    (child) => !(child.kind === "element" && child.type === "Page"),
  );
  const routeDescriptors = useMemo(
    () => pages
      .map((page) => ({
        page,
        url: page.props.url ?? "",
        pattern: compileRoutePattern(page.props.url ?? ""),
      }))
      .sort((left, right) => right.pattern.score - left.pattern.score),
    [pages],
  );
  const matched = routeDescriptors
    .map((descriptor) => ({
      ...descriptor,
      params: matchRoutePattern(descriptor.pattern, snapshot.pathname),
    }))
    .find((descriptor) => descriptor.params !== undefined);

  useEffect(() => {
    if (!matched && fallbackPath && snapshot.pathname !== fallbackPath) {
      scope.routing?.navigate(fallbackPath);
    }
  }, [fallbackPath, matched, scope.routing, snapshot.pathname]);

  const pageContent = matched
    ? context.renderChildren(
        [scopedPageNode(matched.page)],
        createRuntimeScope({
          store: scope.store,
          parent: scope,
          props: scope.props,
          references: scope.references,
          slots: scope.slots,
          routing: scope.routing,
          contextValues: {
            $routeParams: matched.params ?? {},
            $queryParams: snapshot.queryParams,
            $queryString: snapshot.search,
            $pathname: snapshot.pathname,
          },
          emitEvent: scope.emitEvent,
        }),
      )
    : null;

  return (
    <>
      {pageContent}
      {context.renderChildren(restChildren, scope)}
    </>
  );
}

function scopedPageNode(page: XmluiElement): XmluiElement {
  return {
    ...page,
    type: "Fragment",
    props: {},
    globals: {},
    events: {},
    methods: {},
    children: page.children,
    parsed: page.parsed?.vars ? { vars: page.parsed.vars } : undefined,
  };
}

function NavLinkRenderer({ context, node, scope }: Parameters<XmluiBuiltInRenderer>[0]) {
  const to = useStringProp(node, scope, "to", "");
  const label = useEvaluatedProp(node, scope, "label", undefined);
  const enabled = useBooleanProp(node, scope, "enabled", true);
  const forceActive = useBooleanProp(node, scope, "active", false);
  const exact = useBooleanProp(node, scope, "exact", false);
  const target = useStringProp(node, scope, "target", "");
  const style = useLayoutStyle(node, scope);
  const snapshot = useRouteSnapshot(scope);
  const href = scope.routing?.href(to) ?? to;
  const active = forceActive || isNavLinkActive(snapshot.pathname, to, exact);
  const content = label === undefined ? context.renderChildren(node.children, scope) : String(label);
  if (!enabled) {
    return <button {...partAttrs("NavLink")} type="button" disabled data-active={active || undefined} style={style}>{content}</button>;
  }
  return (
    <a
      {...partAttrs("NavLink")}
      href={href}
      target={target || undefined}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      style={style}
      onClick={(event) => {
        if (!scope.routing || target || isExternalUrl(to)) {
          return;
        }
        event.preventDefault();
        scope.routing.navigate(to);
        void runEvent(node.parsed?.events?.click, scope);
      }}
    >
      {content}
    </a>
  );
}

function DataSourceRenderer({ node, scope }: Parameters<XmluiBuiltInRenderer>[0]) {
  const id = useStringProp(node, scope, "id", "");
  const url = useStringProp(node, scope, "url", "");
  const method = useStringProp(node, scope, "method", "get");
  const mockData = useEvaluatedProp(node, scope, "mockData", undefined);
  const body = useEvaluatedProp(node, scope, "body", undefined);
  const rawBody = useStringProp(node, scope, "rawBody", "");
  const queryParams = useEvaluatedProp(node, scope, "queryParams", undefined);
  const headers = useEvaluatedProp(node, scope, "headers", undefined);
  const credentials = useStringProp(node, scope, "credentials", "") as RequestCredentials | "";
  const dataType = useStringProp(node, scope, "dataType", "json") as "json" | "text";
  const resultSelector = useStringProp(node, scope, "resultSelector", "");
  const transformResult = useEvaluatedProp(node, scope, "transformResult", undefined);
  const pollIntervalInSeconds = Number(useEvaluatedProp(node, scope, "pollIntervalInSeconds", 0) ?? 0);
  const apiRef = useRef<Record<string, unknown>>();
  const mockDataKey = stableDataKey(mockData);
  const transformResultKey = stableDataKey(transformResult);
  const request = useMemo(
    () => managedFetchService.buildRequest({
      url,
      method,
      body,
      rawBody: rawBody || undefined,
      queryParams,
      headers,
      credentials: credentials || undefined,
      dataType,
    }),
    [body, credentials, dataType, headers, method, queryParams, rawBody, url],
  );
  const requestKey = useMemo(() => managedFetchService.requestKey(request), [request]);
  const latest = useRef({ mockData, request, resultSelector, transformResult });
  latest.current = { mockData, request, resultSelector, transformResult };

  if (!apiRef.current) {
    apiRef.current = createDataSourceApi(id, scope);
  }
  useEffect(() => registerReference(scope, id, apiRef.current!), [id, scope]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    const load = async (force = false) => {
      updateApi(apiRef.current!, id, scope, {
        inProgress: true,
        isRefetching: Boolean(apiRef.current!.loaded),
        error: undefined,
      });
      try {
        let value: unknown;
        let responseHeaders: Record<string, string> | undefined;
        const current = latest.current;
        if (current.mockData !== undefined) {
          value = current.mockData;
        } else if (node.parsed?.events?.fetch) {
          value = await runEvent(
            node.parsed.events.fetch,
            createRuntimeScope({
              store: scope.store,
              parent: scope,
              references: scope.references,
              contextValues: {
                $url: current.request.url,
                $method: current.request.method,
                $queryParams: current.request.queryParams,
                $requestBody: current.request.rawBody ?? current.request.body,
                $requestHeaders: current.request.headers,
              },
            }),
          );
        } else {
          const entry = await managedFetchService.load(current.request, { force });
          value = entry.value;
          responseHeaders = entry.responseHeaders;
        }
        value = applyDataTransforms(value, current.resultSelector, current.transformResult);
        if (cancelled) {
          return;
        }
        updateApi(apiRef.current!, id, scope, {
          value,
          loaded: true,
          inProgress: false,
          isRefetching: false,
          error: undefined,
          responseHeaders,
        });
        void runEvent(node.parsed?.events?.loaded, scope, [value, force]);
      } catch (error) {
        if (cancelled) {
          return;
        }
        updateApi(apiRef.current!, id, scope, {
          error,
          inProgress: false,
          isRefetching: false,
        });
        void runEvent(node.parsed?.events?.error, scope, [error]);
      }
    };
    apiRef.current!.refetch = () => load(true);
    void load(false);
    const interval = pollIntervalInSeconds > 0
      ? window.setInterval(() => void load(true), pollIntervalInSeconds * 1000)
      : undefined;
    return () => {
      cancelled = true;
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [
    id,
    mockDataKey,
    node.parsed?.events?.error,
    node.parsed?.events?.fetch,
    node.parsed?.events?.loaded,
    pollIntervalInSeconds,
    requestKey,
    resultSelector,
    scope,
    transformResultKey,
  ]);

  return null;
}

function ApiCallRenderer({ node, scope }: Parameters<XmluiBuiltInRenderer>[0]) {
  const id = useStringProp(node, scope, "id", "");
  const url = useStringProp(node, scope, "url", "");
  const method = useStringProp(node, scope, "method", "get");
  const body = useEvaluatedProp(node, scope, "body", undefined);
  const rawBody = useStringProp(node, scope, "rawBody", "");
  const queryParams = useEvaluatedProp(node, scope, "queryParams", undefined);
  const headers = useEvaluatedProp(node, scope, "headers", undefined);
  const credentials = useStringProp(node, scope, "credentials", "") as RequestCredentials | "";
  const invalidates = useEvaluatedProp(node, scope, "invalidates", undefined);
  const apiRef = useRef<Record<string, unknown>>();
  const latest = useRef({ url, method, body, rawBody, queryParams, headers, credentials, invalidates });
  latest.current = { url, method, body, rawBody, queryParams, headers, credentials, invalidates };

  if (!apiRef.current) {
    apiRef.current = createApiCallApi(id, scope);
  }
  useEffect(() => registerReference(scope, id, apiRef.current!), [id, scope]);

  useEffect(() => {
    if (!id) {
      return;
    }
    apiRef.current!.execute = async (...args: unknown[]) => {
      const before = await runEvent(node.parsed?.events?.beforeRequest, scope, args);
      if (before === false) {
        return undefined;
      }
      updateApi(apiRef.current!, id, scope, {
        inProgress: true,
        lastError: undefined,
      });
      try {
        const request = managedFetchService.buildRequest({
          url: latest.current.url,
          method: latest.current.method,
          body: latest.current.body,
          rawBody: latest.current.rawBody || undefined,
          queryParams: latest.current.queryParams,
          headers: latest.current.headers,
          credentials: latest.current.credentials || undefined,
        });
        const executionScope = createRuntimeScope({
          store: scope.store,
          parent: scope,
          references: scope.references,
          contextValues: {
            $param: args[0],
            $params: args,
            $queryParams: request.queryParams,
            $requestBody: request.rawBody ?? request.body,
            $requestHeaders: request.headers,
          },
        });
        let responseHeaders: Record<string, string> | undefined;
        let result: unknown;
        if (node.parsed?.events?.mockExecute) {
          result = await runEvent(node.parsed.events.mockExecute, executionScope, args);
        } else {
          const response = await managedFetchService.execute(request);
          result = response.data;
          responseHeaders = response.headers;
        }
        updateApi(apiRef.current!, id, scope, {
          inProgress: false,
          loaded: true,
          lastResult: result,
          lastError: undefined,
          lastResponseHeaders: responseHeaders,
        });
        const successResult = await runEvent(node.parsed?.events?.success, scope, [result]);
        if (successResult !== false) {
          invalidateDataSources(scope, latest.current.invalidates);
        }
        return result;
      } catch (error) {
        updateApi(apiRef.current!, id, scope, {
          inProgress: false,
          lastError: error,
        });
        void runEvent(node.parsed?.events?.error, scope, [error]);
        throw error;
      }
    };
    scope.store.invalidateReference(id);
  }, [id, node.parsed?.events?.beforeRequest, node.parsed?.events?.error, node.parsed?.events?.mockExecute, node.parsed?.events?.success, scope]);

  return null;
}

function templateChildren(node: XmluiElement, name: string): XmluiNode[] | undefined {
  const property = node.children.find(
    (child): child is XmluiElement => child.kind === "element" && child.type === "property" && child.props.name === name,
  );
  return property?.children;
}

function nonPropertyChildren(children: XmluiNode[]): XmluiNode[] {
  return children.filter((child) => !(child.kind === "element" && child.type === "property"));
}

function optionDescriptors(
  node: XmluiElement,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Array<{ value: string; label: string; enabled: boolean }> {
  return node.children.flatMap((child) => {
    if (child.kind !== "element" || child.type !== "Option") {
      return [];
    }
    const value = evaluateExpressionOrText(child.props.value ?? "", child.parsed?.props?.value, scope, `${child.type}:value`);
    const label = Object.prototype.hasOwnProperty.call(child.props, "label")
      ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, scope, `${child.type}:label`)
      : (child.children ?? []).map((optionChild) => optionChild.kind === "text" ? optionChild.value : "").join(" ");
    const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
      ? Boolean(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, scope, `${child.type}:enabled`))
      : true;
    return [{ value: String(value ?? label ?? ""), label: String(label ?? value ?? ""), enabled }];
  });
}

function createDataSourceApi(id: string, scope: Parameters<XmluiBuiltInRenderer>[0]["scope"]): Record<string, unknown> {
  const api: Record<string, unknown> = {
    value: undefined,
    error: undefined,
    inProgress: false,
    isRefetching: false,
    loaded: false,
    responseHeaders: undefined,
    refetch: () => undefined,
  };
  if (id) {
    scope.references[id] = api;
  }
  return api;
}

function createApiCallApi(id: string, scope: Parameters<XmluiBuiltInRenderer>[0]["scope"]): Record<string, unknown> {
  const api: Record<string, unknown> = {
    execute: () => Promise.resolve(undefined),
    inProgress: false,
    loaded: false,
    lastResult: undefined,
    lastError: undefined,
    lastResponseHeaders: undefined,
  };
  if (id) {
    scope.references[id] = api;
  }
  return api;
}

function registerReference(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  id: string,
  api: Record<string, unknown>,
): () => void {
  if (!id) {
    return () => undefined;
  }
  scope.references[id] = api;
  scope.store.invalidateReference(id);
  return () => {
    if (scope.references[id] === api) {
      delete scope.references[id];
      scope.store.invalidateReference(id);
    }
  };
}

function updateApi(
  api: Record<string, unknown>,
  id: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  patch: Record<string, unknown>,
): void {
  let changed = false;
  for (const [key, value] of Object.entries(patch)) {
    if (!Object.is(api[key], value)) {
      api[key] = value;
      changed = true;
    }
  }
  if (changed && id) {
    scope.store.invalidateReference(id);
  }
}

function stableDataKey(value: unknown): string {
  if (typeof value === "function") {
    return "function";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function applyDataTransforms(value: unknown, selector: string, transform: unknown): unknown {
  const selected = applyResultSelector(value, selector || undefined);
  if (typeof transform === "function") {
    return transform(selected);
  }
  return selected;
}

function invalidateDataSources(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  invalidates: unknown,
): void {
  const names = Array.isArray(invalidates)
    ? invalidates
    : typeof invalidates === "string"
      ? invalidates.split(",").map((name) => name.trim()).filter(Boolean)
      : [];
  for (const name of names) {
    const api = scope.references[String(name)] as { refetch?: () => unknown } | undefined;
    void api?.refetch?.();
  }
}

function useRouteSnapshot(scope: Parameters<XmluiBuiltInRenderer>[0]["scope"]): RouteSnapshot {
  const fallback = {
    pathname: "/",
    search: "",
    hash: "",
    queryParams: {},
    revision: 0,
  };
  return useSyncExternalStore(
    (listener) => scope.routing?.subscribe(listener) ?? (() => undefined),
    () => scope.routing?.getSnapshot() ?? fallback,
    () => scope.routing?.getSnapshot() ?? fallback,
  );
}

function isNavLinkActive(pathname: string, to: string, exact: boolean): boolean {
  const target = to.split(/[?#]/)[0] || "/";
  if (exact || target === "/") {
    return pathname === target;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

function isExternalUrl(to: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(to);
}
