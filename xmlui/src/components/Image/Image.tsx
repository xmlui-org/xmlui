import React from "react";
import styles from "./Image.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { createMetadata, dClick, dInternal } from "../metadata-helpers";
import { Image, defaultProps } from "./ImageNative";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "Image";

export const ImageMd = createMetadata({
  status: "stable",
  description:
    "`Image` displays pictures from URLs or local sources with built-in responsive " +
    "sizing, aspect ratio control, and accessibility features. It handles different " +
    "image formats and provides options for lazy loading and click interactions.",
  props: {
    src: {
      description:
        "This property is used to indicate the source (path) of the image to display. " +
        "When not defined, no image is displayed.",
      valueType: "string",
      isResourceUrl: true,
    },
    data: {
      description: `This property contains the binary data that represents the image.`,
    },
    alt: {
      description: `This optional property specifies an alternate text for the image.`,
    },
    fit: {
      description:
        "This property sets how the image content should be resized to fit its container.",
      valueType: "string",
      defaultValue: defaultProps.fit,
    },
    lazyLoad: {
      description:
        `Lazy loading instructs the browser to load the image only when it is imminently needed ` +
        `(e.g. user scrolls to it).`,
      valueType: "boolean",
      defaultValue: defaultProps.lazyLoad,
    },
    aspectRatio: {
      description:
        "This property sets a preferred aspect ratio for the image, which will be used in " +
        "calculating auto sizes and other layout functions. If this value is not used, the " +
        'original aspect ratio is kept. The value can be a number of a string (such as "16/9").',
      valueType: "string",
    },
    inline: {
      description: `When set to true, the image will be displayed as an inline element instead of a block element.`,
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    grayscale: {
      description: `When set to true, the image will be displayed in grayscale.`,
      valueType: "boolean",
      defaultValue: defaultProps.grayscale,
    },
    animation: dInternal(`The optional animation object to be applied to the component`),
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
});

type ThemedImageProps = React.ComponentPropsWithoutRef<typeof Image> & { classes?: Record<string, string> };

export const ThemedImage = React.forwardRef<React.ElementRef<typeof Image>, ThemedImageProps>(
  function ThemedImage({ className, classes, ...props }, ref) {
    const themeClass = useComponentThemeClass(ImageMd);
    const mergedClass = `${themeClass}${classes?.[COMPONENT_PART_KEY] ? ` ${classes[COMPONENT_PART_KEY]}` : ""}${className ? ` ${className}` : ""}`;
    return (
      <Image
        {...props}
        className={mergedClass}
        ref={ref}
      />
    );
  },
);

export const imageComponentRenderer = wrapComponent(
  COMP,
  ThemedImage,
  ImageMd,
  {
    rename: { data: "imageData" },
    deriveAriaLabel: (props) => props.alt,
  },
);
