import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  target: "main",
  label: "Skip to main content",
};

export const SkipLinkMd = createMetadata({
  status: "stable",
  description:
    "`SkipLink` renders a keyboard-first link that jumps directly to the main content region.",
  props: {
    target: {
      description: "The DOM id, XMLUI component id, or test id of the element to focus and scroll to.",
      valueType: "string",
      defaultValue: defaultProps.target,
    },
    label: {
      description: "The accessible text shown when the skip link receives focus.",
      valueType: "string",
      defaultValue: defaultProps.label,
    },
    testId: {
      description: "Adds a test identifier to the skip link.",
      valueType: "string",
    },
  },
  a11y: {
    role: "link",
    accessibleNameProps: ["label", "aria-label", "title"],
    requiresAccessibleName: true,
  },
});
