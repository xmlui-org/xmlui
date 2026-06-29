import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import {
  collectComponentThemeDefaults,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
  resolveThemeVariablesWithCssVars,
  themeVariablesToCssProperties,
} from "../../styling/theme";
import type { XmluiAdapterRendererProps } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import { ProfileMenuProvider } from "../ProfileMenu/ProfileMenuContext";
import { AppLayoutContext, type AppLayoutType } from "./AppLayoutContext";
import { AppMd } from "./App";
import { AppShellProvider } from "./AppShellContext";
import { defaultProps } from "./App.defaults";

const CONTENT_THEME_VARS = {
  backgroundColor: "backgroundColor-content-App",
  borderLeft: "borderLeft-content-App",
  maxWidth: "maxWidth-content-App",
  paddingHorizontal: "paddingHorizontal-content-App",
  paddingVertical: "paddingVertical-content-App",
  gap: "gap-content-App",
} as const;

export function App({ adapter }: XmluiAdapterRendererProps) {
  const themeVariables = useThemeVariables();
  const mergedThemeVariables = mergeThemeVariableLayers([
    collectComponentThemeDefaults(AppMd),
    themeVariables,
    appThemeVariableProps(adapter.props),
  ]);

  const rootAttrs = adapter.rootAttrs();
  const rootStyle = appShellStyle(rootAttrs.style as CSSProperties | undefined);
  const testId = adapter.stringProp("testId");
  const fitContent = adapter.booleanProp("fitContent", defaultProps.fitContent);
  const loggedInUser = adapter.prop("loggedInUser", null);
  const appProps = adapter.props;
  const layout = normalizeLayout(adapter.stringProp("layout"));
  const scrollWholePage = adapter.booleanProp("scrollWholePage", defaultProps.scrollWholePage);
  const showDrawerToggle = useVisibleNavPanel(adapter);
  const [navPanelCollapsed, setNavPanelCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [subNavPanelSlot, setSubNavPanelSlot] = useState<HTMLElement | null>(null);
  const children = layout.value === "desktop"
    ? adapter.node.children.filter((child) => child.kind !== "element" || child.type !== "NavPanel")
    : adapter.node.children;
  const readyFiredRef = useRef(false);
  const appLayoutContext = useMemo(() => ({
    layout: layout.value as AppLayoutType,
    navPanelVisible: showDrawerToggle,
    navPanelCollapsed,
    setNavPanelCollapsed,
    toggleNavPanelCollapsed: () => setNavPanelCollapsed((current) => !current),
    drawerVisible,
    showDrawer: () => setDrawerVisible(true),
    hideDrawer: () => setDrawerVisible(false),
    toggleDrawer: () => setDrawerVisible((current) => !current),
    hasRegisteredNavPanel: showDrawerToggle,
    hasRegisteredHeader: adapter.node.children.some(
      (child) => child.kind === "element" && child.type === "AppHeader",
    ),
    logo: adapter.stringProp("logo"),
    logoDark: adapter.stringProp("logoDark"),
    logoLight: adapter.stringProp("logoLight"),
    registerSubNavPanelSlot: setSubNavPanelSlot,
    subNavPanelSlot,
    scrollWholePage,
  }), [
    adapter,
    drawerVisible,
    layout.value,
    navPanelCollapsed,
    scrollWholePage,
    showDrawerToggle,
    subNavPanelSlot,
  ]);

  adapter.scope.i18n?.setConfig({
    locale: adapter.stringProp("locale"),
    bundles: adapter.prop("localeBundles"),
  });

  useEffect(() => {
    const name = adapter.stringProp("name");
    if (name) {
      document.title = name;
    }
  }, [adapter]);

  useEffect(() => {
    if (readyFiredRef.current) {
      return;
    }
    readyFiredRef.current = true;
    void adapter.event("ready")();
  }, [adapter]);

  useEffect(() => {
    adapter.scope.routing?.setNavigationHandlers({
      onWillNavigate: (to, queryParams) => adapter.event("willNavigate")(to, queryParams),
      onDidNavigate: (to, queryParams) => adapter.event("didNavigate")(to, queryParams),
    });
    return () => {
      adapter.scope.routing?.setNavigationHandlers({});
    };
  }, [adapter]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      void adapter.event("messageReceived")(event.data, event);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [adapter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      void adapter.event("keyDown")(event);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      void adapter.event("keyUp")(event);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [adapter]);

  return (
    <ProfileMenuProvider loggedInUser={normalizeLoggedInUser(loggedInUser)}>
      <AppShellProvider showDrawerToggle={showDrawerToggle}>
        <AppLayoutContext.Provider value={appLayoutContext}>
          <div
            {...rootAttrs}
            data-testid={testId}
            data-xmlui-app-fit-content={fitContent ? "true" : undefined}
            className={[rootAttrs.className, ...layout.classNames, scrollWholePage && "scrollWholePage"].filter(Boolean).join(" ")}
            style={{
              ...rootStyle,
              ...themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(mergedThemeVariables)),
              ...appBaselineStyle(mergedThemeVariables),
              ...appContainerStyle(fitContent),
              ...appShellStyle(adapter.style),
            }}
          >
            <main
              data-xmlui-component="App"
              data-xmlui-part="content"
              style={contentAreaStyle(mergedThemeVariables, fitContent, appProps)}
            >
              <div
                data-xmlui-component="App"
                data-xmlui-part="pageContent"
                style={pageContentStyle(mergedThemeVariables, appProps)}
              >
                {adapter.renderChildren(children)}
              </div>
            </main>
          </div>
        </AppLayoutContext.Provider>
      </AppShellProvider>
    </ProfileMenuProvider>
  );
}

function appShellStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return undefined;
  }
  const { alignItems, justifyContent, ...rest } = style;
  return rest;
}

