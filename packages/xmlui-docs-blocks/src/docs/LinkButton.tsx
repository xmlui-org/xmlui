import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./LinkButton.xmlui";

export const LinkButtonMd = createMetadata({
  status: "experimental",
  description: "Link styled as a button with optional icon.",
  props: {
    to: { description: "Target URL." },
    label: { description: "Button label." },
    icon: { description: "Optional icon name." },
    blank: { description: "Open in new tab.", valueType: "boolean" },
  },
});

export const linkButtonRenderer = createUserDefinedComponentRenderer(
  LinkButtonMd,
  componentSource,
);
