import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  root: false,
  applyIf: "auto",
};

export const ThemeMd = createMetadata({
  status: "stable",
  description:
    "`Theme` creates styling contexts to customize the appearance of nested components without using CSS.",
  allowArbitraryProps: true,
  opaque: true,
  props: {
    themeId: {
      description: "This property specifies which theme to use by setting the theme's id.",
      valueType: "string",
    },
    tone: {
      description: "This property sets the current theme tone.",
      availableValues: ["light", "dark"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: "light",
    },
    root: {
      description: "This property indicates whether the component is at the root of the application.",
      valueType: "boolean",
      defaultValue: defaultProps.root,
    },
    applyIf: {
      description: "Controls whether the theme wrapper is applied.",
      valueType: "boolean",
      defaultValue: defaultProps.applyIf,
    },
    disableInlineStyle: {
      description: "Controls whether inline styles are disabled for components within this theme.",
      valueType: "boolean",
    },
  },
});
