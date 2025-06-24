import { startTransition, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";
import styles from "./NestedApp.module.scss";

import { AppRoot } from "../../components-core/rendering/AppRoot";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { LiaUndoAltSolid } from "react-icons/lia";
import { RxOpenInNewWindow } from "react-icons/rx";
import { errReportComponent, xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import { ApiInterceptorProvider } from "../../components-core/interception/ApiInterceptorProvider";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import type { CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { Tooltip } from "./Tooltip";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { createQueryString } from "./utils";
import { useAppContext } from "../../components-core/AppContext";
import { useComponentRegistry } from "../ComponentRegistryContext";
import { useIndexerContext } from "../App/IndexerContext";
import { useApiInterceptorContext } from "../../components-core/interception/useApiInterceptorContext";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { defaultProps } from "./defaultProps";

type NestedAppProps = {
  api?: any;
  app: string;
  components?: any[];
  config?: any;
  activeTone?: ThemeTone;
  activeTheme?: string;
  title?: string;
  height?: string | number;
  allowPlaygroundPopup?: boolean;
  withFrame?: boolean;
};

export function LazyNestedApp(props) {
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

export function IndexAwareNestedApp(props) {
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
  title,
  height,
  allowPlaygroundPopup = defaultProps.allowPlaygroundPopup,
  withFrame = defaultProps.withFrame,
}: NestedAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef(null);
  const contentRootRef = useRef<Root | null>(null);
  const nestedAppId = useId();
  const [refreshVersion, setRefreshVersion] = useState(0);
  const theme = useTheme();
  const toneToApply = activeTone || config?.defaultTone || theme?.activeThemeTone;
  const { appGlobals } = useAppContext();
  const componentRegistry = useComponentRegistry();
  const { interceptorWorker } = useApiInterceptorContext();
  //TODO illesg: we should come up with something to make sure that nestedApps doesn't overwrite each other's mocked api endpoints
  //   disabled for now, as it messes up the paths of not mocked APIs (e.g. resources/{staticJsonfiles})
  //const safeId = playgroundId || nestedAppId;
  //const apiUrl = api ? `/${safeId.replaceAll(":", "")}` : '';
  const apiUrl = '';

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

  //console.log("mock", mock);

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
      useHashBasedRouting ? `/#/playground#${appQueryString}` : `/playground#${appQueryString}`,
      "_blank",
    );
  }, [app, components, title, activeTheme, api, activeTone, useHashBasedRouting]);

  useEffect(() => {
    if (!shadowRef.current && rootRef.current) {
      // Clone existing style and link tags
      shadowRef.current = rootRef.current.attachShadow({ mode: "open" });
      const styleSheets = document.querySelectorAll('style, link[rel="stylesheet"]');
      styleSheets.forEach((el) => {
        if (el.hasAttribute("data-theme-root")) {
          return;
        }
        shadowRef.current.appendChild(el.cloneNode(true));
      });
    }
    if (!contentRootRef.current && shadowRef.current) {
      contentRootRef.current = ReactDOM.createRoot(shadowRef.current);
    }
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
      <ApiInterceptorProvider interceptor={mock} apiWorker={interceptorWorker}>
        <div style={{ height, ...themeVarReset }}>
          <AppRoot
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
            <div className={styles.header}>
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
    interceptorWorker,
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
    openPlayground,
    refreshVersion,
    theme.themeStyles,
    title,
    toneToApply,
    withFrame,
    apiUrl,
  ]);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        // Unmount the content root after a delay (and only it the component is not mounted anymore, could happen in dev mode - double useEffect call)
        if (!mountedRef.current) {
          contentRootRef.current?.unmount();
          contentRootRef.current = null;
        }
      });
    };
  }, []);

  return (
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
  );
}
