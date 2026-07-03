import React from "react";

import { createMetadata, dClick, dContextMenu } from "../../component-core/metadata/helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { extractScssThemeVars } from "../../styling/theme";
import { sizeValues } from "../abstractions";
import { defaultProps } from "./Avatar.defaults";
import { Avatar } from "./AvatarReact";

const COMP = "Avatar";

const avatarStylesSource = `
$backgroundColor-Avatar: createThemeVar("backgroundColor-Avatar");
$boxShadow-Avatar: createThemeVar("boxShadow-Avatar");
$textColor-Avatar: createThemeVar("textColor-Avatar");
$fontWeight-Avatar: createThemeVar("fontWeight-Avatar");
$borderRadius-Avatar: createThemeVar("borderRadius-Avatar");
$border-Avatar: createThemeVar("border-Avatar");
$borderHorizontal-Avatar: createThemeVar("borderHorizontal-Avatar");
$borderVertical-Avatar: createThemeVar("borderVertical-Avatar");
$borderTop-Avatar: createThemeVar("borderTop-Avatar");
$borderRight-Avatar: createThemeVar("borderRight-Avatar");
$borderBottom-Avatar: createThemeVar("borderBottom-Avatar");
$borderLeft-Avatar: createThemeVar("borderLeft-Avatar");
$borderColor-Avatar: createThemeVar("borderColor-Avatar");
$borderHorizontalColor-Avatar: createThemeVar("borderHorizontalColor-Avatar");
$borderVerticalColor-Avatar: createThemeVar("borderVerticalColor-Avatar");
$borderTopColor-Avatar: createThemeVar("borderTopColor-Avatar");
$borderRightColor-Avatar: createThemeVar("borderRightColor-Avatar");
$borderBottomColor-Avatar: createThemeVar("borderBottomColor-Avatar");
$borderLeftColor-Avatar: createThemeVar("borderLeftColor-Avatar");
$borderStyle-Avatar: createThemeVar("borderStyle-Avatar");
$borderTopStyle-Avatar: createThemeVar("borderTopStyle-Avatar");
$borderRightStyle-Avatar: createThemeVar("borderRightStyle-Avatar");
$borderBottomStyle-Avatar: createThemeVar("borderBottomStyle-Avatar");
$borderLeftStyle-Avatar: createThemeVar("borderLeftStyle-Avatar");
$borderWidth-Avatar: createThemeVar("borderWidth-Avatar");
$borderHorizontalWidth-Avatar: createThemeVar("borderHorizontalWidth-Avatar");
$borderVerticalWidth-Avatar: createThemeVar("borderVerticalWidth-Avatar");
$borderTopWidth-Avatar: createThemeVar("borderTopWidth-Avatar");
$borderRightWidth-Avatar: createThemeVar("borderRightWidth-Avatar");
$borderBottomWidth-Avatar: createThemeVar("borderBottomWidth-Avatar");
$borderLeftWidth-Avatar: createThemeVar("borderLeftWidth-Avatar");
`;

export const AvatarMd = createMetadata({
  status: "stable",
  description:
    "`Avatar` displays a user or entity's profile picture as a circular image " +
    "with fallback initials when no image URL is provided.",
  props: {
    size: {
      description: "Defines the display size of the Avatar.",
      availableValues: [...sizeValues],
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description: "The name used to derive initials and accessible labels.",
      valueType: "string",
    },
    url: {
      description: "The image URL to display.",
      valueType: "string",
      isResourceUrl: true,
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
  },
  themeVars: extractScssThemeVars(avatarStylesSource),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "4px",
    [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`border-${COMP}`]: "0px solid $color-surface-400A80",
    [`backgroundColor-${COMP}`]: "$color-surface-100",
  },
});

type ThemedAvatarProps = React.ComponentPropsWithoutRef<typeof Avatar>;

export const ThemedAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  ThemedAvatarProps
>(function ThemedAvatar({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(AvatarMd);
  return (
    <Avatar
      {...props}
      className={`${themeClass}${className ? ` ${className}` : ""}`}
      ref={ref}
    />
  );
});
