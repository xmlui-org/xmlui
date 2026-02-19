import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./OverviewCard.xmlui";

export const OverviewCardMd = createMetadata({
  status: "experimental",
  description: "Card link used in overview/section landing pages.",
  props: {
    to: { description: "Target URL." },
    label: { description: "Display label." },
    icon: { description: "Optional icon name." },
    width: { description: "Optional width." },
  },
});

export const overviewCardRenderer = createUserDefinedComponentRenderer(
  OverviewCardMd,
  componentSource,
);
