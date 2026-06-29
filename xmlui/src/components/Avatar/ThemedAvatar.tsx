import React from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { COMPONENT_PART_KEY } from "../../styling";
import { AvatarMd } from "./Avatar";
import { Avatar } from "./AvatarReact";

const COMP = "Avatar";

type ThemedAvatarProps = React.ComponentPropsWithoutRef<typeof Avatar> & { className?: string };

export const ThemedAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  ThemedAvatarProps
>(function ThemedAvatar({ className, classes, style, ...props }, ref) {
  const themeClass = useComponentThemeClass(COMP, AvatarMd as ComponentMetadata);
  const mergedClasses = {
    ...classes,
    [COMPONENT_PART_KEY]: [
      themeClass.className,
      classes?.[COMPONENT_PART_KEY],
      className,
    ].filter(Boolean).join(" "),
  };
  return <Avatar {...props} classes={mergedClasses} style={{ ...themeClass.style, ...style }} ref={ref} />;
});
