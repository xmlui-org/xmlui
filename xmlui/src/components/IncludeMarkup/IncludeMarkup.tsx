import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d, dComponent } from "../metadata-helpers";
import { IncludeMarkupNative } from "./IncludeMarkupNative";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

const COMP = "IncludeMarkup";

export const IncludeMarkupMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`IncludeMarkup` dynamically fetches XMLUI markup from a URL and renders it inline. " +
    "Use it to share common fragments (headers, footers, navigation bars, etc.) across " +
    "multiple XMLUI apps without duplicating markup.",
  props: {
    url: d(
      "The URL to fetch XMLUI markup from. " +
        "The component re-fetches and re-renders whenever this value changes. " +
        "The server must allow cross-origin requests (CORS) when the app and the " +
        "markup are served from different origins.",
    ),
    loadingContent: dComponent(
      "Optional content rendered while the request is in-flight. " +
        "When the fetch completes this placeholder is replaced by the fetched markup.",
    ),
  },
  events: {
    didLoad: {
      description:
        "This event fires after the markup has been successfully fetched, parsed, and rendered.",
      signature: "didLoad(): void",
      parameters: {},
    },
    didFail: {
      description:
        "This event fires when the fetch or parse operation fails (network error, non-2xx " +
        "HTTP status, or XMLUI parse error).",
      signature: "didFail(message: string): void",
      parameters: {
        message: "A human-readable description of the error that occurred.",
      },
    },
  },
});

export const includeMarkupComponentRenderer = createComponentRenderer(
  COMP,
  IncludeMarkupMd,
  ({ node, extractValue, renderChild, lookupEventHandler }) => {
    const url = extractValue.asOptionalString(node.props.url);
    const loadingContent = renderChild(node.props.loadingContent);
    const onDidLoad = lookupEventHandler("didLoad");
    const onDidFail = lookupEventHandler("didFail");

    return (
      <IncludeMarkupNative
        url={url}
        loadingContent={loadingContent as React.ReactNode}
        onDidLoad={onDidLoad}
        onDidFail={onDidFail}
        renderComponent={(def) => renderChild(def as ComponentDef) as React.ReactNode}
      />
    );
  },
);
