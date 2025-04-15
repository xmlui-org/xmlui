import styles from "./Avatar.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { sizeMd } from "../../components/abstractions";
import { Avatar, defaultProps } from "./AvatarNative";

const COMP = "Avatar";

export const AvatarMd = createMetadata({
  description:
    `The \`${COMP}\` component represents a user, group (or other entity's) avatar with a small image or initials.`,
  props: {
    size: {
      description: `This property defines the display size of the ${COMP}.`,
      availableValues: sizeMd,
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description: `This property sets the name value the ${COMP} uses to display initials.`,
      valueType: "string",
    },
    url: {
      description: `This property specifies the URL of the image to display in the ${COMP}.`,
      valueType: "string",
    },
  },
  events: {
    click: d("This event is triggered when the avatar is clicked."),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "4px",
    [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`border-${COMP}`]: "0px solid $color-surface-400A80",
    [`backgroundColor-${COMP}`]: "$color-surface-100",
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
