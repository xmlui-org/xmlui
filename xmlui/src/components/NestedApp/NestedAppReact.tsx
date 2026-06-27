import { useMemo, useState, type CSSProperties } from "react";

import { compileXmluiSource, throwFirstCompilerDiagnostic } from "../../compiler/compileXmluiSource";
import { createXmluiModule, XmluiRoot } from "../../runtime";
import type { ThemeTone } from "../../styling";
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
};

export function NestedAppComponent({
  activeTone,
  app,
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
  const compiled = useMemo(() => {
    const source = String(app ?? "").trim();
    if (!source) {
      return undefined;
    }
    try {
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
      return {
        module: createXmluiModule(result.runtimeDocument, compiledComponents),
        error: undefined,
      };
    } catch (error) {
      return {
        module: undefined,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [app, components, config]);
  const mergedStyle = {
    ...style,
    ...(height !== undefined ? { height } : null),
  } as CSSProperties;
  const effectiveRefreshVersion = `${String(refreshVersion ?? "")}:${resetVersion}`;
  const defaultTone = normalizeThemeTone(activeTone);
  const appView = compiled?.error ? (
    <pre className={styles.error} data-testid={testId ? `${testId}-error` : undefined}>
      {compiled.error}
    </pre>
  ) : compiled?.module?.kind === "app" ? (
    <XmluiRoot
      key={effectiveRefreshVersion}
      module={compiled.module}
      initialUrl="/"
      isolateRouting
      defaultTone={defaultTone}
    />
  ) : null;
  const content = showCode ? (
    <pre className={styles.code} data-testid={testId ? `${testId}-code` : undefined}>
      {String(app ?? "")}
    </pre>
  ) : (
    appView
  );
  const containerClassName = [
    styles.nestedAppContainer,
    withFrame ? styles.framed : null,
    className,
  ].filter(Boolean).join(" ");

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

function normalizeThemeTone(value: string | undefined): ThemeTone | undefined {
  return value === "dark" || value === "light" ? value : undefined;
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
