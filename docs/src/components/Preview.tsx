import React, { useRef, useEffect, useMemo } from "react";
import { usePlayground } from "../hooks/usePlayground";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";
import { ComponentDef, CompoundComponentDef, StandaloneExtensionManager } from "xmlui";
import { AppRoot } from "../../../xmlui/src/components-core/rendering/AppRoot";
import type { ThemeTone } from "../../../xmlui/src/abstractions/ThemingDefs";
import styles from "./Preview.module.scss";
import {
  errReportComponent,
  xmlUiMarkupToComponent,
} from "../../../xmlui/src/components-core/xmlui-parser";
import { ApiInterceptorProvider } from "../../../xmlui/src/components-core/interception/ApiInterceptorProvider";
import { useApiWorkerContext } from "../components/ApiWorkerContext";
import { ErrorBoundary } from "../../../xmlui/src/components-core/rendering/ErrorBoundary";
import charts from "xmlui-charts";
import animations from "xmlui-animations";
import pdf from "xmlui-pdf";

export function Preview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRootRef = useRef<Root | null>(null);
  const { appDescription, options, playgroundId } = usePlayground();
  const apiUrl = `/${playgroundId.replaceAll(":", "")}`;
  const extensionManager = useMemo(() => new StandaloneExtensionManager(), []);

  extensionManager.registerExtension(charts);
  extensionManager.registerExtension(animations);
  extensionManager.registerExtension(pdf);

  const mock = useMemo(
    () =>
      appDescription.api
        ? {
            type: "in-memory",
            ...appDescription.api,
            apiUrl: apiUrl + (appDescription.api?.apiUrl || ""),
          }
        : undefined,
    [apiUrl, appDescription.api],
  );
  const apiWorker = useApiWorkerContext();

  useEffect(() => {
    if (!contentRootRef.current && rootRef.current) {
      contentRootRef.current = ReactDOM.createRoot(rootRef.current);
    }
    let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
      appDescription.app,
    );
    if (errors.length > 0) {
      component = errReportComponent(errors, "Main.xmlui", erroneousCompoundComponentName);
    }
    const compoundComponents: CompoundComponentDef[] = appDescription.components.map(
      (src: { name: string; component: string | ComponentDef }) => {
        const isErrorReportComponent = typeof src.component !== "string";
        if (isErrorReportComponent) {
          return src;
        }
        let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
          src.component as string,
        );
        if (errors.length > 0) {
          return errReportComponent(errors, `${src.name}.xmlui`, erroneousCompoundComponentName);
        }
        return component;
      },
    );

    let globalProps = {
      name: appDescription.config?.name,
      ...(appDescription.config?.appGlobals || {}),
      apiUrl: apiUrl,
    };

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        <ApiInterceptorProvider interceptor={mock} apiWorker={apiWorker}>
          <AppRoot
            extensionManager={extensionManager}
            key={`app-${options.id}`}
            previewMode={true}
            standalone={true}
            trackContainerHeight={true}
            node={component}
            globalProps={globalProps}
            defaultTheme={options.activeTheme || appDescription.config?.defaultTheme}
            defaultTone={(options.activeTone || appDescription.config?.defaultTone) as ThemeTone}
            contributes={{
              compoundComponents,
              themes: appDescription.config?.themes,
            }}
            resources={appDescription.config?.resources}
          />
        </ApiInterceptorProvider>
      </ErrorBoundary>,
    );
  }, [
    options.id,
    options.activeTone,
    options.activeTheme,
    appDescription.app,
    appDescription.config,
    appDescription.config?.themes,
    appDescription.config?.name,
    appDescription.config?.appGlobals,
    appDescription.config?.resources,
    appDescription.config?.defaultTheme,
    appDescription.config?.defaultTone,
    appDescription.components,
    mock,
    apiUrl,
    apiWorker,
    extensionManager,
  ]);
  return (
    <div className={styles.preview}>
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
