import styles from "./HeroSection.module.scss";

import { createComponentRenderer, createMetadata, dComponent, d, parseScssVar } from "xmlui";
import { HeroSection, defaultProps } from "./HeroSectionNative";

const COMP = "HeroSection";

export const HeroSectionMd = createMetadata({
  status: "experimental",
  description: "HeroSection",
  parts: {
    header: {
      description: "The header section containing all text content and CTA button",
    },
    content: {
      description: "The content section containing image and children",
    },
    headingSection: {
      description: "The heading section containing preamble, headline, and subheadline",
    },
    preamble: {
      description: "The preamble text for the hero section",
    },
    headline: {
      description: "The headline text for the hero section",
    },
    subheadline: {
      description: "The subheadline text for the hero section",
    },
    mainText: {
      description: "The main text content for the hero section",
    },
    ctaButton: {
      description: "The call-to-action button for the hero section",
    },
    image: {
      description: "The image for the hero section",
    },
    background: {
      description: "The background template area of the hero section",
    },
  },
  props: {
    headerAlignment: {
      description: "Alignment of the header content",
      type: "string",
      defaultValue: "center",
      options: ["start", "center", "end"],
    },
    contentPlacement: {
      description: "Position of the content area relative to the header",
      type: "string", 
      defaultValue: defaultProps.contentPlacement,
      options: ["left", "right", "bottom"],
    },
    contentAlignment: {
      description: "Horizontal alignment of the content within its area",
      type: "string",
      defaultValue: defaultProps.contentAlignment,
      options: ["start", "center", "end"],
    },
    headerWidth: {
      description: "Width of the header section in horizontal layouts",
      type: "string",
      defaultValue: defaultProps.headerWidth,
    },
    contentWidth: {
      description: "Width of the hero content (header + content sections)",
      type: "string",
      defaultValue: defaultProps.contentWidth,
    },
    gap: {
      description: "Gap between header and content sections",
      type: "string",
    },
    preamble: {
      description: "The preamble text for the hero section",
      type: "string",
    },
    headline: {
      description: "The headline text for the hero section",
      type: "string",
    },
    subheadline: {
      description: "The subheadline text for the hero section",
      type: "string",
    },
    mainText: {
      description: "The main text content for the hero section",
      type: "string",
    },
    mainTextTemplate: dComponent("The template for the text content in the hero section"),
    ctaButtonIcon: {
      description: "The icon for the call-to-action button",
      type: "string",
    },
    ctaButtonText: {
      description: "The text for the call-to-action button",
      type: "string",
    },
    ctaButtonTemplate: dComponent("The template for the call-to-action button"),
    fullWidthBackground: {
      description: "Whether the background should span the full width of the viewport",
      type: "boolean",
      defaultValue: defaultProps.fullWidthBackground,
    },
    image: {
      description: "The image for the hero section",
      type: "string",
    },
    imageWidth: {
      description: "The width of the image",
      type: "string",
    },
    imageHeight: {
      description: "The height of the image",
      type: "string",
    },
    backgroundTemplate: dComponent("The template for the background of the hero section"),
  },
  events: {
    ctaClick: d("Triggered when the call-to-action button is clicked"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingTop-${COMP}`]: "$space-12",
    [`paddingBottom-${COMP}`]: "$space-12",
    [`paddingHorizontal-${COMP}`]: "$space-12",
    [`fontSize-headline-${COMP}`]: "3em",
    [`fontWeight-headline-${COMP}`]: "$fontWeight-bold",
    [`lineHeight-headline-${COMP}`]: "1.4em",
    [`gap-headline-${COMP}`]: "$space-8",
    [`fontSize-subheadline-${COMP}`]: "2em",
    [`lineHeight-subheadline-${COMP}`]: "1.1em",
    [`fontWeight-subheadline-${COMP}`]: "$fontWeight-bold",
    [`gap-subheadline-${COMP}`]: "$space-4",
    [`fontSize-mainText-${COMP}`]: "1.4em",
    [`lineHeight-mainText-${COMP}`]: "1.1em",
    [`gap-mainText-${COMP}`]: "$space-4",
  },
});

export const heroSectionComponentRenderer = createComponentRenderer(
  COMP,
  HeroSectionMd,
  ({ node, extractValue, renderChild, lookupEventHandler, className }) => {
    const props = (node.props as typeof HeroSectionMd.props)!;
    return (
      <HeroSection
        headerAlignment={extractValue(props.headerAlignment)}
        contentPlacement={extractValue(props.contentPlacement)}
        contentAlignment={extractValue(props.contentAlignment)}
        headerWidth={extractValue(props.headerWidth)}
        contentWidth={extractValue(props.contentWidth)}
        gap={extractValue(props.gap)}
        preamble={extractValue(props.preamble)}
        headline={extractValue(props.headline)}
        subheadline={extractValue(props.subheadline)}
        mainText={extractValue(props.mainText)}
        mainTextTemplate={renderChild(props.mainTextTemplate as any)}
        ctaButtonIcon={extractValue(props.ctaButtonIcon)}
        ctaButtonText={extractValue(props.ctaButtonText)}
        ctaButtonTemplate={renderChild(props.ctaButtonTemplate as any)}
        image={extractValue(props.image)}
        imageWidth={extractValue(props.imageWidth)}
        imageHeight={extractValue(props.imageHeight)}
        fullWidthBackground={extractValue.asOptionalBoolean(props.fullWidthBackground)}
        className={extractValue(className)}
        onCtaClick={lookupEventHandler("ctaClick")}
        backgroundTemplate={renderChild(props.backgroundTemplate as any)}
      >
        {renderChild(node.children)}
      </HeroSection>
    );
  },
);