function normalizeLoggedInUser(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, string> : null;
}

function appContainerStyle(fitContent: boolean): CSSProperties {
  return {
    width: "100%",
    minHeight: fitContent ? undefined : "100vh",
    height: fitContent ? undefined : "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    isolation: "isolate",
  };
}

function appBaselineStyle(themeVariables: Record<string, unknown>): CSSProperties {
  return {
    backgroundColor: themeValue(themeVariables, "backgroundColor"),
    color: themeValue(themeVariables, "textColor") ?? themeValue(themeVariables, "textColor-primary"),
    fontFamily: themeValue(themeVariables, "fontFamily"),
    fontFeatureSettings: themeValue(themeVariables, "font-feature-settings"),
    fontSize: themeValue(themeVariables, "fontSize"),
    fontWeight: themeValue(themeVariables, "fontWeight"),
    letterSpacing: themeValue(themeVariables, "letterSpacing"),
    lineHeight: themeValue(themeVariables, "lineHeight"),
  };
}

function contentAreaStyle(
  themeVariables: Record<string, unknown>,
  fitContent: boolean,
  props: Record<string, unknown>,
): CSSProperties {
  const paddingHorizontal = appContentValue(themeVariables, props, CONTENT_THEME_VARS.paddingHorizontal);
  const paddingVertical = appContentValue(themeVariables, props, CONTENT_THEME_VARS.paddingVertical);
  return {
    position: "relative",
    minWidth: 0,
    minHeight: fitContent ? undefined : 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    backgroundColor: appContentValue(themeVariables, props, CONTENT_THEME_VARS.backgroundColor),
    borderLeft: appContentValue(themeVariables, props, CONTENT_THEME_VARS.borderLeft),
    paddingInlineStart: paddingHorizontal,
    paddingInlineEnd: paddingHorizontal,
    paddingTop: paddingVertical,
    paddingBottom: paddingVertical,
    gap: appContentValue(themeVariables, props, CONTENT_THEME_VARS.gap),
  };
}

