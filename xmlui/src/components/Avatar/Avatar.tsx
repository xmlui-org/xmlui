import styles from "./Avatar.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { sizeMd } from "../../components/abstractions";
import { Avatar, defaultProps } from "./AvatarNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "Avatar";

export const AvatarMd = createMetadata({
  status: "stable",
  description:
    "`Avatar` displays a user or entity's profile picture as a circular image, " +
    "with automatic fallback to initials when no image is provided. It's commonly " +
    "used in headers, user lists, comments, and anywhere you need to represent a " +
    "person or organization.",
  props: {
    size: {
      description: `This property defines the display size of the ${COMP}.`,
      availableValues: sizeMd,
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description:
        `This property sets the name value the ${COMP} uses to display initials. If neither ` +
        "this property nor \`url\` is defined, an empty avatar is displayed.",
      valueType: "string",
    },
    url: {
      description:
        `This property specifies the URL of the image to display in the ${COMP}. ` +
        "If neither this property nor \`name\` is defined, an empty avatar is displayed.",
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
  ({ node, extractValue, lookupEventHandler, className, extractResourceUrl }) => {
    return (
      <Avatar
        className={className}
        size={node.props?.size}
        url={extractResourceUrl(node.props.url)}
        name={extractValue(node.props.name)}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);
