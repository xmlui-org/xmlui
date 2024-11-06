import { ErrorBoundary } from "@components-core/ErrorBoundary";
import RootComponent from "@components-core/RootComponent";
import React, { useRef, useEffect, useMemo } from "react";
import { usePlayground } from "@/src/hooks/usePlayground";
import ReactDOM, { Root } from "react-dom/client";
import { CompoundComponentDef } from "xmlui";
import { ThemeTone } from "@components-core/theming/abstractions";
import styles from "./Preview.module.scss";
import { errReportComponent, xmlUiMarkupToComponent } from "@src/components-core/xmlui-parser";
import { ApiInterceptorProvider } from "@components-core/interception/ApiInterceptorProvider";
import { useApiWorkerContext } from "@/src/components/ApiWorkerContext";

export function Preview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRootRef = useRef<Root | null>(null);
  const { appDescription, options, playgroundId } = usePlayground();
  const apiUrl = `/${playgroundId.replaceAll(":", "")}`;

  const mock = useMemo(
    () =>
      appDescription.api
        ? {
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
      (src: { name: string; component: string }) => {
        let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
          src.component,
        );
        if (errors.length > 0) {
          return errReportComponent(errors, `${src.name}.xmlui`, erroneousCompoundComponentName);
        }
        return component;
      },
    );

    let globalProps = {
      name: appDescription.config?.name,
      ...(appDescription.config?.globals || {}),
      apiUrl: apiUrl,
    };

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        <ApiInterceptorProvider interceptor={mock} apiWorker={apiWorker}>
          <RootComponent
            key={`app-${options.id}`}
            previewMode={true}
            standalone={true}
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
    appDescription.config?.globals,
    appDescription.config?.resources,
    appDescription.config?.defaultTheme,
    appDescription.config?.defaultTone,
    appDescription.components,
    mock,
    apiUrl,
    apiWorker,
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
