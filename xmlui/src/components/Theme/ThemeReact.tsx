import type { ReactNode } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import classnames from "classnames";

import styles from "./Theme.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import {
  builtInThemes,
  ThemeContext,
  useTheme,
  useThemes,
} from "../../components-core/theming/ThemeContext";
import { compileThemeModel } from "../../components-core/theming/themeCompiler";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { defaultProps } from "./Theme.defaults";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import { NotificationToast } from "./NotificationToast";
import type { NotificationPosition } from "./NotificationToast";
import type { ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";
import { useIndexerContext } from "../App/IndexerContext";
import {
  useDomRoot,
  useStyleRegistry,
  useStyles,
} from "../../components-core/theming/StyleContext";
import type { StyleObjectType } from "../../components-core/theming/StyleRegistry";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { parseHVar } from "../../components-core/theming/hvar";
import { THEME_VAR_PREFIX } from "../../components-core/theming/layout-resolver";
import {
  generateBorderSegments,
  generatePaddingSegments,
} from "../../components-core/theming/transformThemeVars";
import { useComponentRegistry } from "../ComponentRegistryContext";
import baseStyles from "../../index.scss?inline";
import { getCSSInjectionAPI } from "../../components-core/cssInjectionRegistry";
import { useAppContext } from "../../components-core/AppContext";
import type { ThemeVarMetadata } from "../../component-core/metadata";

const STYLE_ID = "xmlui-base-styles";
const THEME_CSS_VAR_PREFIX = `--${THEME_VAR_PREFIX}-`;

type Props = {
  id?: string;
  isRoot?: boolean;
  applyIf?: boolean;
  disableInlineStyle?: boolean;
  disableInlineStyleExplicit?: boolean;
  layoutContext?: LayoutContext;
  renderChild?: RenderChildFn;
  node?: ComponentDef;
  tone?: ThemeTone;
  toastDuration?: number;
  notificationPosition?: NotificationPosition;
  themeVars?: Record<string, string>;
  children?: ReactNode;
};

export function Theme(props: Props) {
  const hasExplicitDisableInlineStyle = props.disableInlineStyleExplicit ??
    Object.prototype.hasOwnProperty.call(props, "disableInlineStyle");
  const {
    id,
    isRoot = defaultProps.isRoot,
    applyIf,
    disableInlineStyle,
    disableInlineStyleExplicit: _disableInlineStyleExplicit,
    renderChild,
    node,
    tone,
    toastDuration,
    notificationPosition,
    themeVars = defaultProps.themeVars,
    layoutContext,
    children,
  } = props;
  const generatedId = useId();
  const appContext = useAppContext();
  const notifications =
    appContext?.xmluiConfig?.notifications ?? appContext?.appGlobals?.notifications;
  const resolvedToastDuration =
    toastDuration ?? (typeof notifications?.duration === "number" ? notifications.duration : undefined) ?? defaultProps.toastDuration;
  const resolvedNotificationPosition =
    notificationPosition ?? notifications?.position ?? defaultProps.notificationPosition;

  const { themes, resources, resourceMap, activeThemeId, setActiveThemeTone } = useThemes();
  const {
    activeTheme,
    activeThemeTone,
    root,
    disableInlineStyle: parentDisableInlineStyle,
    disableInlineStyleIsExplicit: parentDisableInlineStyleIsExplicit,
  } = useTheme();
  const themeTone = tone || activeThemeTone;
  const generatedThemeVars = useMemo(
    () => generateBorderSegments(generatePaddingSegments(themeVars)),
    [themeVars],
  );
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
            ...generatedThemeVars,
          },
        },
      },
    };
    return foundTheme;
  }, [activeTheme, generatedId, generatedThemeVars, id, themeTone, themes]);

  const {
    themeCssVars,
    getResourceUrl,
    fontLinks,
    allThemeVarsWithResolvedHierarchicalVars,
    invalidThemeVarNames,
    getThemeVar,
  } = useScopedTheme(
    currentTheme,
    themeTone,
    themes,
    resources,
    resourceMap,
    appContext?.xmluiConfig?.strictTheming !== false,
  );
  const scopedThemeVars = useMemo(
    () => ({
      ...allThemeVarsWithResolvedHierarchicalVars,
      ...generatedThemeVars,
    }),
    [allThemeVarsWithResolvedHierarchicalVars, generatedThemeVars],
  );
  const componentRegistry = useComponentRegistry();

  const transformedStyles = useMemo(() => {
    const filteredThemeCssVars: StyleObjectType = {};

    // Only populate the full compiled theme CSS vars on the wrapper div when:
    //   1. An explicit `tone` is set — the wrapper must lock in a different tone's colors, OR
    //   2. An explicit `id` is set — the wrapper switches to a different theme definition, OR
    //   3. `themeVars` contains base vars (no component suffix, e.g. "color-primary") that
    //      influence derived vars computed at compile time.
    //
    // When none of these apply (e.g. layout-only overrides like "width-navPanel-App"),
    // skipping the compiled vars prevents the wrapper div from shadowing <html>'s CSS vars.
    // Shadowing causes tone-switching to break: <html> updates correctly but children
    // inherit the stale tone values from the closer ancestor div instead.
    const needsCompiledVars =
      tone !== undefined ||
      id !== undefined ||
      Object.keys(generatedThemeVars).some((key) => !parseHVar(key)?.component);

    if (needsCompiledVars) {
      Object.entries({ ...themeCssVars, ...generatedThemeVars }).forEach(([key, value]) => {
        // Strip the CSS variable prefix (e.g. "--xmlui-") before parsing so that
        // parseHVar correctly identifies the component part of a theme var name.
        // Without stripping, "--xmlui-backgroundColor" is parsed as component="backgroundColor"
        // instead of a base (no-component) var.
        const rawKey = stripThemeCssVarPrefix(key);
        if (invalidThemeVarNames.has(rawKey)) {
          return;
        }
        let componentName = parseHVar(rawKey)?.component;
        const registeredComponent = componentRegistry.lookupComponentRenderer(componentName || "");
        const inComponentThemeVars = componentRegistry.componentThemeVars.has(rawKey);
        const allowed =
          !componentName ||
          // Compound (user-defined) components pass through unconditionally as a
          // safety net for theme vars that aren't statically analyzable (e.g.,
          // dynamic expressions). The primary optimization path is via
          // componentThemeVars in ThemeProvider, populated from auto-generated
          // metadata in registerCompoundComponentRenderer.
          registeredComponent?.isCompoundComponent ||
          componentName === "Input" ||
          componentName === "Heading" ||
          componentName === "Footer" ||
          // Also allow any theme var explicitly referenced inside a user-defined
          // component's template (collected by generateUdComponentMetadata).
          // e.g. width="$width-Inc" inside IncrementButton → "width-Inc" is allowed
          // even though "Inc" is not a registered component name.
          inComponentThemeVars;
        if (allowed) {
          const resolvedValue = scopedThemeVars[rawKey] ?? value;
          filteredThemeCssVars[key] = resolvedValue;
        }
      });
    }

    // Always add the explicitly specified themeVars with the correct prefix,
    // even if they don't match the componentName pattern
    Object.entries(generatedThemeVars).forEach(([key, value]) => {
      if (invalidThemeVarNames.has(key)) {
        return;
      }
      const resolvedValue = scopedThemeVars[key] ?? value;
      filteredThemeCssVars[`--${THEME_VAR_PREFIX}-${key}`] = resolvedValue;
    });

    const rootStyles: StyleObjectType = {
      ...filteredThemeCssVars,
      colorScheme: themeTone,
    };
    const ret: StyleObjectType = {
      "&": rootStyles,
    };

    if (isRoot) {
      rootStyles["--screenSize"] = 0;

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
  }, [
    themeCssVars,
    generatedThemeVars,
    themeTone,
    isRoot,
    componentRegistry,
    scopedThemeVars,
    invalidThemeVarNames,
    getThemeVar,
  ]);

  const className = useStyles(transformedStyles, { layer: "themes" });

  const [currentThemeRoot, setCurrentThemeRoot] = useState(root);
  const currentThemeRootRef = useRef(currentThemeRoot);
  currentThemeRootRef.current = currentThemeRoot;
  const updatePortalThemeRoot = useCallback((el: HTMLDivElement | null) => {
    if (el && currentThemeRootRef.current !== el) {
      currentThemeRootRef.current = el;
      setCurrentThemeRoot(el);
    }
  }, []);

  const currentThemeContextValue = useMemo(() => {
    const themeVal: ThemeScope = {
      root: currentThemeRoot,
      setRoot: setCurrentThemeRoot,
      activeThemeId,
      activeThemeTone: themeTone,
      activeTheme: currentTheme,
      themeStyles: themeCssVars,
      themeVars: scopedThemeVars,
      getResourceUrl,
      getThemeVar,
      disableInlineStyle: disableInlineStyle ?? parentDisableInlineStyle,
      disableInlineStyleIsExplicit:
        hasExplicitDisableInlineStyle ? true : parentDisableInlineStyleIsExplicit,
    };
    return themeVal;
  }, [
    activeThemeId,
    currentTheme,
    currentThemeRoot,
    getResourceUrl,
    getThemeVar,
    scopedThemeVars,
    themeCssVars,
    themeTone,
    disableInlineStyle,
    hasExplicitDisableInlineStyle,
    parentDisableInlineStyle,
    parentDisableInlineStyleIsExplicit,
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
        {renderChild && renderChild(node?.children)}
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
          {renderChild && renderChild(node?.children)}
          {children}
        </ErrorBoundary>
        <NotificationToast
          toastDuration={resolvedToastDuration}
          notificationPosition={resolvedNotificationPosition}
        />
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
              renderChild(node?.children, { ...layoutContext, themeClassName: className })}
            {children}
          </div>
          {root &&
            createPortal(
              <div
                className={classnames(styles.themeWrapper, className)}
                ref={updatePortalThemeRoot}
              ></div>,
              root,
            )}
        </>
      ) : (
        <>
          {renderChild && renderChild(node?.children, layoutContext)}
          {children}
        </>
      )}
    </ThemeContext.Provider>
  );
}

