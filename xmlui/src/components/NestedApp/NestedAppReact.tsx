import { useMemo, type CSSProperties } from "react";

import { compileXmluiSource, throwFirstCompilerDiagnostic } from "../../compiler/compileXmluiSource";
import { createXmluiModule, XmluiRoot } from "../../runtime";
import styles from "./NestedApp.module.scss";

export type NestedAppProps = {
  app?: string;
  className?: string;
  height?: string | number;
  style?: CSSProperties;
  testId?: string;
};

export function NestedAppComponent({
  app,
  className,
  height,
  style,
  testId,
}: NestedAppProps) {
  const compiled = useMemo(() => {
    const source = String(app ?? "").trim();
    if (!source) {
      return undefined;
    }
    try {
      const result = compileXmluiSource({
        id: "nested-app.xmlui",
        source,
      });
      throwFirstCompilerDiagnostic(result);
      return {
        module: createXmluiModule(result.runtimeDocument),
        error: undefined,
      };
    } catch (error) {
      return {
        module: undefined,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [app]);
  const mergedStyle = {
    ...style,
    ...(height !== undefined ? { height } : null),
  } as CSSProperties;

  return (
    <div
      className={[styles.nestedAppContainer, className].filter(Boolean).join(" ")}
      data-testid={testId}
      data-xmlui-component="NestedApp"
      style={mergedStyle}
    >
      <div className={styles.nestedAppContent}>
        {compiled?.error ? (
          <pre className={styles.error} data-testid={testId ? `${testId}-error` : undefined}>
            {compiled.error}
          </pre>
        ) : compiled?.module?.kind === "app" ? (
          <XmluiRoot module={compiled.module} initialUrl="/" />
        ) : null}
      </div>
    </div>
  );
}
