import React from "react";
import type { Extension } from "xmlui";

export const counterBadgeExtension: Extension = {
  namespace: "XMLUIExtensions",
  themeNamespacePrefix: "CounterBadge",
  functions: {
    addAmount: (value: unknown, amount: unknown) => Number(value ?? 0) + Number(amount ?? 0),
  },
  themes: [
    {
      id: "counter-badge",
      name: "Counter Badge",
      variables: {
        "--xmlui-counter-badge-accent": "#1d4ed8",
      },
    },
  ],
  components: [
    {
      name: "CounterBadge",
      description: "Extension counter badge that raises increment events.",
      props: ["label", "value"],
      events: ["increment"],
      allowsChildren: true,
      component: ({ props, events, children }) => {
        const label = String(props.label ?? "Extension counter");
        const value = Number(props.value ?? 0);
        return React.createElement(
          "div",
          {
            "data-part-id": "CounterBadge",
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              border: "1px solid var(--xmlui-counter-badge-accent, #1d4ed8)",
            },
          },
          React.createElement("span", { "data-testid": "counter-badge-label" }, `${label}: ${value}`),
          React.createElement("button", {
            type: "button",
            onClick: () => void events.increment?.(1),
          }, "+1"),
          children,
        );
      },
    },
  ],
};

export default counterBadgeExtension;

