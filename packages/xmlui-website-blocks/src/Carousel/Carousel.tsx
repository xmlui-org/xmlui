import styles from "./Carousel.module.scss";

import { createComponentRenderer, parseScssVar, createMetadata, d } from "xmlui";

const dDidChange = (componentName: string) => d(`This event is fired when the displayed content of the ${componentName} changes.`);
const orientationOptionMd = ["horizontal", "vertical"];
import { CarouselComponent, defaultProps } from "./CarouselNative";

const COMP = "CarouselNew";

export const CarouselMd = createMetadata({
  status: "stable",
  description:
    `This component displays a slideshow by cycling through elements (images, text, or ` +
    `custom slides) like a carousel.`,
  props: {
    orientation: {
      description:
        "This property indicates the orientation of the carousel. The `horizontal` " +
        "value indicates that the carousel moves horizontally, and the `vertical` " +
        "value indicates that the carousel moves vertically.",
      availableValues: orientationOptionMd,
      valueType: "string",
      defaultValue: defaultProps.orientation,
    },
    indicators: {
      description: "Display the individual slides as buttons (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultProps.indicators,
    },
    controls: {
      description: "Display the previous/next controls (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultProps.controls,
    },
    autoplay: {
      description: "Start scrolling the carousel automatically (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultProps.autoplay,
    },
    loop: {
      description: "Sets whether the carousel should loop back to the start/end when it reaches the last/first slide.",
      valueType: "boolean",
      defaultValue: defaultProps.loop,
    },
    startIndex: {
      description: "The index of the first slide to display.",
      valueType: "number",
      defaultValue: defaultProps.startIndex,
    },
    transitionDuration: {
      description: "The duration of the transition between slides.",
      valueType: "number",
      defaultValue: defaultProps.transitionDuration,
    },
    autoplayInterval: {
      description: "Specifies the interval between autoplay transitions.",
      valueType: "number",
      defaultValue: defaultProps.autoplayInterval,
    },
    stopAutoplayOnInteraction: {
      description: "This property indicates whether autoplay stops on user interaction.",
      valueType: "boolean",
      defaultValue: defaultProps.stopAutoplayOnInteraction,
    },
    prevIcon: {
      description: "The icon to display for the previous control.",
      valueType: "string",
    },
    nextIcon: {
      description: "The icon to display for the next control.",
      valueType: "string",
    },
  },
  events: {
    displayDidChange: dDidChange(COMP),
  },
  apis: {
    canScrollPrev: {
      description: `This method returns \`true\` if the carousel can scroll to the previous slide.`,
      signature: "canScrollPrev(): boolean",
    },
    canScrollNext: {
      description: `This method returns \`true\` if the carousel can scroll to the next slide.`,
      signature: "canScrollNext(): boolean",
    },
    scrollTo: {
      description: `This method scrolls the carousel to the specified slide index.`,
      signature: "scrollTo(index: number): void",
      parameters: {
        index: "The index of the slide to scroll to.",
      },
    },
    scrollPrev: {
      signature: "scrollPrev(): void",
      description: "This method scrolls the carousel to the previous slide.",
    },
    scrollNext: {
      signature: "scrollNext(): void",
      description: "This method scrolls the carousel to the next slide.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-control-${COMP}`]: "$color-primary",
    [`textColor-control-${COMP}`]: "$textColor",
    [`backgroundColor-control-hover-${COMP}`]: "$color-primary",
    [`textColor-control-hover-${COMP}`]: "$textColor",
    [`backgroundColor-control-active-${COMP}`]: "$color-primary",
    [`backgroundColor-control-disabled-${COMP}`]: "$color-surface-200",
    [`textColor-control-disabled-${COMP}`]: "$textColor-disabled",
    [`textColor-control-active-${COMP}`]: "$color-primary",
    [`backgroundColor-indicator-${COMP}`]: "$color-surface-200",
    [`backgroundColor-indicator-active-${COMP}`]: "$color-primary",
    [`textColor-indicator-${COMP}`]: "$color-primary",
    [`textColor-indicator-active-${COMP}`]: "$color-primary",
    [`backgroundColor-indicator-hover-${COMP}`]: "$color-surface-200",
    [`textColor-indicator-hover-${COMP}`]: "$color-primary",
    [`width-indicator-${COMP}`]: "25px",
    [`height-indicator-${COMP}`]: "6px",
    [`height-control-${COMP}`]: "36px",
    [`width-control-${COMP}`]: "36px",
    [`borderRadius-control-${COMP}`]: "50%",
    [`height-${COMP}`]: "100%",
    [`width-${COMP}`]: "100%",
  },
} as const);

export const carouselComponentRenderer = createComponentRenderer(
  COMP,
  CarouselMd,
  ({ node, renderChild, className, extractValue, lookupEventHandler, registerComponentApi }) => {
    const props = (node.props as typeof CarouselMd.props)!;
    return (
      <CarouselComponent
        className={className}
        stopAutoplayOnInteraction={extractValue.asOptionalBoolean(
          props.stopAutoplayOnInteraction,
        )}
        autoplayInterval={extractValue.asOptionalNumber(props.autoplayInterval)}
        transitionDuration={extractValue.asOptionalNumber(props.transitionDuration)}
        indicators={extractValue.asOptionalBoolean(props.indicators)}
        controls={extractValue.asOptionalBoolean(props.controls)}
        orientation={extractValue(props.orientation)}
        onDisplayDidChange={lookupEventHandler("displayDidChange")}
        autoplay={extractValue.asOptionalBoolean(props.autoplay)}
        registerComponentApi={registerComponentApi}
        loop={extractValue.asOptionalBoolean(props.loop)}
        startIndex={extractValue.asOptionalNumber(props.startIndex)}
        prevIcon={extractValue(props.prevIcon)}
        nextIcon={extractValue(props.nextIcon)}
      >
        {renderChild(node.children)}
      </CarouselComponent>
    );
  },
);
