import { ReactNode, useId, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import classnames from "classnames";

import styles from "./Theme.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { useCompiledTheme } from "../../components-core/theming/ThemeProvider";
import { ThemeContext, useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { getVarKey } from "../../components-core/theming/themeVars";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import { NotificationToast } from "./NotificationToast";
import { useDevTools } from "../../components-core/InspectorContext";
import { ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";

function getClassName(css: string) {
  return `theme-${calculateHash(css)}`;
}

function calculateHash(str: string) {
  let hash = 0,
    i: number,
    chr: number;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

type Props = {
  id?: string;
  isRoot?: boolean;
  layoutContext?: LayoutContext;
  renderChild: RenderChildFn;
  node: ComponentDef;
  tone?: ThemeTone;
  toastDuration?: number;
  themeVars?: Record<string, string>;
  children?: ReactNode;
};

export function Theme({
  id,
  isRoot = false,
  renderChild,
  node,
  tone,
  toastDuration = 5000,
  themeVars = EMPTY_OBJECT,
  layoutContext,
  children,
}: Props) {
  const generatedId = useId();

  const { themes, resources, resourceMap, activeThemeId, setRoot, root } = useThemes();
  const { activeTheme, activeThemeTone } = useTheme();
  const themeTone = tone || activeThemeTone;
  const currentTheme: ThemeDefinition = useMemo(() => {
    const themeToExtend = id ? themes.find((theme) => theme.id === id)! : activeTheme;
    if (!themeToExtend) {
      throw new Error("Theme not found");
    }
    const foundTheme = {
      ...themeToExtend,
      id: generatedId,
      tones: {
        ...themeToExtend.tones,
        [themeTone]: {
          ...themeToExtend.tones?.[themeTone],
          themeVars: {
            ...themeToExtend.tones?.[themeTone]?.themeVars,
            ...themeVars,
          },
        },
      },
    };
    return foundTheme;
  }, [activeTheme, generatedId, id, themeTone, themeVars, themes]);

  const {
    themeCssVars,
    getResourceUrl,
    fontLinks,
    allThemeVarsWithResolvedHierarchicalVars,
    getThemeVar,
  } = useCompiledTheme(currentTheme, themeTone, themes, resources, resourceMap);

  const { css, className, rangeClassName, fromClass, toClass } = useMemo(() => {
    const vars = { ...themeCssVars, "color-scheme": themeTone };
    // const vars = themeCssVars;
    let css = Object.entries(vars)
      .map(([key, value]) => {
        return key + ":" + value + ";";
      })
      .join(" ");

    css += `font-family: var(${getVarKey("fontFamily")});`;
    const className = getClassName(css);
    const fromClass = `${className}-from`;
    const toClass = `${className}-to`;
    let rangeClassName;
    if (!isRoot) {
      rangeClassName = `${fromClass} ~ *:has(~ .${toClass})`;
      css += `color: var(${getVarKey("textColor-primary")});`;
    }
    return {
      className,
      rangeClassName,
      fromClass,
      toClass,
      css,
    };
  }, [isRoot, themeCssVars, themeTone]);

  // useInsertionEffect(() => {
  //   //PERF OPT IDEA: don't inject the css content that we already have
  //   // (e.g. in Items component we inject and generate classes for all items if we use a theme for an item, but they have the same content.
  //   // We could inject one class, and use that instead. The harder part is keeping track of them, and remove when nobody uses them)
  //   injectCSS(`.${className} {${css}}`, className);
  //   if (rangeClassName) {
  //     injectCSS(`.${rangeClassName} {${css}}`, rangeClassName);
  //   }
  //   let injectedClassNames = [className, rangeClassName];
  //   return () => {
  //     injectedClassNames.forEach(injectedClassName => {
  //       if (injectedClassName) {
  //         cleanupCss(injectedClassName);
  //       }
  //     });
  //   };
  // }, [className, css]);

  const [themeRoot, setThemeRoot] = useState(root);

  const currentThemeContextValue = useMemo(() => {
    const themeVal: ThemeScope = {
      root: themeRoot,
      activeThemeId,
      activeThemeTone: themeTone,
      activeTheme: currentTheme,
      themeStyles: themeCssVars,
      themeVars: allThemeVarsWithResolvedHierarchicalVars,
      getResourceUrl,
      getThemeVar,
    };
    return themeVal;
  }, [
    themeRoot,
    activeThemeId,
    themeTone,
    currentTheme,
    themeCssVars,
    allThemeVarsWithResolvedHierarchicalVars,
    getResourceUrl,
    getThemeVar,
  ]);

  const { devToolsSize, devToolsSide, devToolsEnabled } = useDevTools();

  const inspectStyle = useMemo(() => {
    return devToolsEnabled
      ? {
          paddingBottom: devToolsSide === "bottom" ? devToolsSize : 0,
          paddingLeft: devToolsSide === "left" ? devToolsSize : 0,
          paddingRight: devToolsSide === "right" ? devToolsSize : 0,
        }
      : {};
  }, [devToolsEnabled, devToolsSide, devToolsSize]);

  if (isRoot) {
    const faviconUrl = getResourceUrl("resource:favicon") || "/resources/favicon.ico";
    return (
      // <ThemeContext.Provider value={currentThemeContextValue}>
      <>
        <Helmet>
          {!!faviconUrl && <link rel="icon" type="image/svg+xml" href={faviconUrl} />}
          {fontLinks?.map((fontLink) => <link href={fontLink} rel={"stylesheet"} key={fontLink} />)}
        </Helmet>
        <style type="text/css" data-theme-root={true}>{`.${className}  {${css}}`}</style>
        <div
          style={inspectStyle}
          id={"_ui-engine-theme-root"}
          className={classnames(styles.baseRootComponent, className)}
          ref={(el) => {
            if (el) {
              setRoot(el);
            }
          }}
        >
          <ErrorBoundary node={node} location={"theme-root"}>
            {renderChild(node.children)}
            {children}
          </ErrorBoundary>
          <NotificationToast toastDuration={toastDuration} />
        </div>
      </>
      // </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={currentThemeContextValue}>
      <style>{`.${rangeClassName} {${css}}`}</style>
      <style>{`.${className} {${css}}`}</style>
      <div className={classnames(styles.from, fromClass)} />
      {renderChild(node.children, { ...layoutContext, themeClassName: className })}
      <div className={classnames(styles.to, toClass)} />
      {root &&
        createPortal(
          <div
            className={classnames(className)}
            ref={(el) => {
              if (el) {
                setThemeRoot(el);
              }
            }}
          ></div>,
          root,
        )}
    </ThemeContext.Provider>
  );
}
