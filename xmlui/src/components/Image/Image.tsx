import styles from "./Image.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d, dClick, dInternal } from "../metadata-helpers";
import { Image, defaultProps } from "./ImageNative";

const COMP = "Image";

export const ImageMd = createMetadata({
  description:
    "`Image` displays pictures from URLs or local sources with built-in responsive " +
    "sizing, aspect ratio control, and accessibility features. It handles different " +
    "image formats and provides options for lazy loading and click interactions.",
  props: {
    src: d(
      "This property is used to indicate the source (path) of the image to display. " +
        "When not defined, no image is displayed.",
    ),
    alt: d(`This optional property specifies an alternate text for the image.`),
    fit: {
      description:
        "This property sets how the image content should be resized to fit its container.",
      type: "string",
      defaultValue: defaultProps.fit,
    },
    lazyLoad: {
      description:
        `Lazy loading instructs the browser to load the image only when it is imminently needed ` +
        `(e.g. user scrolls to it).`,
      type: "boolean",
      defaultValue: defaultProps.lazyLoad,
    },
    aspectRatio: d(
      "This property sets a preferred aspect ratio for the image, which will be used in " +
        "calculating auto sizes and other layout functions. If this value is not used, the " +
        'original aspect ratio is kept. The value can be a number of a string (such as "16/9").',
    ),
    inline: {
      description: `When set to true, the image will be displayed as an inline element instead of a block element.`,
      type: "boolean",
      defaultValue: defaultProps.inline,
    },
    animation: dInternal(`The optional animation object to be applied to the component`),
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const imageComponentRenderer = createComponentRenderer(
  COMP,
  ImageMd,
  ({ node, extractValue, layoutCss, extractResourceUrl }) => {
    return (
      <Image
        src={extractResourceUrl(node.props.src)}
        alt={extractValue(node.props.alt)}
        fit={extractValue(node.props.fit)}
        lazyLoad={extractValue.asOptionalBoolean(node.props.lazyLoad)}
        inline={extractValue.asOptionalBoolean(node.props.inline)}
        aspectRatio={extractValue(node.props.aspectRatio)}
        style={layoutCss}
        animation={extractValue(node.props.animation)}
      />
    );
  },
);
