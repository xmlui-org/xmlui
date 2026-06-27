import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { XmluiNode } from "../../compiler/ir";
import { parseXmlui } from "../../compiler/parseXmlui";

export type IncludeMarkupComponentProps = {
  url?: string;
  loadingContent?: ReactNode;
  renderIncludedMarkup: (nodes: XmluiNode[]) => ReactNode;
  onDidLoad?: () => void;
  onDidFail?: (message: string) => void;
};

type IncludeMarkupState =
  | { status: "idle"; nodes: XmluiNode[] }
  | { status: "loading"; nodes: XmluiNode[] }
  | { status: "loaded"; nodes: XmluiNode[] }
  | { status: "failed"; nodes: XmluiNode[]; message: string };

export function IncludeMarkupComponent({
  url,
  loadingContent,
  renderIncludedMarkup,
  onDidLoad,
  onDidFail,
}: IncludeMarkupComponentProps) {
  const [state, setState] = useState<IncludeMarkupState>({ status: "idle", nodes: [] });
  const callbacksRef = useRef({ onDidLoad, onDidFail });
  callbacksRef.current = { onDidLoad, onDidFail };

  useEffect(() => {
    if (!url) {
      setState({ status: "idle", nodes: [] });
      return;
    }

    const controller = new AbortController();
    let active = true;
    setState({ status: "loading", nodes: [] });

    void (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
        }
        const markup = await response.text();
        const nodes = parseIncludedMarkup(markup, url);
        if (!active) {
          return;
        }
        setState({ status: "loaded", nodes });
        callbacksRef.current.onDidLoad?.();
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        setState({ status: "failed", nodes: [], message });
        callbacksRef.current.onDidFail?.(message);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);

  const content = useMemo(
    () => (state.nodes.length > 0 ? renderIncludedMarkup(state.nodes) : null),
    [renderIncludedMarkup, state.nodes],
  );

  if (state.status === "loading") {
    return <>{loadingContent}</>;
  }
  return <>{content}</>;
}

function parseIncludedMarkup(markup: string, sourceId: string): XmluiNode[] {
  const trimmed = markup.trim();
  if (!trimmed) {
    return [];
  }

  const document = trimmed.startsWith("<Component")
    ? parseXmlui(trimmed, { sourceId })
    : parseXmlui(`<Component name="IncludedMarkup">${trimmed}</Component>`, { sourceId });

  if (document.root.children.length === 1) {
    const onlyChild = document.root.children[0];
    if (onlyChild.kind === "element" && onlyChild.type === "Fragment" && isBareFragment(onlyChild)) {
      return onlyChild.children;
    }
  }
  return document.root.children;
}

function isBareFragment(node: Extract<XmluiNode, { kind: "element" }>): boolean {
  return Object.keys(node.props).length === 0 &&
    Object.keys(node.vars).length === 0 &&
    Object.keys(node.globals).length === 0 &&
    Object.keys(node.events).length === 0 &&
    Object.keys(node.methods).length === 0;
}
