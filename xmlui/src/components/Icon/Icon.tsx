import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import styles from "./Icon.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import Icon from "./IconNative";

const COMP = "Icon";

/**
 * This component is the representation of an icon.
 */
export interface IconComponentDef extends ComponentDef<"Icon"> {
  props: {
    /**
     * This optional property provides a way to handle situations when the provided [icon name](#name) is not found in the registry.
     * @descriptionRef
     */
    fallback?: string;
  };
}

export const IconMd = createMetadata({
  description: `This component is the representation of an icon.`,
  props: {
    name: d(
      `This string property specifies the name of the icon to display. All icons have unique names ` +
        `and identifying the name is case-sensitive.`,
    ),
    size: d(
      `This property defines the size of the \`${COMP}\`. Note that setting the \`height\` and/or ` +
        `the \`width\` of the component will override this property.`,
    ),
    fallback: d(
      `This optional property provides a way to handle situations when the provided ` +
        `[icon name](#name) is not found in the registry.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-${COMP}`]: "1.25em",
  },
});

export const iconComponentRenderer = createComponentRendererNew(
  COMP,
  IconMd,
  ({ node, extractValue, layoutCss }) => {
    return (
      <Icon
        name={extractValue.asOptionalString(node.props.name)}
        size={extractValue(node.props.size)}
        layout={layoutCss}
        fallback={extractValue.asOptionalString(node.props.fallback)}
      />
    );
  },
);
