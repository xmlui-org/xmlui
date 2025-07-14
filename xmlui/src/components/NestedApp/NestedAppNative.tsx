import type { CSSProperties } from "react";
import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";
import styles from "./NestedApp.module.scss";
import classnames from "classnames";

import { AppRoot } from "../../components-core/rendering/AppRoot";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { LiaUndoAltSolid } from "react-icons/lia";
import { RxOpenInNewWindow } from "react-icons/rx";
import { errReportComponent, xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import { ApiInterceptorProvider } from "../../components-core/interception/ApiInterceptorProvider";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { Tooltip } from "./Tooltip";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { createQueryString } from "./utils";
import { useAppContext } from "../../components-core/AppContext";
import { useComponentRegistry } from "../ComponentRegistryContext";
import { useIndexerContext } from "../App/IndexerContext";
import { useApiInterceptorContext } from "../../components-core/interception/useApiInterceptorContext";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { defaultProps } from "./defaultProps";
import Logo from "./logo.svg?react";
import { Button } from "../Button/ButtonNative";
import { Markdown } from "../Markdown/MarkdownNative";

type NestedAppProps = {
  markdown?: string;
  api?: any;
  app: string;
  components?: any[];
  config?: any;
  activeTone?: ThemeTone;
  activeTheme?: string;
  title?: string;
  height?: string | number;
  allowPlaygroundPopup?: boolean;
  popOutUrl?: string;
  withFrame?: boolean;
  noHeader?: boolean;
  style?: CSSProperties;
  refVersion?: number;
};

export function LazyNestedApp(props: NestedAppProps) {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    startTransition(() => {
      setShouldRender(true);
    });
  }, []);
  if (!shouldRender) {
    return null;
  }
  return <NestedApp {...props} />;
}

export function IndexAwareNestedApp(props: NestedAppProps) {
  const { indexing } = useIndexerContext();
  if (indexing) {
    return null;
  }

  return <LazyNestedApp {...props} />;
}

export function NestedApp({
  markdown,
  api,
  app,
  components = EMPTY_ARRAY,
  config,
  activeTheme,
  activeTone,
  title,
  height,
  allowPlaygroundPopup = defaultProps.allowPlaygroundPopup,
  popOutUrl,
  withFrame = defaultProps.withFrame,
  noHeader = defaultProps.noHeader,
  style,
  refVersion = 0,
}: NestedAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef(null);
  const contentRootRef = useRef<Root | null>(null);
  const nestedAppId = useId();
  const [refreshVersion, setRefreshVersion] = useState(refVersion);
  const theme = useTheme();
  const toneToApply = activeTone || config?.defaultTone || theme?.activeThemeTone;
  const { appGlobals } = useAppContext();
  const componentRegistry = useComponentRegistry();
  const parentInterceptorContext = useApiInterceptorContext();

  useEffect(() => {
    setRefreshVersion(refVersion);
  }, [refVersion]);

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

  const useHashBasedRouting = appGlobals?.useHashBasedRouting || true;
  const openPlayground = useCallback(async () => {
    const data = {
      standalone: {
        app,
        components,
        config: {
          name: title,
          themes: [],
          defaultTheme: activeTheme,
        },
        api: api,
      },
      options: {
        fixedTheme: false,
        swapped: false,
        previewMode: false,
        orientation: "horizontal",
        activeTheme,
        activeTone,
        content: "app",
      },
    };
    const appQueryString = await createQueryString(JSON.stringify(data));
    window.open(
      useHashBasedRouting
        ? `${popOutUrl ?? ""}/#/playground#${appQueryString}`
        : `${popOutUrl ?? ""}/playground#${appQueryString}`,
      "_blank",
    );
  }, [app, components, title, activeTheme, api, activeTone, useHashBasedRouting, popOutUrl]);

  useLayoutEffect(() => {
    if (!shadowRef.current && rootRef.current) {
      // Clone existing style and link tags
      shadowRef.current = rootRef.current.attachShadow({ mode: "open" });

      // This should run once to prepare the stylesheets
      const sheetPromises = Array.from(document.styleSheets).map(async (sheet) => {
        // Check if the owner element has the attribute you want to skip
        if (
          sheet.ownerNode &&
          sheet.ownerNode instanceof Element &&
          sheet.ownerNode.hasAttribute("data-theme-root")
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
              .join(" ");
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
      Promise.all(sheetPromises).then((sheets) => {
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

    // css variables are leaking into to shadow dom, so we reset them here
    const themeVarReset = {};
    Object.keys(theme.themeStyles).forEach((key) => {
      themeVarReset[key] = "initial";
    });

    let nestedAppRoot = (
      <ApiInterceptorProvider
        parentInterceptorContext={parentInterceptorContext}
        interceptor={mock}
        waitForApiInterceptor={true}
      >
        <div style={{ height, ...style, ...themeVarReset }}>
          <AppRoot
            isNested={true}
            key={`app-${nestedAppId}-${refreshVersion}`}
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
        </div>
      </ApiInterceptorProvider>
    );

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        {withFrame ? (
          <div className={styles.nestedAppContainer}>
            {!noHeader && (
              <div className={classnames(styles.header)}>
                <span className={styles.headerText}>{title}</span>
                <div className={styles.spacer} />
                {allowPlaygroundPopup && (
                  <Tooltip
                    trigger={
                      <button
                        className={styles.headerButton}
                        onClick={() => {
                          openPlayground();
                        }}
                      >
                        <RxOpenInNewWindow />
                      </button>
                    }
                    label="View and edit in new full-width window"
                  />
                )}
                <Tooltip
                  trigger={
                    <button
                      className={styles.headerButton}
                      onClick={() => {
                        setRefreshVersion(refreshVersion + 1);
                      }}
                    >
                      <LiaUndoAltSolid />
                    </button>
                  }
                  label="Reset the app"
                />
              </div>
            )}
            {nestedAppRoot}
          </div>
        ) : (
          nestedAppRoot
        )}
      </ErrorBoundary>,
    );
  }, [
    activeTheme,
    allowPlaygroundPopup,
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
    nestedAppId,
    noHeader,
    openPlayground,
    parentInterceptorContext,
    refreshVersion,
    style,
    theme.themeStyles,
    title,
    toneToApply,
    withFrame,
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

  return (
    <>
      <div
        ref={rootRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          position: "relative",
          isolation: "isolate",
        }}
      />
    </>
  );
}
