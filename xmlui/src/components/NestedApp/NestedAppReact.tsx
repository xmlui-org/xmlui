import { useEffect, useLayoutEffect, useState, useRef, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

import type { ThemeTone } from "../../styling";
import { ManagedFetchError, managedFetchService, type ManagedFetchAdapter, type ManagedRequest } from "../../runtime/data";
import { StyleInjectionTargetContext } from "../../components-core/theming/StyleContext";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import styles from "./NestedApp.module.scss";

export type NestedAppProps = {
  activeTone?: string;
  activeTheme?: string;
  app?: string;
  className?: string;
  components?: unknown[];
  config?: unknown;
  height?: string | number;
  initiallyShowCode?: boolean;
  noHeader?: boolean;
  allowReset?: boolean;
  refreshVersion?: string | number;
  splitView?: boolean;
  style?: CSSProperties;
  testId?: string;
  title?: string;
  withFrame?: boolean;
  api?: unknown;
};

export function NestedAppComponent({
  activeTone,
  activeTheme,
  app,
  api,
  allowReset = false,
  className,
  components = [],
  config,
  height,
  initiallyShowCode = false,
  noHeader = false,
  refreshVersion,
  splitView = false,
  style,
  testId,
  title,
  withFrame = false,
}: NestedAppProps) {
  const [showCode, setShowCode] = useState(initiallyShowCode);
  const [resetVersion, setResetVersion] = useState(0);
  const [compiled, setCompiled] = useState<{
    module?: unknown;
    Root?: ComponentType<any>;
    error?: string;
  }>();

  useEffect(() => {
    let cancelled = false;
    const source = String(app ?? "").trim();
    if (!source) {
      setCompiled(undefined);
      return;
    }

    async function compileNestedApp() {
      try {
        const [{ compileXmluiSource, throwFirstCompilerDiagnostic }, { createXmluiModule, XmluiRoot }] =
          await Promise.all([
            import("../../compiler/compileXmluiSource"),
            import("../../runtime"),
          ]);
        const appSource = injectConfigGlobals(source, config);
        const componentSources = components.filter((component): component is string => typeof component === "string");
        const componentNames = componentSources
          .map((componentSource) => componentSource.match(/<Component\s+name=["']([^"']+)["']/)?.[1])
          .filter((name): name is string => Boolean(name));
        const compiledComponents = componentSources.map((componentSource, index) => {
          const result = compileXmluiSource({
            id: `nested-component-${index + 1}.xmlui`,
            source: componentSource,
            knownComponents: componentNames,
          });
          throwFirstCompilerDiagnostic(result);
          return createXmluiModule(result.runtimeDocument);
        });
        const result = compileXmluiSource({
          id: "nested-app.xmlui",
          source: appSource,
          knownComponents: componentNames,
        });
        throwFirstCompilerDiagnostic(result);
        if (!cancelled) {
          setCompiled({
            module: createXmluiModule(result.runtimeDocument, compiledComponents),
            Root: XmluiRoot,
            error: undefined,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setCompiled({
            module: undefined,
            Root: undefined,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    compileNestedApp();
    return () => {
      cancelled = true;
    };
  }, [app, components, config]);

  useLayoutEffect(() => {
    const previousAdapter = managedFetchService.getAdapter();
    const adapter = createNestedApiAdapter(api, previousAdapter);
    if (!adapter) {
      return;
    }
    managedFetchService.setAdapter(adapter);
    return () => {
      if (managedFetchService.getAdapter() === adapter) {
        managedFetchService.setAdapter(previousAdapter);
      }
    };
  }, [api]);
  const mergedStyle = {
    ...style,
    ...(height !== undefined ? { height } : null),
  } as CSSProperties;
  const effectiveRefreshVersion = `${String(refreshVersion ?? "")}:${resetVersion}`;
  const defaultTone = normalizeThemeTone(activeTone);
  const resolvedConfig = normalizeNestedConfig(config);
  const defaultTheme = typeof activeTheme === "string" ? activeTheme : resolvedConfig.defaultTheme;
  const Root = compiled?.Root;
  const runtimeView = compiled?.error ? (
    <pre className={styles.error} data-testid={testId ? `${testId}-error` : undefined}>
      {compiled.error}
    </pre>
  ) : Root && (compiled?.module as { kind?: string } | undefined)?.kind === "app" ? (
    <Root
      key={effectiveRefreshVersion}
      module={compiled.module}
      initialUrl="/"
      isolateRouting
      defaultTone={defaultTone}
      defaultTheme={defaultTheme}
      themes={resolvedConfig.themes}
      resources={resolvedConfig.resources}
      appGlobals={{ ...resolvedConfig.appGlobals, isNested: true }}
      applyDocumentThemeVars={false}
    />
  ) : null;
  const appView = runtimeView ? <NestedAppShadowRoot>{runtimeView}</NestedAppShadowRoot> : null;
  const content = showCode ? (
    <pre className={styles.code} data-testid={testId ? `${testId}-code` : undefined}>
      {String(app ?? "")}
    </pre>
  ) : (
    appView
  );
  const containerClassName = [
    styles.nestedAppContainer,
    className,
  ].filter(Boolean).join(" ");

  if (!withFrame) {
    const placeholderClassName = [
      styles.nestedAppPlaceholder,
      className,
    ].filter(Boolean).join(" ");
    const rootClassName = [
      styles.nestedAppRoot,
      styles.initialized,
    ].filter(Boolean).join(" ");

    return (
      <div
        className={placeholderClassName}
        data-testid={testId}
        data-xmlui-component="NestedApp"
        data-xmlui-tone={defaultTone}
        style={mergedStyle}
      >
        <div className={rootClassName}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={containerClassName}
      data-testid={testId}
      data-xmlui-component="NestedApp"
      data-xmlui-tone={defaultTone}
      style={mergedStyle}
    >
      {withFrame && !noHeader ? (
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <div className={styles.controls}>
            {splitView ? (
              <>
                <button
                  type="button"
                  className={showCode ? undefined : styles.activeControl}
                  data-testid={testId ? `${testId}-show-app` : undefined}
                  onClick={() => setShowCode(false)}
                >
                  App
                </button>
                <button
                  type="button"
                  className={showCode ? styles.activeControl : undefined}
                  data-testid={testId ? `${testId}-show-code` : undefined}
                  onClick={() => setShowCode(true)}
                >
                  Code
                </button>
              </>
            ) : null}
            {allowReset ? (
              <button
                type="button"
                data-testid={testId ? `${testId}-reset` : undefined}
                onClick={() => {
                  setResetVersion((version) => version + 1);
                  setShowCode(false);
                }}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className={styles.nestedAppContent}>
        {content}
      </div>
    </div>
  );
}

export const NestedApp = NestedAppComponent;
export const LazyNestedApp = NestedAppComponent;
export const IndexAwareNestedApp = NestedAppComponent;

function NestedAppShadowRoot({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    copyDocumentStylesToShadowRoot(root);
    setShadowRoot(root);
  }, []);

  return (
    <div className={[styles.nestedAppRoot, styles.initialized].join(" ")} ref={hostRef}>
      {shadowRoot
        ? createPortal(
            <StyleInjectionTargetContext.Provider value={shadowRoot}>
              <TableOfContentsContext.Provider value={null}>
                {children}
              </TableOfContentsContext.Provider>
            </StyleInjectionTargetContext.Provider>,
            shadowRoot,
          )
        : null}
    </div>
  );
}

function copyDocumentStylesToShadowRoot(shadowRoot: ShadowRoot): void {
  if (typeof document === "undefined") return;
  if (shadowRoot.querySelector("style[data-nested-app-style-reset]")) return;

  const layerStyle = document.createElement("style");
  layerStyle.setAttribute("data-nested-app-style-reset", "true");
  layerStyle.textContent = "@layer reset, base, components, themes, dynamic;";
  shadowRoot.appendChild(layerStyle);

  const constructedSheets: CSSStyleSheet[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const owner = sheet.ownerNode;
    if (owner instanceof Element && owner.hasAttribute("data-style-hash")) {
      continue;
    }
    if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
      continue;
    }
    try {
      const cssText = Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      if (!cssText.trim()) {
        continue;
      }
      if ("adoptedStyleSheets" in shadowRoot && "replaceSync" in CSSStyleSheet.prototype) {
        const constructed = new CSSStyleSheet();
        constructed.replaceSync(cssText);
        constructedSheets.push(constructed);
      } else {
        const style = document.createElement("style");
        style.textContent = cssText;
        shadowRoot.appendChild(style);
      }
    } catch {
      // Cross-origin and transient Vite stylesheets can be unreadable; skip them.
    }
  }

  if (constructedSheets.length > 0 && "adoptedStyleSheets" in shadowRoot) {
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ...constructedSheets];
  }
}

function normalizeThemeTone(value: string | undefined): ThemeTone | undefined {
  return value === "dark" || value === "light" ? value : undefined;
}

function normalizeNestedConfig(config: unknown): {
  appGlobals?: Record<string, unknown>;
  defaultTheme?: string;
  resources?: Record<string, string>;
  themes?: Array<any>;
} {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return {
      resources: normalizeNestedResources(undefined),
    };
  }
  const normalized = config as Record<string, unknown>;
  return {
    appGlobals: isPlainRecord(normalized.appGlobals)
      ? normalized.appGlobals
      : undefined,
    defaultTheme: typeof normalized.defaultTheme === "string" ? normalized.defaultTheme : undefined,
    resources: normalizeNestedResources(normalized.resources),
    themes: Array.isArray(normalized.themes) ? normalized.themes : undefined,
  };
}

function normalizeNestedResources(resources: unknown): Record<string, string> {
  const normalizedResources = isPlainRecord(resources) ? resources : {};
  return {
    logo: "",
    "logo-light": "",
    "logo-dark": "",
    ...Object.fromEntries(
      Object.entries(normalizedResources).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    ),
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function createNestedApiAdapter(
  api: unknown,
  fallbackAdapter: ManagedFetchAdapter,
): ManagedFetchAdapter | undefined {
  const normalizedApi = normalizeNestedApi(api);
  if (!normalizedApi || !isPlainRecord(normalizedApi.operations)) {
    return undefined;
  }
  const apiUrl = typeof normalizedApi.apiUrl === "string" ? normalizedApi.apiUrl.replace(/\/$/, "") : "";
  const state: Record<string, unknown> = {};
  if (typeof normalizedApi.initialize === "string" && normalizedApi.initialize.trim()) {
    runNestedApiHandler(normalizedApi.initialize, { $state: state });
  }
  const operations = Object.values(normalizedApi.operations)
    .filter(isPlainRecord)
    .map((operation) => ({
      url: typeof operation.url === "string" ? operation.url : "",
      method: typeof operation.method === "string" ? operation.method.toLowerCase() : "get",
      handler: typeof operation.handler === "string" ? operation.handler : "",
    }))
    .filter((operation) => operation.url);

  return async (request, signal) => {
    if (!isNestedApiRequest(request, apiUrl)) {
      return fallbackAdapter(request, signal);
    }
    const normalizedPath = nestedRequestPath(request, apiUrl);
    const operation = operations.find((candidate) =>
      candidate.method === request.method &&
      matchNestedApiPath(candidate.url, normalizedPath) !== undefined
    );
    if (!operation) {
      return fallbackAdapter(request, signal);
    }
    const pathParams = matchNestedApiPath(operation.url, normalizedPath) ?? {};
    try {
      const data = operation.handler
        ? runNestedApiHandler(operation.handler, {
            $state: state,
            $requestBody: request.body,
            $pathParams: pathParams,
            $queryParams: request.queryParams ?? {},
            $requestHeaders: request.headers,
          })
        : { success: true };
      return { data };
    } catch (error) {
      if (isNestedHttpError(error)) {
        throw new ManagedFetchError("Nested API Error", error.status, error.body);
      }
      throw new ManagedFetchError("Internal Server Error", 500, {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

function isNestedApiRequest(request: ManagedRequest, apiUrl: string): boolean {
  if (!apiUrl) {
    return true;
  }
  const origin = typeof window === "undefined" ? "http://xmlui.local" : window.location.origin;
  const pathname = new URL(request.url || "/", origin).pathname;
  return pathname === apiUrl || pathname.startsWith(`${apiUrl}/`);
}

function normalizeNestedApi(api: unknown): Record<string, unknown> | undefined {
  if (isPlainRecord(api)) {
    return api;
  }
  if (typeof api !== "string" || !api.trim()) {
    return undefined;
  }
  for (const source of [api, api.replace(/\r?\n/g, " ")]) {
    try {
      const parsed = JSON.parse(source);
      if (isPlainRecord(parsed)) {
        return parsed;
      }
    } catch {
      // Try the next legacy playground form.
    }
  }
  return undefined;
}

function nestedRequestPath(request: ManagedRequest, apiUrl: string): string {
  const origin = typeof window === "undefined" ? "http://xmlui.local" : window.location.origin;
  const pathname = new URL(request.url || "/", origin).pathname;
  return apiUrl && pathname.startsWith(`${apiUrl}/`)
    ? pathname.slice(apiUrl.length)
    : pathname;
}

function matchNestedApiPath(pattern: string, pathname: string): Record<string, string> | undefined {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) {
    return undefined;
  }
  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index++) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return undefined;
    }
  }
  return params;
}

function runNestedApiHandler(source: string, context: Record<string, unknown>): unknown {
  const trimmed = source.trim();
  const body = shouldReturnNestedApiExpression(trimmed) ? `return (${source});` : source;
  return new Function(
    "$state",
    "$requestBody",
    "$pathParams",
    "$queryParams",
    "$requestHeaders",
    "Errors",
    body,
  )(
    context.$state,
    context.$requestBody,
    context.$pathParams,
    context.$queryParams,
    context.$requestHeaders,
    {
      HttpError: (status: number, body: unknown) => {
        throw { __xmluiHttpError: true, status, body };
      },
    },
  );
}

function shouldReturnNestedApiExpression(source: string): boolean {
  return !/[;{}]/.test(source) && !/^(return|if|for|while|switch|const|let|var)\b/.test(source);
}

function isNestedHttpError(error: unknown): error is {
  __xmluiHttpError: true;
  status: number;
  body: unknown;
} {
  return Boolean(error && typeof error === "object" && (error as { __xmluiHttpError?: unknown }).__xmluiHttpError);
}

function injectConfigGlobals(source: string, config: unknown): string {
  const globals = extractConfigGlobals(config);
  const entries = Object.entries(globals).filter(([name]) => !hasGlobal(source, name));
  if (entries.length === 0) {
    return source;
  }
  const insertionPoint = findOpeningAppTagEnd(source);
  if (insertionPoint < 0) {
    return source;
  }
  const attributes = entries
    .map(([name, value]) => ` global.${name}="${escapeAttribute(`{${JSON.stringify(value)}}`)}"`)
    .join("");
  return `${source.slice(0, insertionPoint)}${attributes}${source.slice(insertionPoint)}`;
}

function extractConfigGlobals(config: unknown): Record<string, unknown> {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return {};
  }
  const normalized = config as Record<string, unknown>;
  const globals: Record<string, unknown> = {};
  if (normalized.appGlobals && typeof normalized.appGlobals === "object" && !Array.isArray(normalized.appGlobals)) {
    Object.assign(globals, normalized.appGlobals);
  }
  if (typeof normalized.name === "string" && globals.name === undefined) {
    globals.name = normalized.name;
  }
  return Object.fromEntries(
    Object.entries(globals).filter(([, value]) => value == null || isJsonCompatible(value)),
  );
}

function isJsonCompatible(value: unknown): boolean {
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonCompatible);
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(isJsonCompatible);
  }
  return false;
}

function hasGlobal(source: string, name: string): boolean {
  return new RegExp(`\\bglobal\\.${escapeRegExp(name)}\\s*=`).test(source);
}

function findOpeningAppTagEnd(source: string): number {
  const start = source.search(/<App(\s|>|\/)/);
  if (start < 0) {
    return -1;
  }
  let quote: string | undefined;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === ">" || (char === "/" && source[index + 1] === ">")) {
      return index;
    }
  }
  return -1;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
