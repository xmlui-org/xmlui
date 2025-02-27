import styles from "./Image.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../components-core/renderers";
import { dClick } from "../metadata-helpers";
import { Image } from "./ImageNative";

const COMP = "Image";

export const ImageMd = createMetadata({
  description:
    `The \`${COMP}\` component represents or depicts an object, scene, idea, or other concept ` +
    `with a picture.`,
  props: {
    src: d(`This property is used to indicate the source (path) of the image to display.`),
    alt: d(`This property specifies an alternate text for the image.`),
    fit: {
      description: "This property sets how the image content should be resized to fit its container.",
      type: "string",
      defaultValue: "contain",
    },
    lazyLoad: d(
      `Lazy loading instructs the browser to load the image only when it is imminently needed ` +
        `(e.g. user scrolls to it). The default value is eager (\`false\`).`,
    ),
    aspectRatio: d(
      `This property sets a preferred aspect ratio for the image, which will be used in the ` +
        `calculation of auto sizes and some other layout functions.`,
    ),
    animation: d(`The animation object to be applied to the component`),
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
        aspectRatio={extractValue(node.props.aspectRatio)}
        style={layoutCss}
        animation={extractValue(node.props.animation)}
      />
    );
  },
);
