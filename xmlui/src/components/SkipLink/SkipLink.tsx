import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { SkipLink, defaultProps } from "./SkipLinkReact";

const COMP = "SkipLink";

export const SkipLinkMd = createMetadata({
  status: "stable",
  description:
    "`SkipLink` renders a keyboard-first link that jumps directly to the main " +
    "content region. It stays visually hidden until focused.",
  props: {
    target: {
      description: "The id of the element to focus and scroll to.",
      valueType: "string",
      defaultValue: defaultProps.target,
    },
    label: {
      description: "The accessible text shown when the skip link receives focus.",
      valueType: "string",
      defaultValue: defaultProps.label,
    },
  },
  a11y: {
    role: "link",
    accessibleNameProps: ["label", "aria-label", "title"],
    requiresAccessibleName: true,
  },
});

export const skipLinkComponentRenderer = wrapComponent(COMP, SkipLink, SkipLinkMd, {
  strings: ["target", "label"],
});
