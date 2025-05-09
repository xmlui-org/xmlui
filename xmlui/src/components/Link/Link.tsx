import styles from "./Link.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dEnabled, dLabel } from "../metadata-helpers";
import { LinkTargetMd } from "../abstractions";
import { LocalLink } from "./LinkNative";

const COMP = "Link";

export const LinkMd = createMetadata({
  description:
    `A \`${COMP}\` component represents a navigation target within the app or a ` +
    `reference to an external web URL.`,
  props: {
    to: d(`This property defines the URL of the link.`),
    enabled: dEnabled(),
    active: {
      description: `Indicates whether this link is active or not. If so, it will have a distinct visual appearance.`,
      type: "boolean",
      defaultValue: false,
    },
    target: {
      description:
        `This property specifies where to open the link represented by the \`${COMP}\`. This ` +
        `property accepts the following values (in accordance with the HTML standard):`,
      availableValues: LinkTargetMd,
      type: "string",
      defaultValue: "_self",
    },
    label: dLabel(),
    icon: d(`This property allows you to add an icon (specify the icon's name) to the link.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`gap-icon-${COMP}`]: "This property defines the size of the gap between the icon and the label.",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`textColor-${COMP}--hover--active`]: `$textColor-${COMP}--active`,
    [`textDecorationColor-${COMP}--hover`]: "$color-primary-400",
    [`textColor-${COMP}--hover`]: `$color-primary-400`,
    [`textDecorationColor-${COMP}--active`]: "$color-primary-200",
    [`fontWeight-${COMP}--active`]: "$fontWeight-bold",
    [`textDecorationColor-${COMP}`]: "$color-primary-400",
    [`textUnderlineOffset-${COMP}`]: "$space-1",
    [`textDecorationLine-${COMP}`]: "underline",
    [`textDecorationStyle-${COMP}`]: "solid",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`fontSize-${COMP}`]: "inherit",
    [`gap-icon-${COMP}`]: "$gap-tight",
    [`padding-icon-${COMP}`]: "$space-0_5",
    [`textColor-${COMP}`]: "$color-primary-500",
    [`textColor-${COMP}--active`]: "$color-primary-500",
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
