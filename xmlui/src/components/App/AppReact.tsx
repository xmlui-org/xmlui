import type { CSSProperties } from "react";

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
import { AppMd } from "./App";
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
  const testId = adapter.stringProp("testId");
  const fitContent = adapter.booleanProp("fitContent", defaultProps.fitContent);
  const appProps = adapter.props;

  return (
    <div
      {...rootAttrs}
      data-testid={testId}
      data-xmlui-app-fit-content={fitContent ? "true" : undefined}
      style={{
        ...themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(mergedThemeVariables)),
        ...appBaselineStyle(mergedThemeVariables),
        ...appContainerStyle(fitContent),
        ...adapter.style,
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
          {adapter.renderChildren()}
        </div>
      </main>
    </div>
  );
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
    fontSize: themeValue(themeVariables, "font-size") ?? themeValue(themeVariables, "fontSize"),
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
