import { ErrorBoundary } from "@components-core/ErrorBoundary";
import RootComponent from "@components-core/RootComponent";
import React, { useRef, useEffect } from "react";
import { usePlayground } from "@/src/hooks/usePlayground";
import ReactDOM, { Root } from "react-dom/client";
import { parseFromEditorText } from "../utils/helpers";
import { CompoundComponentDef, ComponentLike } from "xmlui";
import { ThemeTone } from "@components-core/theming/abstractions";
import styles from "./Preview.module.scss";

export function Preview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRootRef = useRef<Root | null>(null);
  const { appDescription, options } = usePlayground();

  useEffect(() => {
    if (!contentRootRef.current && rootRef.current) {
      contentRootRef.current = ReactDOM.createRoot(rootRef.current);
    }
    const parsedNode = parseFromEditorText(appDescription.app) as ComponentLike;
    contentRootRef.current?.render(
      <ErrorBoundary node={parsedNode}>
        <RootComponent
          key={`app-${options.id}`}
          previewMode={true}
          standalone={true}
          node={parsedNode}
          globalProps={{
            name: appDescription.config?.name,
            ...(appDescription.config?.globals || {}),
          }}
          defaultTheme={options.activeTheme || appDescription.config?.defaultTheme}
          defaultTone={(options.activeTone || appDescription.config?.defaultTone) as ThemeTone}
          contributes={{
            compoundComponents: appDescription.components.map((component: string) =>
              parseFromEditorText(component),
            ) as CompoundComponentDef[],
            themes: appDescription.config?.themes,
          }}
          resources={appDescription.config?.resources}
        />
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
    appDescription.config.resources,
    appDescription.config?.defaultTheme,
    appDescription.config?.defaultTone,
    appDescription.components,
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
