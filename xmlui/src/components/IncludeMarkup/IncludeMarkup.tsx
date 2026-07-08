import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, dComponent } from "../metadata-helpers";
import { IncludeMarkupReact } from "./IncludeMarkupReact";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { parseXmlui } from "../../compiler/parseXmlui";
import { templateChildren, wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "IncludeMarkup";

export const IncludeMarkupMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`IncludeMarkup` dynamically fetches XMLUI markup from a URL and renders it inline. " +
    "Use it to share common fragments (headers, footers, navigation bars, etc.) across " +
    "multiple XMLUI apps without duplicating markup.",
  props: {
    url: {
      description:
        "The URL to fetch XMLUI markup from. " +
        "The component re-fetches and re-renders whenever this value changes. " +
        "The server must allow cross-origin requests (CORS) when the app and the " +
        "markup are served from different origins.",
    },
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

export const includeMarkupComponentRenderer = wrapComponent(
  COMP,
  IncludeMarkupReact,
  IncludeMarkupMd,
  {
    customRender: (props, { renderChild }) => (
      <IncludeMarkupReact
        url={props.url}
        loadingContent={props.loadingContent}
        onDidLoad={props.onDidLoad}
        onDidFail={props.onDidFail}
        renderComponent={(def) => renderChild(def as ComponentDef)}
      />
    ),
  },
);

type RuntimeIncludeMarkupProps = {
  url?: string;
  loadingContent?: ReactNode;
  renderIncludedMarkup: (nodes: XmluiNode[]) => ReactNode;
  onDidLoad?: () => void;
  onDidFail?: (message: string) => void;
};

function RuntimeIncludeMarkup({
  url,
  loadingContent,
  renderIncludedMarkup,
  onDidLoad,
  onDidFail,
}: RuntimeIncludeMarkupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes] = useState<XmluiNode[] | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setNodes(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setNodes(null);

    void fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then((markup) => parseIncludedMarkup(markup, url))
      .then((parsedNodes) => {
        if (!active) {
          return;
        }
        setNodes(parsedNodes);
        setIsLoading(false);
        onDidLoad?.();
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        setNodes(null);
        setIsLoading(false);
        onDidFail?.(message);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [onDidFail, onDidLoad, url]);

  if (isLoading) {
    return <>{loadingContent ?? null}</>;
  }
  if (!nodes) {
    return null;
  }

  const rendered = renderIncludedMarkup(nodes);
  return Array.isArray(rendered) ? <Fragment>{rendered}</Fragment> : <>{rendered}</>;
}

function parseIncludedMarkup(markup: string, sourceId: string): XmluiNode[] {
  const trimmed = markup.trim();
  if (!trimmed) {
    return [];
  }
  const document = trimmed.startsWith("<Component")
    ? parseXmlui(trimmed, { sourceId })
    : parseXmlui(`<Component name="IncludedMarkup">${trimmed}</Component>`, { sourceId });
  return document.kind === "component" ? document.root.children : [document.root];
}

export const includeMarkupRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: IncludeMarkupMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <RuntimeIncludeMarkup
      url={adapter.resourceUrl(adapter.prop("url"))}
      loadingContent={
        templateChildren(adapter.node, "loadingContent")
          ? adapter.renderTemplate("loadingContent")
          : null
      }
      renderIncludedMarkup={(nodes) => adapter.context.renderChildren(nodes, adapter.scope)}
      onDidLoad={() => void adapter.event("didLoad")()}
      onDidFail={(message) => void adapter.event("didFail")(message)}
    />
  ),
});
