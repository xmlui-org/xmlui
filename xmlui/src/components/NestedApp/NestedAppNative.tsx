import type { CSSProperties, ReactNode } from "react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";

import { AppRoot } from "../../components-core/rendering/AppRoot";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { errReportComponent, xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import { ApiInterceptorProvider } from "../../components-core/interception/ApiInterceptorProvider";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import type { CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useComponentRegistry } from "../ComponentRegistryContext";
import { useIndexerContext } from "../App/IndexerContext";
import { useApiInterceptorContext } from "../../components-core/interception/useApiInterceptorContext";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import styles from "./NestedApp.module.scss";
import classnames from "classnames";
import {
  StyleInjectionTargetContext,
  StyleProvider,
  useStyles,
} from "../../components-core/theming/StyleContext";

type NestedAppProps = {
  api?: any;
  app: string;
  components?: any[];
  config?: any;
  activeTone?: ThemeTone;
  activeTheme?: string;
  height?: string | number;
  style?: CSSProperties;
  refreshVersion?: number;
  withSplashScreen?: boolean;
  className?: string;
};

function AnimatedLogo() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>Loading XMLUI App...</div>
      <div className={styles.logoWrapper}>
        <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
          {/* Unchanged inner paths */}
          <path
            d="M9.04674 19.3954C8.2739 19.3954 7.60226 19.2265 7.03199 18.8887C6.47443 18.5384 6.0435 18.0505 5.73938 17.425C5.43526 16.7869 5.2832 16.0362 5.2832 15.173V9.89961C5.2832 9.7745 5.32771 9.66815 5.41637 9.58059C5.50502 9.493 5.61275 9.44922 5.73938 9.44922H7.41222C7.55157 9.44922 7.6593 9.493 7.73524 9.58059C7.8239 9.66815 7.86841 9.7745 7.86841 9.89961V15.0604C7.86841 16.6117 8.55895 17.3874 9.94021 17.3874C10.5991 17.3874 11.1187 17.181 11.4988 16.7681C11.8917 16.3553 12.0881 15.786 12.0881 15.0604V9.89961C12.0881 9.7745 12.1325 9.66815 12.2211 9.58059C12.3098 9.493 12.4175 9.44922 12.5443 9.44922H14.217C14.3436 9.44922 14.4513 9.493 14.54 9.58059C14.6288 9.66815 14.6732 9.7745 14.6732 9.89961V18.7574C14.6732 18.8825 14.6288 18.9888 14.54 19.0764C14.4513 19.164 14.3436 19.2078 14.217 19.2078H12.6773C12.538 19.2078 12.4239 19.164 12.3352 19.0764C12.2591 18.9888 12.2211 18.8825 12.2211 18.7574V17.988C11.879 18.4258 11.4545 18.7699 10.9476 19.0201C10.4407 19.2703 9.80704 19.3954 9.04674 19.3954Z"
            fill="#3367CC"
          />
          <path
            d="M17.6397 19.2104C17.5129 19.2104 17.4052 19.1666 17.3165 19.079C17.2279 18.9914 17.1835 18.8851 17.1835 18.76V9.90221C17.1835 9.7771 17.2279 9.67075 17.3165 9.58319C17.4052 9.4956 17.5129 9.45182 17.6397 9.45182H19.2174C19.3567 9.45182 19.4644 9.4956 19.5404 9.58319C19.6292 9.67075 19.6736 9.7771 19.6736 9.90221V18.76C19.6736 18.8851 19.6292 18.9914 19.5404 19.079C19.4644 19.1666 19.3567 19.2104 19.2174 19.2104H17.6397ZM17.5636 7.8379C17.4243 7.8379 17.3102 7.80038 17.2215 7.72531C17.1454 7.63773 17.1074 7.52514 17.1074 7.38751V6.03633C17.1074 5.91122 17.1454 5.80487 17.2215 5.71731C17.3102 5.62972 17.4243 5.58594 17.5636 5.58594H19.2933C19.4327 5.58594 19.5467 5.62972 19.6354 5.71731C19.7242 5.80487 19.7686 5.91122 19.7686 6.03633V7.38751C19.7686 7.52514 19.7242 7.63773 19.6354 7.72531C19.5467 7.80038 19.4327 7.8379 19.2933 7.8379H17.5636Z"
            fill="#3367CC"
          />

          {/* ✨ MODIFIED outer path for animation */}
          <path
            className={styles.animatedLogoPath}
            d="M23.0215 2.81748H2.53486V23.044H23.0215V2.81748Z"
            fill="none"
            stroke="#3367CC"
            strokeWidth="0.75"
          />
        </svg>
      </div>
    </div>
  );
}