function pageContentStyle(
  themeVariables: Record<string, unknown>,
  props: Record<string, unknown>,
): CSSProperties {
  const paddingHorizontal = appContentValue(themeVariables, props, CONTENT_THEME_VARS.paddingHorizontal);
  const paddingVertical = appContentValue(themeVariables, props, CONTENT_THEME_VARS.paddingVertical);
  return {
    maxWidth: appContentValue(themeVariables, props, CONTENT_THEME_VARS.maxWidth),
    width: "100%",
    margin: "0 auto",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    paddingInlineStart: paddingHorizontal,
    paddingInlineEnd: paddingHorizontal,
    paddingTop: paddingVertical,
    paddingBottom: paddingVertical,
    gap: appContentValue(themeVariables, props, CONTENT_THEME_VARS.gap),
  };
}

function appContentValue(
  themeVariables: Record<string, unknown>,
  props: Record<string, unknown>,
  name: string,
): string | undefined {
  const propValue = props[name];
  if (propValue !== undefined && propValue !== null && propValue !== "") {
    return String(resolveThemeReferences(propValue));
  }
  return themeValue(themeVariables, name);
}

function themeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}

function appThemeVariableProps(props: Record<string, unknown>): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    if (/-App(?:-|$)/.test(name)) {
      variables[name] = value;
    }
  }
  return variables;
}

function useVisibleNavPanel(adapter: XmluiAdapterRendererProps["adapter"]): boolean {
  const dependencies = useMemo(() => adapter.node.children.flatMap((child) => {
    if (child.kind !== "element" || child.type !== "NavPanel") {
      return [];
    }
    const parsedWhen = child.parsed?.props?.when;
    return Array.isArray(parsedWhen) ? [] : parsedWhen?.dependencies ?? [];
  }), [adapter.node.children]);
  useBindingRevision(dependencies, adapter.scope);
  return adapter.node.children.some((child) => {
    if (child.kind !== "element" || child.type !== "NavPanel") {
      return false;
    }
    const when = child.props.when as unknown;
    const parsedWhen = child.parsed?.props?.when;
    if (parsedWhen && !Array.isArray(parsedWhen)) {
      const source = typeof when === "string" ? when : String(when ?? "");
      return Boolean(evaluateExpressionOrText(source, parsedWhen, adapter.scope, "App:NavPanel:when"));
    }
    return when !== false && when !== "false" && when !== "{false}";
  });
}

function normalizeLayout(value: string | undefined): { value: string; classNames: string[] } {
  const raw = (value ?? "condensed-sticky")
    .replace(/[\u2011\u2013\u2014]/g, "-")
    .trim();
  const supported = new Set([
    "horizontal",
    "horizontal-sticky",
    "condensed",
    "condensed-sticky",
    "vertical",
    "vertical-sticky",
    "vertical-full-header",
    "desktop",
  ]);
  const normalized = supported.has(raw) ? raw : "condensed-sticky";
  if (raw && !supported.has(raw)) {
    console.warn(`App layout type not supported: ${raw}`);
  }
  const classNames = ["xmlui-App"];
  if (normalized === "desktop") {
    classNames.push("desktop");
  } else if (normalized.startsWith("vertical")) {
    classNames.push("vertical");
  } else {
    classNames.push("horizontal");
  }
  if (normalized.includes("condensed")) {
    classNames.push("condensed");
  }
  if (normalized.includes("sticky")) {
    classNames.push("sticky");
  }
  if (normalized === "vertical-full-header") {
    classNames.push("verticalFullHeader");
  }
  return { value: normalized, classNames };
}

export function getAppLayoutOrientation(appLayout?: string) {
  switch (appLayout) {
    case "vertical":
    case "vertical-sticky":
    case "vertical-full-header":
      return "vertical";
    default:
      return "horizontal";
  }
}
