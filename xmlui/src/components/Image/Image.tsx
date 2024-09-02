import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./Image.module.scss";
import type { CSSProperties, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import classnames from "@components-core/utils/classnames";

// =====================================================================================================================
// React Image component implementation

type Props = {
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  layout?: CSSProperties;
  lazyLoad?: boolean;
  aspectRatio?: string;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick">;

export const Image = forwardRef(function Img(
  { src, alt, fit = "contain", layout, onClick, aspectRatio, lazyLoad }: Props,
  ref,
) {
  return (
    <img
      src={src}
      ref={ref as any}
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      className={classnames(styles.img, {
        [styles.clickable]: !!onClick,
      })}
      style={{ objectFit: fit, ...layout, aspectRatio: aspectRatio }}
      onClick={onClick}
    />
  );
});

// =====================================================================================================================
// XMLUI Image component definition

/**
 * The \`Image\` component represents or depicts an object, scene, idea, or other concept with a picture.
 */
export interface ImageComponentDef extends ComponentDef<"Image"> {
  props: {
    /** This property is used to indicate the source (path) of the image to display. */
    src: string;
    /**
     * This property specifies an alternate text for the image.
     * This is useful in two cases:
     * 1. Accessibility: screen readers read the prop value to users so they know what the image is about.
     * 2. The text is also displayed when the image can't be loaded for some reason (network errors, content blocking, etc.).
     * @descriptionRef
     */
    alt?: string;
    /**
     * This property sets how the image content should be resized to fit its container.
     * @descriptionRef
     */
    fit?: string;
    /**
     * Corresponds to the \`loading\` attribute of the \`img\` element.
     * This attribute specifies if the image should be loaded lazily (\`true\`) or eager (\`false\`).
     * Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it).
     * The default value is eager (\`false\`).
     */
    lazyLoad?: boolean;
    /**
     * Corresponds to the \`aspect-ratio\` CSS style property.
     * This property sets a preferred aspect ratio for the image,
     * which will be used in the calculation of auto sizes and some other layout functions.
     * @descriptionRef
     */
    aspectRatio?: string;
  };
  events: {
    /** @descriptionRef */
    click?: string;
  };
}

const metadata: ComponentDescriptor<ImageComponentDef> = {
  displayName: "Image",
  description: "Display an image (.jpg, .png, etc.)",
  props: {
    src: desc("Specifies the path to the image"),
    alt: desc("Specifies an alternate text for the image, if the image for some reason cannot be displayed"),
    fit: desc("Sets how the image fits in its container (cover, contain)"),
  },
  events: {
    click: desc("Triggers when the avatar is clicked"),
  },
  themeVars: parseScssVar(styles.themeVars),
};

export const imageComponentRenderer = createComponentRenderer<ImageComponentDef>(
  "Image",
  ({ node, extractValue, layoutCss, extractResourceUrl }) => {
    return (
      <Image
        src={extractResourceUrl(node.props.src)}
        alt={extractValue(node.props.alt)}
        fit={extractValue(node.props.fit)}
        lazyLoad={extractValue.asOptionalBoolean(node.props.lazyLoad)}
        aspectRatio={extractValue(node.props.aspectRatio)}
        layout={layoutCss}
      />
    );
  },
  metadata,
);
