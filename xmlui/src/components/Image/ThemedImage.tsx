import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { COMPONENT_PART_KEY } from "../../styling";
import { ImageMd } from "./Image";
import { Image } from "./ImageReact";

type ThemedImageProps = ComponentPropsWithoutRef<typeof Image> & {
  classes?: Record<string, string>;
};

const COMP = "Image";

export const ThemedImage = forwardRef<ElementRef<typeof Image>, ThemedImageProps>(
  function ThemedImage({ className, classes, style, ...props }, ref) {
    const themeClass = useComponentThemeClass(COMP, ImageMd as ComponentMetadata);
    const mergedClass = [
      themeClass.className,
      classes?.[COMPONENT_PART_KEY],
      className,
    ].filter(Boolean).join(" ");
    return (
      <Image
        {...props}
        className={mergedClass}
        ref={ref}
        style={{ ...themeClass.style, ...style }}
      />
    );
  },
);
