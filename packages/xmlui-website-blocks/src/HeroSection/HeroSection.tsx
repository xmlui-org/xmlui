import { createComponentRenderer, createMetadata, dComponent } from "xmlui";
import { HeroSection } from "./HeroSectionNative";

const COMP = "HeroSection";

export const HeroSectionMd = createMetadata({
  status: "experimental",
  description: "HeroSection",
  parts: {
    headline: {
      description: "The headline text for the hero section",
    },
    subheadline: {
      description: "The subheadline text for the hero section",
    },
    text: {
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
    preImage: {
      description: "The template for the image displayed before the main content",
    },
    postImage: {
      description: "The template for the image displayed after the main content",
    },
  },
  props: {
    headline: {
      description: "The headline text for the hero section",
      type: "string",
    },
    subheadline: {
      description: "The subheadline text for the hero section",
      type: "string",
    },
    text: {
      description: "The main text content for the hero section",
      type: "string",
    },
    textTemplate: dComponent("The template for the text content in the hero section"),
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
    preImageTemplate: dComponent("The template for the image displayed before the main content"),
    postImageTemplate: dComponent("The template for the image displayed after the main content"),
    heroTemplate: dComponent("The template for the hero section"),
    breakout: {
      description: "Indicates whether the hero section should be used in a breakout",
      type: "boolean",
    },
  },
  events: {
    ctaClick: {
      description: "Triggered when the call-to-action button is clicked",
    },
  },
});

export const heroSectionComponentRenderer = createComponentRenderer(
  COMP,
  HeroSectionMd,
  ({ node, extractValue, renderChild, lookupEventHandler, className }) => {
    const props = (node.props as typeof HeroSectionMd.props)!;
    return (
      <HeroSection
        headline={extractValue(props.headline)}
        subheadline={extractValue(props.subheadline)}
        text={extractValue(props.text)}
        textTemplate={renderChild(props.textTemplate as any)}
        ctaButtonIcon={extractValue(props.ctaButtonIcon)}
        ctaButtonText={extractValue(props.ctaButtonText)}
        ctaButtonTemplate={renderChild(props.ctaButtonTemplate as any)}
        image={extractValue(props.image)}
        preImageTemplate={renderChild(props.preImageTemplate as any)}
        postImageTemplate={renderChild(props.postImageTemplate as any)}
        heroTemplate={renderChild(props.heroTemplate as any)}
        breakout={extractValue.asOptionalBoolean(props.breakout)}
        className={extractValue(className)}
        onCtaClick={lookupEventHandler("ctaClick")}
      />
    );
  },
);
