import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
import { EMPTY_ARRAY } from "../../components-core/constants";
import { createQueryString } from "./utils";
import { useAppContext } from "../../components-core/AppContext";
import { useComponentRegistry } from "../ComponentRegistryContext";

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

export function NestedApp({
  api,
  app,
  components = EMPTY_ARRAY,
  config,
  activeTheme,
  activeTone,
  title,
  height,
  allowPlaygroundPopup = true,
  withFrame = true,
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

  const [apiWorker, setApiWorker] = useState(undefined);

  useEffect(() => {
    let worker;
    (async function () {
      const { setupWorker } = await import("msw/browser");
      worker = setupWorker();
      worker.start({
        onUnhandledRequest: "bypass",
        quiet: true,
      });
      setApiWorker(worker);
    })();
    return () => worker?.stop();
  }, []);

  // console.log("apiWorker", apiWorker);

  const mock = useMemo(() => {
    return api
      ? {
          type: "in-memory",
          ...api,
          apiUrl: "/api",
        }
      : undefined;
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
  }, [app, components, title, activeTheme, activeTone, useHashBasedRouting]);

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
    let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
      `<Fragment xmlns:XMLUIExtensions="component-ns">${app}</Fragment>`,
    );
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
      apiUrl: "",
    };

    // css variables are leaking into to shadow dom, so we reset them here
    const themeVarReset = {};
    Object.keys(theme.themeStyles).forEach((key) => {
      themeVarReset[key] = "initial";
    });

    let nestedAppRoot = (
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
    );

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        <ApiInterceptorProvider interceptor={mock} apiWorker={apiWorker}>
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
                    label="Edit code in new window"
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
        </ApiInterceptorProvider>
      </ErrorBoundary>,
    );
  }, [
    activeTheme,
    allowPlaygroundPopup,
    apiWorker,
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
  ]);

  useEffect(() => {
    return () => {
      setTimeout(()=>{
        contentRootRef.current?.unmount();
        contentRootRef.current = null;
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
