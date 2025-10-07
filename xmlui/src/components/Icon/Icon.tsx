import { createComponentRenderer } from "../../components-core/renderers";
import styles from "./Icon.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import Icon from "./IconNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "Icon";

export const IconMd = createMetadata({
  status: "stable",
  description:
    "`Icon` displays scalable vector icons from XMLUI's built-in icon registry " +
    "using simple name references. Icons are commonly used in buttons, navigation " +
    "elements, and status indicators.",
  props: {
    name: d(
      "This string property specifies the name of the icon to display. All icons have " +
        "unique, case-sensitive names identifying them. If the icon name is not set, the " +
        "`fallback` value is used.",
    ),
    size: {
      description:
        `This property defines the size of the \`${COMP}\`. Note that setting the \`height\` and/or ` +
        `the \`width\` of the component will override this property. You can use az explicit size ` +
        "value (e.g., 32px) or one of these predefined values: `xs`, `sm`, `md`, `lg`.",
      availableValues: ["xs", "sm", "md", "lg"],
    },
    fallback: d(
      "This optional property provides a way to handle situations when the icon with the provided " +
        "[icon name](#name) name does not exist. If the icon cannot be found, no icon is displayed.",
    ),
  },
  events: {
    click: d("This event is triggered when the icon is clicked."),
  },

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-${COMP}`]: "1.2em",
  },
});

export const iconComponentRenderer = createComponentRenderer(
  COMP,
  IconMd,
  ({ node, extractValue, className, lookupEventHandler }) => {
    return (
      <Icon
        name={extractValue.asOptionalString(node.props.name)}
        size={extractValue(node.props.size)}
        className={className}
        fallback={extractValue.asOptionalString(node.props.fallback)}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);
