import type { ReactNode } from "react";
import { useId, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import classnames from "classnames";

import styles from "./Theme.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { useCompiledTheme } from "../../components-core/theming/ThemeProvider";
import { ThemeContext, useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import { NotificationToast } from "./NotificationToast";
import type { ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";
import { useIndexerContext } from "../App/IndexerContext";
import {
  useDomRoot,
  useStyleRegistry,
  useStyles,
} from "../../components-core/theming/StyleContext";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { parseHVar } from "../../components-core/theming/hvar";
import { THEME_VAR_PREFIX } from "../../components-core/theming/layout-resolver";

type Props = {
  id?: string;
  isRoot?: boolean;
  applyIf?: boolean;
  disableInlineStyle?: boolean;
  layoutContext?: LayoutContext;
  renderChild?: RenderChildFn;
  node?: ComponentDef;
  tone?: ThemeTone;
  toastDuration?: number;
  themeVars?: Record<string, string>;
  children?: ReactNode;
};

export const defaultProps = {
  isRoot: false,
  applyIf: true,
  toastDuration: 5000,
  themeVars: EMPTY_OBJECT,
  root: false,
};

export function Theme({
  id,
  isRoot = defaultProps.isRoot,
  applyIf,
  disableInlineStyle,
  renderChild,
  node,
  tone,
  toastDuration = defaultProps.toastDuration,
  themeVars = defaultProps.themeVars,
  layoutContext,
  children,
}: Props) {
  const generatedId = useId();

  const { themes, resources, resourceMap, activeThemeId } = useThemes();
  const { activeTheme, activeThemeTone, root } = useTheme();
  const themeTone = tone || activeThemeTone;
  const currentTheme: ThemeDefinition = useMemo(() => {
    const themeToExtend = id ? themes.find((theme) => theme.id === id)! : activeTheme;
    if (!themeToExtend) {
      throw new Error(
        `Theme not found: requested="${id}", available=[${themes.map((t) => t.id).join(", ")}]`,
      );
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
    console.log("Current theme:", foundTheme);
    return foundTheme;
  }, [activeTheme, generatedId, id, themeTone, themeVars, themes]);

  const {
    themeCssVars,
    getResourceUrl,
    fontLinks,
    allThemeVarsWithResolvedHierarchicalVars,
    getThemeVar,
  } = useCompiledTheme(currentTheme, themeTone, themes, resources, resourceMap);

  const transformedStyles = useMemo(() => {
    const filteredThemeCssVars = {};

    Object.entries({ ...themeCssVars, ...themeVars }).forEach(([key, value]) => {
      let componentName = parseHVar(key)?.component;
      if (
        !componentName ||
        componentName === "Input" ||
        componentName === "Heading" ||
        componentName === "ThemedInput" ||
        componentName === "Footer"
      ) {
        filteredThemeCssVars[key] = value;
      }
    });

    // --- Always add the explicitly specified themeVars with the correct prefix,
    // --- even if they don't match the componentName pattern
    Object.entries(themeVars).forEach(([key, value]) => {
      filteredThemeCssVars[`--${THEME_VAR_PREFIX}-${key}`] = value;
    });

    const ret = {
      "&": {
        ...filteredThemeCssVars,
        colorScheme: themeTone,
      },
    };

    if (isRoot) {
      ret["&"]["--screenSize"] = 0;

      const maxWidthPhone = getThemeVar("maxWidth-phone");
      const maxWidthLandscapePhone = getThemeVar("maxWidth-landscape-phone");
      const maxWidthTablet = getThemeVar("maxWidth-tablet");
      const maxWidthDesktop = getThemeVar("maxWidth-desktop");
      const maxWidthLargeDesktop = getThemeVar("maxWidth-large-desktop");

      ret[`@media (min-width: calc(${maxWidthPhone} + 1px))`] = {
        "&": {
          "--screenSize": 1,
        },
      };

      ret[`@media (min-width: calc(${maxWidthLandscapePhone} + 1px))`] = {
        "&": {
          "--screenSize": 2,
        },
      };

      ret[`@media (min-width: calc(${maxWidthTablet} + 1px))`] = {
        "&": {
          "--screenSize": 3,
        },
      };

      ret[`@media (min-width: calc(${maxWidthDesktop} + 1px))`] = {
        "&": {
          "--screenSize": 4,
        },
      };

      ret[`@media (min-width: calc(${maxWidthLargeDesktop} + 1px))`] = {
        "&": {
          "--screenSize": 5,
        },
      };
    }
    return ret;
  }, [isRoot, themeCssVars, themeTone, getThemeVar]);

  const className = useStyles(transformedStyles);

  const [currentThemeRoot, setCurrentThemeRoot] = useState(root);

  const currentThemeContextValue = useMemo(() => {
    const themeVal: ThemeScope = {
      root: currentThemeRoot,
      setRoot: setCurrentThemeRoot,
      activeThemeId,
      activeThemeTone: themeTone,
      activeTheme: currentTheme,
      themeStyles: themeCssVars,
      themeVars: allThemeVarsWithResolvedHierarchicalVars,
      getResourceUrl,
      getThemeVar,
      disableInlineStyle,
    };
    return themeVal;
  }, [
    activeThemeId,
    allThemeVarsWithResolvedHierarchicalVars,
    currentTheme,
    currentThemeRoot,
    getResourceUrl,
    getThemeVar,
    themeCssVars,
    themeTone,
    disableInlineStyle,
  ]);

  const { indexing } = useIndexerContext();

  const rootClasses = useMemo(() => {
    if (isRoot) {
      return [className, styles.root];
    }
    return EMPTY_ARRAY;
  }, [className, isRoot]);

  if (indexing) {
    return children;
  }

  // Use default value if applyIf is undefined
  const shouldApplyTheme = applyIf ?? defaultProps.applyIf;

  // If applyIf is false, render children unwrapped without theme context
  if (!shouldApplyTheme) {
    return (
      <>
        {renderChild && renderChild(node.children)}
        {children}
      </>
    );
  }

  if (isRoot) {
    const faviconUrl = getResourceUrl("resource:favicon") || "/resources/favicon.ico";
    return (
      <>
        <Helmet>
          {!!faviconUrl && <link rel="icon" type="image/svg+xml" href={faviconUrl} />}
          {fontLinks?.map((fontLink) => <link href={fontLink} rel={"stylesheet"} key={fontLink} />)}
        </Helmet>
        <RootClasses classNames={rootClasses} />
        <ErrorBoundary node={node} location={"theme-root"}>
          {renderChild && renderChild(node.children)}
          {children}
        </ErrorBoundary>
        <NotificationToast toastDuration={toastDuration} />
      </>
    );
  }

  // Only create a wrapper div if we're actually changing the theme context
  // or if we have explicit theme styles that need a CSS scope
  const needsWrapper =
    id !== undefined || Object.keys(themeVars).length > 0 || Object.keys(themeCssVars).length > 0;

  return (
    <ThemeContext.Provider value={currentThemeContextValue}>
      {needsWrapper ? (
        <>
          <div className={classnames(styles.themeWrapper, className)}>
            {renderChild &&
              renderChild(node.children, { ...layoutContext, themeClassName: className })}
            {children}
          </div>
          {root &&
            createPortal(
              <div
                className={classnames(styles.themeWrapper, className)}
                ref={(el) => {
                  if (el) {
                    setCurrentThemeRoot(el);
                  }
                }}
              ></div>,
              root,
            )}
        </>
      ) : (
        <>
          {renderChild && renderChild(node.children, layoutContext)}
          {children}
        </>
      )}
    </ThemeContext.Provider>
  );
}

type HtmlClassProps = {
  classNames: Array<string>;
};

/**
 * A render-less component that adds a class to the html tag during SSR
 * and on the client.
 */
export function RootClasses({ classNames = EMPTY_ARRAY }: HtmlClassProps) {
  const registry = useStyleRegistry();
  const domRoot = useDomRoot();

  useIsomorphicLayoutEffect(() => {
    // This runs on the client to handle dynamic updates.
    // The SSR part is handled by the render itself.
    if (typeof document !== "undefined") {
      const insideShadowRoot = domRoot instanceof ShadowRoot;
      let documentElement = insideShadowRoot
        ? domRoot.getElementById("nested-app-root")
        : document.documentElement;
      documentElement.classList.add(...classNames);
      // Clean up when the component unmounts to remove the class if needed.
      return () => {
        documentElement.classList.remove(...classNames);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNames]);

  // For SSR, we just add the class to the registry. The component renders nothing.
  registry.addRootClasses(classNames);

  return null;
}
