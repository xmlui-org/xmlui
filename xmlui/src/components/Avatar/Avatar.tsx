import styles from "./Avatar.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { sizeMd } from "../../components/abstractions";
import { Avatar, defaultProps } from "./AvatarReact";
import { createMetadata, dClick, dContextMenu } from "../metadata-helpers";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { wrapComponent } from "../../components-core/wrapComponent";

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
      description: `This property defines the display size of the ${COMP}. ` +
        `Predefined sizes (xs, sm, md, lg) scale with the current font size (using em units). ` +
        `Custom CSS values (e.g., '50px', '3rem', '5em') are supported for both width and height, ` +
        `with font-size automatically calculated at approximately 33% of the width for proper initial display.`,
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
      isResourceUrl: true,
    },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
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

type ThemedAvatarProps = Omit<React.ComponentProps<typeof Avatar>, "classes"> & { className?: string };
export const ThemedAvatar = React.forwardRef<HTMLImageElement | HTMLDivElement, ThemedAvatarProps>(
  function ThemedAvatar({ className, ...props }: ThemedAvatarProps, ref) {
    const themeClass = useComponentThemeClass(AvatarMd);
    const combinedClass = [themeClass, className].filter(Boolean).join(" ");
    return <Avatar {...props} classes={{ [COMPONENT_PART_KEY]: combinedClass }} ref={ref} />;
  },
);

export const avatarComponentRenderer = wrapComponent(
  COMP,
  Avatar,
  AvatarMd,
  {
    deriveAriaLabel: (props) => props.name,
  },
);
