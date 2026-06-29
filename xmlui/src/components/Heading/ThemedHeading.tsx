import React from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { COMPONENT_PART_KEY } from "../../styling";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { HeadingMd } from "./Heading";
import { Heading } from "./HeadingReact";

const COMP = "Heading";

type ThemedHeadingProps = React.ComponentPropsWithoutRef<typeof Heading> & { className?: string };

export const ThemedHeading = React.forwardRef<
  React.ElementRef<typeof Heading>,
  ThemedHeadingProps
>(function ThemedHeading({ className, classes, style, sx, ...props }, ref) {
  const themeClass = useComponentThemeClass(COMP, HeadingMd as ComponentMetadata);
  const mergedClasses = {
    ...classes,
    [COMPONENT_PART_KEY]: [
      themeClass.className,
      classes?.[COMPONENT_PART_KEY],
      className,
    ].filter(Boolean).join(" "),
  };
  return (
    <Heading
      {...props}
      classes={mergedClasses}
      style={{ ...themeClass.style, ...style }}
      sx={sx}
      ref={ref}
    />
  );
});
