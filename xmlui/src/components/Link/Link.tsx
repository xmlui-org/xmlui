import styles from "./Link.module.scss";
import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { LocalLink } from "./LinkNative";
import { dEnabled, dLabel } from "@components/metadata-helpers";

const COMP = "Link";

export const LinkMd = createMetadata({
  description:
    `A \`${COMP}\` component represents a navigation target within the app or a ` +
    `reference to an external web URL.`,
  props: {
    to: d(`This property defines the URL of the link.`),
    enabled: dEnabled(),
    active: d(
      `This Boolean property indicates if the particular navigation is an active link ` +
        `(\`false\`, by default). An active link has a particular visual appearance.`,
    ),
    target: d(
      `This property specifies where to open the link represented by the \`${COMP}\`. This ` +
        `property accepts the following values (in accordance with the HTML standard):`,
    ),
    label: dLabel(),
    icon: d(`This property allows you to add an icon (specify the icon's name) to the link.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-text-${COMP}--hover--active`]: `$color-text-${COMP}--active`,
    [`color-text-decoration-${COMP}--hover`]: "$color-surface-400A80",
    [`color-text-decoration-${COMP}--active`]: "$color-surface200",
    [`font-weight-${COMP}--active`]: "$font-weight-bold",
    [`color-decoration-${COMP}`]: "$color-surface-400",
    [`offset-decoration-${COMP}`]: "$space-1",
    [`line-decoration-${COMP}`]: "underline",
    [`style-decoration-${COMP}`]: "dashed",
    [`thickness-decoration-${COMP}`]: "$space-0_5",
    [`color-outline-${COMP}--focus`]: "$color-outline--focus",
    [`thickness-outline-${COMP}--focus`]: "$thickness-outline--focus",
    [`style-outline-${COMP}--focus`]: "$style-outline--focus",
    [`offset-outline-${COMP}--focus`]: "$offset-outline--focus",
    light: {
      [`color-text-${COMP}`]: "$color-primary-500",
      [`color-text-${COMP}--active`]: "$color-primary-500",
    },
    dark: {
      [`color-text-${COMP}`]: "$color-primary-500",
      [`ccolor-text-${COMP}--active`]: "$color-primary-500",
    },
  },
});

/**
 * This function define the renderer for the Limk component.
 */
export const localLinkComponentRenderer = createComponentRendererNew(
  COMP,
  LinkMd,
  ({ node, extractValue, lookupEventHandler, renderChild, layoutCss }) => {
    return (
      <LocalLink
        to={extractValue(node.props.to)}
        icon={extractValue(node.props.icon)}
        active={extractValue.asOptionalBoolean(node.props.active, false)}
        target={extractValue(node.props?.target)}
        style={layoutCss}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
      >
        {node.props.label
          ? extractValue.asDisplayText(node.props.label)
          : renderChild(node.children)}
      </LocalLink>
    );
  },
);
