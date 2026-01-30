import { type ReactNode, useMemo } from "react";
import { xmlUiMarkupToComponent, errReportComponent } from "../../components-core/xmlui-parser";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import styles from "./Markdown.module.scss";

type InlineAppProps = {
  markup: string;
  renderChild: RenderChildFn;
};

/**
 * InlineApp renders XMLUI markup inline within markdown content.
 * Unlike NestedApp (xmlui-pg), it shares the parent's rendering context,
 * state, and component registry - enabling state sharing and script access.
 */
export function InlineApp({ markup, renderChild }: InlineAppProps): ReactNode {
  // Parse XMLUI markup and memoize the result
  const parsedComponent = useMemo(() => {
    if (!markup || markup.trim() === "") {
      // Return null component for empty markup
      return null;
    }

    const { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(markup);

    if (errors.length > 0) {
      // Create error component if parsing fails
      return errReportComponent(errors, "xmlui-inline", erroneousCompoundComponentName);
    }

    return component;
  }, [markup]);

  // Don't render anything for empty markup
  if (!parsedComponent) {
    return null;
  }

  // Render the parsed component within an error boundary for isolation
  return (
    <ErrorBoundary node={parsedComponent}>
      <div className={styles.xmluiInline}>
        {renderChild(parsedComponent)}
      </div>
    </ErrorBoundary>
  );
}