function stripThemeCssVarPrefix(key: string): string {
  return key.startsWith(THEME_CSS_VAR_PREFIX) ? key.slice(THEME_CSS_VAR_PREFIX.length) : key;
}

function useScopedTheme(
  currentTheme: ThemeDefinition,
  themeTone: ThemeTone,
  themes: Array<ThemeDefinition>,
  resources: Record<string, string | import("../../abstractions/ThemingDefs").FontDef>,
  resourceMap: Record<string, string>,
  strictTheming: boolean,
) {
  const componentRegistry = useComponentRegistry();
  return useMemo(() => {
    const compiled = compileThemeModel({
      builtInThemes,
      customThemes: [currentTheme, ...themes],
      activeThemeId: currentTheme.id,
      defaultTone: themeTone,
      componentThemeMetadata: {
        componentThemeVars: componentRegistry.componentThemeVars,
        componentDefaultThemeVars: (componentRegistry.componentDefaultThemeVars ?? {}) as Record<string, any>,
        componentThemeVarDeclarations:
          (componentRegistry.componentThemeVarDeclarations ?? new Map()) as Map<string, ThemeVarMetadata>,
      },
      strictTheming,
      resources,
      resourceMap,
    });
    return {
      themeCssVars: compiled.themeCssVars,
      getResourceUrl: compiled.getResourceUrl,
      fontLinks: compiled.fontLinks,
      allThemeVarsWithResolvedHierarchicalVars: compiled.themeVars,
      invalidThemeVarNames: compiled.invalidThemeVarNames,
      getThemeVar: compiled.getThemeVar,
    };
  }, [componentRegistry, currentTheme, resourceMap, resources, strictTheming, themeTone, themes]);
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
  const isServer = typeof document === "undefined";

  useIsomorphicLayoutEffect(() => {
    // This runs on the client to handle dynamic updates.
    // The SSR part is handled by the render itself.
    if (typeof document !== "undefined") {
      const insideShadowRoot = domRoot instanceof ShadowRoot;
      const target = insideShadowRoot ? domRoot : document.head;
      let documentElement = insideShadowRoot
        ? domRoot.getElementById("nested-app-root")
        : document.documentElement;
      documentElement?.classList.add(...classNames);
      const portalContainer = insideShadowRoot
        ? domRoot.getElementById("nested-app-portal-root")
        : null;
      portalContainer?.classList.add(...classNames);

      const cssAPI = getCSSInjectionAPI();
      if (cssAPI) {
        cssAPI.injectCSS({ target });
      }

      // Clean up when the component unmounts to remove the class if needed.
      return () => {
        documentElement?.classList.remove(...classNames);
        portalContainer?.classList.remove(...classNames);
        // Skip removeCSS for shadow roots: unmounting one island must not strip
        // styles from all others. Shadow root GC reclaims styles when destroyed.
        if (cssAPI && !insideShadowRoot) {
          cssAPI.removeCSS();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNames]);

  // For SSR, collect the html classes and emit the base stylesheet into the head
  // so prerendered pages do not flash unstyled before hydration.
  registry.addRootClasses(classNames);

  if (isServer) {
    return (
      <Helmet>
        <style id={STYLE_ID}>{baseStyles}</style>
      </Helmet>
    );
  }

  return null;
}
