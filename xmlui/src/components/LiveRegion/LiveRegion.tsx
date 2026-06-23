import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  politeness: "polite" as const,
};

export const LiveRegionMd = createMetadata({
  status: "stable",
  description:
    "`LiveRegion` announces dynamic status messages to assistive technologies without changing the visible layout.",
  props: {
    message: {
      description: "The message announced by the live region.",
      valueType: "string",
    },
    politeness: {
      description: "Controls whether updates are announced politely or assertively.",
      valueType: "string",
      availableValues: ["polite", "assertive"],
      isStrictEnum: true,
      defaultValue: defaultProps.politeness,
    },
    testId: {
      description: "Adds a test identifier to the live region element.",
      valueType: "string",
    },
  },
  a11y: {
    role: "decorative",
    requiresAccessibleName: false,
  },
});
