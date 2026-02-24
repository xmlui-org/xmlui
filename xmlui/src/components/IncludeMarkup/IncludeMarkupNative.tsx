import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { errReportComponent, xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";

// Detects a CompoundComponentDef (i.e. the result of parsing <Component name="...">)
function isCompoundComponentDef(
  c: ComponentDef | CompoundComponentDef,
): c is CompoundComponentDef {
  return "component" in c && "name" in c && !("type" in c);
}

// =====================================================================================================================
// Types

type RenderFn = (def: ComponentDef | ComponentDef[]) => ReactNode;

type Props = {
  url?: string;
  loadingContent?: ReactNode;
  onDidLoad?: () => void;
  onDidFail?: (message: string) => void;
  renderComponent: RenderFn;
};

// =====================================================================================================================
// React IncludeMarkupNative component implementation

export function IncludeMarkupNative({
  url,
  loadingContent,
  onDidLoad,
  onDidFail,
  renderComponent,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [componentDef, setComponentDef] = useState<ComponentDef | CompoundComponentDef | ComponentDef[] | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setComponentDef(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setComponentDef(null);

    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const markup = await response.text();
        if (cancelled) return;

        const { errors, component, erroneousCompoundComponentName } =
          xmlUiMarkupToComponent(markup);

        if (errors.length > 0) {
          // Show the inline error report and fire didFail
          setComponentDef(
            errReportComponent(errors, url, erroneousCompoundComponentName) as ComponentDef,
          );
          setIsLoading(false);
          onDidFail?.(errors.map((e) => e.message).join("; "));
        } else {
          setComponentDef(component as ComponentDef | CompoundComponentDef | ComponentDef[]);
          setIsLoading(false);
          onDidLoad?.();
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setIsLoading(false);
        setComponentDef(null);
        onDidFail?.(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (isLoading) {
    return <>{loadingContent ?? null}</>;
  }

  if (componentDef === null) {
    return null;
  }

  // If the parsed result is a CompoundComponentDef (<Component name="...">),
  // render its inner component so the children appear inline.
  const defToRender = isCompoundComponentDef(componentDef as ComponentDef | CompoundComponentDef)
    ? (componentDef as CompoundComponentDef).component
    : (componentDef as ComponentDef | ComponentDef[]);

  const rendered = renderComponent(defToRender as ComponentDef | ComponentDef[]);
  // renderChild may return an array; wrap in a Fragment if needed
  if (Array.isArray(rendered)) {
    return <Fragment>{rendered}</Fragment>;
  }
  return <>{rendered}</>;
}
