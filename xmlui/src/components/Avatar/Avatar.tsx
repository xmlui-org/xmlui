import styles from "./Avatar.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { sizeMd } from "../../components/abstractions";
import { Avatar } from "./AvatarNative";

const COMP = "Avatar";

export const AvatarMd = createMetadata({
  description:
    `The \`${COMP}\` component represents a user, group (or other entity's) avatar with a small image or initials.`,
  props: {
    size: d(`This property defines the display size of the ${COMP}.`, sizeMd, "string", "sm"),
    name: d(`This property sets the name value the ${COMP} uses to display initials.`),
    url: d(`This property specifies the URL of the image to display in the ${COMP}.`),
  },
  events: {
    click: d("This event is triggered when the avatar is clicked."),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`radius-${COMP}`]: "4px",
    [`shadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`color-text-${COMP}`]: "$color-text-secondary",
    [`font-weight-${COMP}`]: "$font-weight-bold",
    light: {
      [`border-${COMP}`]: "0px solid $color-surface-400A80",
      [`color-bg-${COMP}`]: "$color-surface-100",
    },
    dark: {
      [`border-${COMP}`]: "0px solid $color-surface-700",
      [`color-bg-${COMP}`]: "$color-surface-800",
      [`color-border-${COMP}`]: "$color-surface-700",
    },
  },
});

export const avatarComponentRenderer = createComponentRenderer(
  COMP,
  AvatarMd,
  ({ node, extractValue, lookupEventHandler, layoutCss, extractResourceUrl }) => {
    return (
      <Avatar
        size={node.props?.size}
        url={extractResourceUrl(node.props.url)}
        name={extractValue(node.props.name)}
        style={layoutCss}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);