export function LazyNestedApp({
  immediate,
  ...restProps
}: NestedAppProps & { immediate?: boolean }) {
  const [shouldRender, setShouldRender] = useState(immediate || false);
  useEffect(() => {
    if (!immediate) {
      startTransition(() => {
        setShouldRender(true);
      });
    }
  }, [immediate]);
  if (!shouldRender) {
    return null;
  }
  return <NestedApp {...restProps} />;
}

export function IndexAwareNestedApp(props: NestedAppProps & { immediate?: boolean }) {
  const { indexing } = useIndexerContext();
  if (indexing) {
    return null;
  }

  return <LazyNestedApp {...props} />;
}

export function NestedApp({
  api,
  app,
  components = EMPTY_ARRAY,
  config,
  activeTheme,
  activeTone,
  height,
  style,
  refreshVersion,
  withSplashScreen = false,
  className,
}: NestedAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef(null);
  const contentRootRef = useRef<Root | null>(null);
  const theme = useTheme();
  const toneToApply = activeTone || config?.defaultTone || theme?.activeThemeTone;
  const componentRegistry = useComponentRegistry();
  const parentInterceptorContext = useApiInterceptorContext();
  const [initialized, setInitialized] = useState(!withSplashScreen);
  const [revealAnimationFinished, setRevealAnimationFinished] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Handle click outside to reset focus
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleContainerClick = useCallback(() => {
    setIsFocused(true);
  }, []);

  //TODO illesg: we should come up with something to make sure that nestedApps don't overwrite each other's mocked api endpoints
  //   disabled for now, as it messes up the paths of not mocked APIs (e.g. resources/{staticJsonfiles})
  //const safeId = playgroundId || nestedAppId;
  //const apiUrl = api ? `/${safeId.replaceAll(":", "")}` : '';
  const apiUrl = "";

  const mock = useMemo(() => {
    if (!api) {
      return undefined;
    }
    let apiObject = api;
    if (typeof api === "string") {
      try {
        apiObject = JSON.parse(api.replaceAll("\n", " "));
      } catch (e) {
        console.error("Failed to parse API definition", e);
        return undefined;
      }
    }
    return {
      ...apiObject,
      type: "in-memory",
      // apiUrl: apiUrl + (apiObject.apiUrl || ""),
    };
  }, [api]);

  useIsomorphicLayoutEffect(() => {
    if (!shadowRef.current && rootRef.current) {
      // Clone existing style and link tags
      shadowRef.current = rootRef.current.attachShadow({ mode: "open" });
      let style = document.createElement("style");

      // since we are using shadow DOM, we need to define the layers here
      // to ensure that the styles are applied correctly (the adopted styleheets setting is asynchronous, so the layer order might not be respected if we don't do this)
      // MUST BE IN SYNC WITH THE STYLESHEET ORDER IN index.scss
      style.innerHTML = "@layer reset, base, components, dynamic;";
      shadowRef.current.appendChild(style);

      // This should run once to prepare the stylesheets
      const sheetPromises = Array.from(document.styleSheets).map(async (sheet) => {
        // Check if the owner element has the attribute you want to skip
        if (
          sheet.ownerNode &&
          sheet.ownerNode instanceof Element &&
          sheet.ownerNode.hasAttribute("data-style-hash")
        ) {
          return null; // Skip this stylesheet
        }
        // Can't access cross-origin sheets, so skip them
        if (!sheet.href || sheet.href.startsWith(window.location.origin)) {
          try {
            // Create a new CSSStyleSheet object
            const newSheet = new CSSStyleSheet();
            // Get the CSS rules as text
            const cssText = Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join(" \n");
            // Apply the text to the new sheet object
            await newSheet.replace(cssText);
            return newSheet;
          } catch (e) {
            // console.error('Could not process stylesheet:', sheet.href, e);
            return null;
          }
        }
        return null;
      });

      // When your component mounts and the shadow root is available...
      void Promise.all(sheetPromises).then((sheets) => {
        // Filter out any sheets that failed to load
        const validSheets = sheets.filter(Boolean);

        // Apply the array of constructed stylesheets to the shadow root
        // This is synchronous and does not trigger new network requests
        shadowRef.current.adoptedStyleSheets = validSheets;
      });
    }
    if (!contentRootRef.current && shadowRef.current) {
      contentRootRef.current = ReactDOM.createRoot(shadowRef.current);
    }
  }, []);

  const onInit = useCallback(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(app);
    if (errors.length > 0) {
      component = errReportComponent(errors, "Main.xmlui", erroneousCompoundComponentName);
    }
    const compoundComponents: CompoundComponentDef[] = (components ?? []).map((src) => {
      const isErrorReportComponent = typeof src !== "string";
      if (isErrorReportComponent) {
        return src;
      }
      let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
        src as string,
      );
      if (errors.length > 0) {
        return errReportComponent(errors, `nested xmlui`, erroneousCompoundComponentName);
      }
      return component;
    });

    let globalProps = {
      name: config?.name,
      ...(config?.appGlobals || {}),
      apiUrl,
    };

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        <StyleInjectionTargetContext.Provider value={shadowRef.current}>
          <StyleProvider forceNew={true}>
            <ApiInterceptorProvider
              parentInterceptorContext={parentInterceptorContext}
              key={`app-${refreshVersion}`}
              interceptor={mock}
              waitForApiInterceptor={true}
            >
              <NestedAppRoot themeStylesToReset={theme.themeStyles}>
                <AppRoot
                  onInit={onInit}
                  isNested={true}
                  previewMode={true}
                  standalone={true}
                  trackContainerHeight={height ? "fixed" : "auto"}
                  node={component}
                  globalProps={globalProps}
                  defaultTheme={activeTheme || config?.defaultTheme}
                  defaultTone={toneToApply as ThemeTone}
                  contributes={{
                    compoundComponents,
                    themes: config?.themes,
                  }}
                  resources={config?.resources}
                  extensionManager={componentRegistry.getExtensionManager()}
                />
              </NestedAppRoot>
            </ApiInterceptorProvider>
          </StyleProvider>
        </StyleInjectionTargetContext.Provider>
      </ErrorBoundary>,
    );
  }, [
    onInit,
    activeTheme,
    app,
    componentRegistry,
    components,
    config?.appGlobals,
    config?.defaultTheme,
    config?.name,
    config?.resources,
    config?.themes,
    height,
    mock,
    parentInterceptorContext,
    style,
    theme.themeStyles,
    toneToApply,
    refreshVersion,
  ]);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        // Unmount the content root after a delay (and only if the component is not mounted anymore, could happen in dev mode - double useEffect call)
        if (!mountedRef.current) {
          contentRootRef.current?.unmount();
          contentRootRef.current = null;
        }
      }, 0);
    };
  }, []);

  const animationFinished = useCallback(() => {
    setRevealAnimationFinished(true);
  }, []);

  const shouldAnimate = withSplashScreen && !revealAnimationFinished;
  const containerStyle = isFocused ? { zIndex: 1 } : undefined;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={containerStyle}
      className={classnames(styles.nestedAppPlaceholder, className)}
    >
      {shouldAnimate && <AnimatedLogo />}
      <div
        ref={rootRef}
        onTransitionEnd={animationFinished}
        className={classnames(styles.nestedAppRoot, {
          [styles.shouldAnimate]: shouldAnimate,
          [styles.initialized]: initialized,
        })}
      />
    </div>
  );
}

function NestedAppRoot({
  children,
  themeStylesToReset,
}: {
  children: ReactNode;
  themeStylesToReset?: Record<string, string>;
}) {
  // css variables are leaking into to shadow dom, so we reset them here
  const themeVarReset = useMemo(() => {
    const vars = {};
    Object.keys(themeStylesToReset).forEach((key) => {
      vars[key] = "initial";
    });
    return vars;
  }, [themeStylesToReset]);

  const resetClassName = useStyles(themeVarReset, { prepend: true });

  return (
    <div className={classnames(resetClassName, styles.shadowRoot)} id={"nested-app-root"}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
