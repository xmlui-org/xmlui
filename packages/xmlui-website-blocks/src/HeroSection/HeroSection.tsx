import styles from "./HeroSection.module.scss";

import { createComponentRenderer, createMetadata, dComponent, parseScssVar } from "xmlui";
import { HeroSection } from "./HeroSectionNative";

const COMP = "HeroSection";

export const HeroSectionMd = createMetadata({
  status: "experimental",
  description: "HeroSection",
  parts: {
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
    main: {
      description: "The main content area of the hero section",
    },
    image: {
      description: "The image for the hero section",
    },
  },
  props: {
    alignHeading: {
      description: "Alignment of the heading section",
      type: "string",
      defaultValue: "center",
      options: ["start", "center", "end"],
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
    image: {
      description: "The image for the hero section",
      type: "string",
    },
    fullWidthBackground: {
      description: "Whether the background should span the full width of the viewport",
      type: "boolean",
      defaultValue: false,
    },
  },
  events: {
    ctaClick: {
      description: "Triggered when the call-to-action button is clicked",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingTop-${COMP}`]: "$space-12",
    [`paddingBottom-${COMP}`]: "$space-12",
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
        alignHeading={extractValue(props.alignHeading)}
        preamble={extractValue(props.preamble)}
        headline={extractValue(props.headline)}
        subheadline={extractValue(props.subheadline)}
        mainText={extractValue(props.mainText)}
        mainTextTemplate={renderChild(props.mainTextTemplate as any)}
        ctaButtonIcon={extractValue(props.ctaButtonIcon)}
        ctaButtonText={extractValue(props.ctaButtonText)}
        ctaButtonTemplate={renderChild(props.ctaButtonTemplate as any)}
        image={extractValue(props.image)}
        fullWidthBackground={extractValue.asOptionalBoolean(props.fullWidthBackground)}
        className={extractValue(className)}
        onCtaClick={lookupEventHandler("ctaClick")}
      >
        {renderChild(node.children)}
      </HeroSection>
    );
  },
);
