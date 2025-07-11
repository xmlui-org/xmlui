import styles from "./Link.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dEnabled, dLabel } from "../metadata-helpers";
import { LinkTargetMd } from "../abstractions";
import { LinkNative, defaultProps } from "./LinkNative";

const COMP = "Link";

export const LinkMd = createMetadata({
  status: "stable",
  description:
    "`Link` creates clickable navigation elements for internal app routes or " +
    "external URLs. You can use the `label` and `icon` properties for simple text " +
    "links, or embed custom components like buttons, cards, or complex layouts " +
    "for rich interactive link presentations.",
  props: {
    to: d(
      "This property defines the URL of the link. If the value is not defined, the link cannot be activated.",
    ),
    enabled: dEnabled(),
    active: {
      description: `Indicates whether this link is active or not. If so, it will have a distinct visual appearance.`,
      type: "boolean",
      defaultValue: defaultProps.active,
    },
    target: {
      description:
        `This property specifies where to open the link represented by the \`${COMP}\`. This ` +
        `property accepts the following values (in accordance with the HTML standard):`,
      availableValues: LinkTargetMd,
      type: "string",
    },
    label: dLabel(),
    icon: d(
      `This property allows you to add an optional icon (specify the icon's name) to the link.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`gap-icon-${COMP}`]:
      "This property defines the size of the gap between the icon and the label.",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`textColor-${COMP}`]: "$color-primary-500",
    [`textDecorationColor-${COMP}`]: `textDecorationColor-${COMP}`,
    [`textColor-${COMP}--hover`]: `$color-primary-400`,
    [`textDecorationColor-${COMP}--hover`]: `textColor-${COMP}--hover`,
    [`textColor-${COMP}--active`]: "$color-primary-400",
    [`textDecorationColor-${COMP}--active`]: "$color-primary-400",
    [`textColor-${COMP}--hover--active`]: `$textColor-${COMP}--active`,
    [`textUnderlineOffset-${COMP}`]: "$space-1",
    [`textDecorationLine-${COMP}`]: "underline",
    [`textDecorationStyle-${COMP}`]: "solid",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`fontSize-${COMP}`]: "inherit",
    [`fontWeight-${COMP}--active`]: "$fontWeight-bold",
    [`gap-icon-${COMP}`]: "$gap-tight",
    [`padding-icon-${COMP}`]: "$space-0_5",
  },
});

/**
 * This function define the renderer for the Limk component.
 */
export const localLinkComponentRenderer = createComponentRenderer(
  COMP,
  LinkMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <LinkNative
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
      </LinkNative>
    );
  },
);
