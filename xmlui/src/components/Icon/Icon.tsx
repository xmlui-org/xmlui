import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import styles from "./Icon.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import Icon from "./IconNative";

const COMP = "Icon";

export const IconMd = createMetadata({
  status: "experimental",
  description: `This component is the representation of an icon.`,
  props: {
    name: d(
      `This string property specifies the name of the icon to display. All icons have unique names ` +
        `and identifying the name is case-sensitive.`,
    ),
    size: {
      description:
        `This property defines the size of the \`${COMP}\`. Note that setting the \`height\` and/or ` +
        `the \`width\` of the component will override this property.`,
      availableValues: ["xs", "sm", "md", "lg"],
    },
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

export const iconComponentRenderer = createComponentRenderer(
  COMP,
  IconMd,
  ({ node, extractValue, layoutCss }) => {
    return (
      <Icon
        name={extractValue.asOptionalString(node.props.name)}
        size={extractValue(node.props.size)}
        style={layoutCss}
        fallback={extractValue.asOptionalString(node.props.fallback)}
      />
    );
  },
);
