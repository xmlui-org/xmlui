import { useRef, useEffect, useMemo, useId, useState } from "react";
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
import { setupWorker } from "msw/browser";
import { CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { Tooltip } from "./Tooltip";
import { useTheme } from "../../components-core/theming/ThemeContext";

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
};

export function NestedApp({
  api,
  app,
  components = [],
  config,
  activeTheme,
  activeTone,
  title,
  height,
  allowPlaygroundPopup = true,
}: NestedAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRootRef = useRef<Root | null>(null);
  const nestedAppId = useId();
  const [refreshVersion, setRefreshVersion] = useState(0);
  const theme = useTheme();
  const toneToApply = activeTone || config?.defaultTone || theme?.activeThemeTone;

  const apiWorker = useMemo(() => {
    // console.log("HERE");
    if (typeof document !== "undefined") {
      return setupWorker();
    }
  }, [nestedAppId]);

  useEffect(() => {
    apiWorker?.start({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
    return () => apiWorker?.stop();
  }, [apiWorker]);

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

  useEffect(() => {
    if (!contentRootRef.current && rootRef.current) {
      contentRootRef.current = ReactDOM.createRoot(rootRef.current);
    }
    let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
      `<Fragment xmlns:XMLUIExtensions="component-ns">${app}</Fragment>`,
    );
    if (errors.length > 0) {
      component = errReportComponent(errors, "Main.xmlui", erroneousCompoundComponentName);
    }
    const compoundComponents: CompoundComponentDef[] = components ?? [].map((src) => {
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

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        <ApiInterceptorProvider interceptor={mock} apiWorker={apiWorker}>
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
                        // TODO: Open the app in a new window
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
            <div style={{ height }}>
              <AppRoot
                key={`app-${nestedAppId}-${refreshVersion}`}
                previewMode={true}
                standalone={true}
                trackContainerHeight={true}
                node={component}
                globalProps={globalProps}
                defaultTheme={activeTheme || config?.defaultTheme}
                defaultTone={toneToApply as ThemeTone}
                contributes={{
                  compoundComponents,
                  themes: config?.themes,
                }}
                resources={config?.resources}
              />
            </div>
          </div>
        </ApiInterceptorProvider>
      </ErrorBoundary>,
    );
  }, [
    nestedAppId,
    toneToApply,
    activeTheme,
    app,
    config,
    config?.themes,
    config?.name,
    config?.appGlobals,
    config?.resources,
    config?.defaultTheme,
    config?.defaultTone,
    components,
    mock,
    apiWorker,
    refreshVersion,
  ]);
  return (
    <div className={styles.nestedApp}>
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
    </div>
  );
}
