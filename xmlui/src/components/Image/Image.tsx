import { extractScssThemeVars } from "../../styling/theme";
import {
  createMetadata,
  dClick,
} from "../../component-core/metadata/helpers";
import { defaultProps } from "./Image.defaults";

const COMP = "Image";
const imageStylesSource = `
$borderRadius-Image: createThemeVar("borderRadius-Image");
$borderColor-Image: createThemeVar("borderColor-Image");
`;

export const ImageMd = createMetadata({
  status: "stable",
  description:
    "`Image` displays pictures from URLs or local sources with responsive sizing, aspect-ratio control, accessibility attributes, lazy loading, and click interactions.",
  props: {
    src: {
      description: "The source path or URL of the image to display.",
      valueType: "string",
      isResourceUrl: true,
    },
    data: {
      description: "Binary data that represents the image.",
    },
    alt: {
      description: "Alternate text for the image.",
      valueType: "string",
    },
    fit: {
      description: "Controls how the image content is resized to fit its container.",
      valueType: "string",
      availableValues: ["contain", "cover"],
      defaultValue: defaultProps.fit,
    },
    lazyLoad: {
      description: "When true, asks the browser to lazy-load the image.",
      valueType: "boolean",
      defaultValue: defaultProps.lazyLoad,
    },
    aspectRatio: {
      description: "Preferred image aspect ratio, such as `1.5` or `16/9`.",
      valueType: "string",
    },
    inline: {
      description: "When true, renders the image as an inline element.",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    grayscale: {
      description: "When true, renders the image in grayscale.",
      valueType: "boolean",
      defaultValue: defaultProps.grayscale,
    },
    testId: {
      description: "Adds a test identifier to the image element.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: extractScssThemeVars(imageStylesSource),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "transparent",
  },
});
