import type { ReactNode } from "react";

import { LiveRegion } from "../../components/LiveRegion/LiveRegionReact";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RendererContext } from "../../abstractions/RendererDefs";
import type { Behavior } from "./Behavior";

const SUPPORTED_COMPONENTS = new Set([
  "Text",
  "Heading",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "Badge",
  "NoResult",
  "ProgressBar",
]);

const HEADING_COMPONENTS = new Set(["Heading", "H1", "H2", "H3", "H4", "H5", "H6"]);

/**
 * Behavior for announcing text-like component updates through a hidden live region.
 */
export const liveRegionBehavior: Behavior = {
  metadata: {
    name: "liveRegion",
    friendlyName: "Live Region",
    description:
      "Adds a hidden live region to supported text-like components so dynamic text changes are announced to assistive technologies.",
    triggerProps: ["withLiveRegion"],
    props: {
      withLiveRegion: {
        valueType: "boolean",
        description:
          "When true, adds a hidden live region related to the component's displayed message.",
      },
      liveRegionMessage: {
        valueType: "string",
        description:
          "The message to announce. When omitted, XMLUI uses the component's primary text value when it can be resolved.",
      },
      liveRegionPoliteness: {
        valueType: "string",
        availableValues: ["polite", "assertive"],
        isStrictEnum: true,
        defaultValue: "polite",
        description:
          "Controls whether updates are announced politely or assertively. Use assertive sparingly.",
      },
    },
    condition: {
      type: "or",
      conditions: Array.from(SUPPORTED_COMPONENTS, (nodeType) => ({
        type: "isType",
        nodeType,
      })),
    },
  },
  canAttach: (context, node, metadata) => {
    if (metadata?.nonVisual || !SUPPORTED_COMPONENTS.has(node.type)) {
      return false;
    }
    return context.extractValue.asOptionalBoolean(node.props?.withLiveRegion, false) === true;
  },
  attach: (context, node) => {
    const message = resolveLiveRegionMessage(context);
    const politeness =
      context.extractValue.asOptionalString(context.node.props?.liveRegionPoliteness, "polite") ===
      "assertive"
        ? "assertive"
        : "polite";

    return (
      <>
        {node}
        <LiveRegion message={message} politeness={politeness} />
      </>
    );
  },
};

function resolveLiveRegionMessage(context: RendererContext): string {
  const { node, extractValue } = context;

  if (node.props?.liveRegionMessage !== undefined) {
    return extractValue.asDisplayText(node.props.liveRegionMessage);
  }

  if (node.type === "ProgressBar") {
    const value = extractValue(node.props?.value);
    const coercedValue = typeof value === "number" ? value : Number(value);
    const numericValue = Number.isFinite(coercedValue) ? coercedValue : 0;
    const percent = Math.round(Math.max(0, Math.min(1, numericValue)) * 100);
    return `${percent}%`;
  }

  if (node.type === "NoResult") {
    return (
      extractValue.asDisplayText(node.props?.label) ||
      resolveSingleTextNodeChild(context) ||
      "No results found"
    );
  }

  if (node.type === "Badge" || node.type === "Text" || HEADING_COMPONENTS.has(node.type)) {
    return extractValue.asDisplayText(node.props?.value) || resolveSingleTextNodeChild(context);
  }

  return "";
}

function resolveSingleTextNodeChild(context: RendererContext): string {
  const children = normalizeChildren(context.node.children);
  if (children.length !== 1) {
    return "";
  }
  const child = children[0];
  if (child.type !== "TextNode" && child.type !== "TextNodeCData") {
    return "";
  }
  const rendered = context.renderChild(child);
  return reactNodeToText(rendered);
}

function normalizeChildren(children: ComponentDef | ComponentDef[] | string | undefined) {
  if (!children || typeof children === "string") {
    return [];
  }
  return Array.isArray(children) ? children : [children];
}

function reactNodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  return "";
}
