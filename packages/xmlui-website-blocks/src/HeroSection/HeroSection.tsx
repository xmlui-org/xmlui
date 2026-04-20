import styles from "./HeroSection.module.scss";

import { wrapComponent, createMetadata, dComponent, d, parseScssVar } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import { HeroSection, defaultProps } from "./HeroSectionReact";

const COMP = "HeroSection";

export const HeroSectionMd: ComponentMetadata = createMetadata({
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
      valueType: "string",
      defaultValue: "center",
      availableValues: ["start", "center", "end"],
    },
    contentPlacement: {
      description: "Position of the content area relative to the header",
      valueType: "string", 
      defaultValue: defaultProps.contentPlacement,
      availableValues: ["left", "right", "bottom"],
    },
    contentAlignment: {
      description: "Horizontal alignment of the content within its area",
      valueType: "string",
      defaultValue: defaultProps.contentAlignment,
      availableValues: ["start", "center", "end"],
    },
    headerWidth: {
      description: "Width of the header section in horizontal layouts",
      valueType: "string",
      defaultValue: defaultProps.headerWidth,
    },
    contentWidth: {
      description: "Width of the hero content (header + content sections)",
      valueType: "string",
      defaultValue: defaultProps.contentWidth,
    },
    gap: {
      description: "Gap between header and content sections",
      valueType: "string",
    },
    preamble: {
      description: "The preamble text for the hero section",
      valueType: "string",
    },
    headline: {
      description: "The headline text for the hero section",
      valueType: "string",
    },
    subheadline: {
      description: "The subheadline text for the hero section",
      valueType: "string",
    },
    mainText: {
      description: "The main text content for the hero section",
      valueType: "string",
    },
    mainTextTemplate: dComponent("The template for the text content in the hero section"),
    ctaButtonIcon: {
      description: "The icon for the call-to-action button",
      valueType: "string",
    },
    ctaButtonText: {
      description: "The text for the call-to-action button",
      valueType: "string",
    },
    ctaButtonTemplate: dComponent("The template for the call-to-action button"),
    fullWidthBackground: {
      description: "Whether the background should span the full width of the viewport",
      valueType: "boolean",
      defaultValue: defaultProps.fullWidthBackground,
    },
    image: {
      description: "The image for the hero section",
      valueType: "string",
    },
    imageWidth: {
      description: "The width of the image",
      valueType: "string",
    },
    imageHeight: {
      description: "The height of the image",
      valueType: "string",
    },
    backgroundTemplate: dComponent("The template for the background of the hero section"),
    headerTone: {
      description: "The tone for the header section, affecting text colors",
      valueType: "string",
      availableValues: ["light", "dark", "reverse"],
      defaultValue: "dark",
    },
    contentTone: {
      description: "The tone for the content section, affecting text colors",
      valueType: "string",
      availableValues: ["light", "dark", "reverse"],
      defaultValue: "dark",
    },
    className: d("Additional CSS class names to apply to the hero section", undefined, "string"),
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
    [`textColor-preamble-${COMP}`]: "$textColor-primary",
    [`textColor-headline-${COMP}`]: "$textColor-primary",
    [`textColor-subheadline-${COMP}`]: "$textColor-primary",
    [`textColor-mainText-${COMP}`]: "$textColor-primary",
  },
});

export const heroSectionComponentRenderer = wrapComponent(COMP, HeroSection, HeroSectionMd, {
  booleans: ["fullWidthBackground"],
  exclude: ["className"],
});
