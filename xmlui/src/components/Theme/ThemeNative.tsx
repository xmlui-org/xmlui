import type { ReactNode } from "react";
import React, { useId, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import classnames from "classnames";

import styles from "./Theme.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { useCompiledTheme } from "../../components-core/theming/ThemeProvider";
import { ThemeContext, useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import { NotificationToast } from "./NotificationToast";
import { useDevTools } from "../../components-core/InspectorContext";
import type { ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";
import { useIndexerContext } from "../App/IndexerContext";

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

export const defaultProps = {
  isRoot: false,
  toastDuration: 5000,
  themeVars: EMPTY_OBJECT,
  root: false,
};

export function Theme({
  id,
  isRoot = defaultProps.isRoot,
  renderChild,
  node,
  tone,
  toastDuration = defaultProps.toastDuration,
  themeVars = defaultProps.themeVars,
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

  const { css, className } = useMemo(() => {
    const vars = { ...themeCssVars, "color-scheme": themeTone };
    // const vars = themeCssVars;
    let css = Object.entries(vars)
      .map(([key, value]) => {
        return key + ":" + value + ";";
      })
      .join(" ");

    const className = getClassName(css);
    if (isRoot) {
      css += `--screenSize: 0;`;
      const maxWidthPhone = getThemeVar("maxWidth-phone");
      const maxWidthLandscapePhone = getThemeVar("maxWidth-landscape-phone");
      const maxWidthTablet = getThemeVar("maxWidth-tablet");
      const maxWidthDesktop = getThemeVar("maxWidth-desktop");
      const maxWidthLargeDesktop = getThemeVar("maxWidth-large-desktop");
      const mediaClasses = ` @media (min-width: calc(${maxWidthPhone} + 1px)) {
        --screenSize: 1;
      }

      @media (min-width: calc(${maxWidthLandscapePhone} + 1px)) {
          --screenSize: 2;
      }
  
      @media (min-width: calc(${maxWidthTablet} + 1px)) {
          --screenSize: 3;
      }
  
      @media (min-width: calc(${maxWidthDesktop} + 1px)) {
          --screenSize: 4;
      }
  
      @media (min-width: calc(${maxWidthLargeDesktop} + 1px)) {
          --screenSize: 5;
      }
    `;
      css += mediaClasses;
    }
    return {
      className,
      css,
    };
  }, [isRoot, themeCssVars, themeTone, getThemeVar]);

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

  const { indexing } = useIndexerContext();
  if (indexing) {
    return children;
  }

  if (isRoot) {
    const faviconUrl = getResourceUrl("resource:favicon") || "/resources/favicon.ico";
    return (
      // <ThemeContext.Provider value={currentThemeContextValue}>
      <>
        <Helmet>
          {!!faviconUrl && <link rel="icon" type="image/svg+xml" href={faviconUrl} />}
          {fontLinks?.map((fontLink) => <link href={fontLink} rel={"stylesheet"} key={fontLink} />)}
        </Helmet>
        <style
          type="text/css"
          data-theme-root={true}
          dangerouslySetInnerHTML={{ __html: `.${className}  {${css}}` }}
        />
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
      <style type="text/css" dangerouslySetInnerHTML={{ __html: `.${className}  {${css}}` }} />
      <div className={classnames(styles.baseRootComponent, styles.wrapper, className)}>
        {renderChild(node.children, { ...layoutContext, themeClassName: className })}
      </div>
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
