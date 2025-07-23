import styles from "./Carousel.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dDidChange } from "../metadata-helpers";
import { CarouselComponent, defaultProps } from "./CarouselNative";
import { orientationOptionMd } from "../abstractions";

const COMP = "Carousel";

export const CarouselMd = createMetadata({
  status: "in progress",
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
      description: "This property indicates whether the carousel displays the indicators.",
      valueType: "boolean",
      defaultValue: defaultProps.indicators,
    },
    controls: {
      description: "This property indicates whether the carousel displays the controls.",
      valueType: "boolean",
      defaultValue: defaultProps.controls,
    },
    autoplay: {
      description: "This property indicates whether the carousel automatically scrolls.",
      valueType: "boolean",
      defaultValue: defaultProps.autoplay,
    },
    loop: {
      description: "This property indicates whether the carousel loops.",
      valueType: "boolean",
      defaultValue: defaultProps.loop,
    },
    startIndex: {
      description: "This property indicates the index of the first slide to display.",
      valueType: "number",
      defaultValue: defaultProps.startIndex,
    },
    transitionDuration: {
      description: "This property indicates the duration of the transition between slides.",
      valueType: "number",
      defaultValue: defaultProps.transitionDuration,
    },
    autoplayInterval: {
      description: "This property specifies the interval between autoplay transitions.",
      valueType: "number",
      defaultValue: defaultProps.autoplayInterval,
    },
    stopAutoplayOnInteraction: {
      description: "This property indicates whether autoplay stops on interaction.",
      valueType: "boolean",
      defaultValue: defaultProps.stopAutoplayOnInteraction,
    },
    prevIcon: {
      description: "This property specifies the icon to display for the previous control.",
      valueType: "string",
    },
    nextIcon: {
      description: "This property specifies the icon to display for the next control.",
      valueType: "string",
    },
    keyboard: {
      description: "This property indicates whether the carousel responds to keyboard events.",
      valueType: "boolean",
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
  themeVarDescriptions: {
    [`width-indicator-${COMP}`]: "Sets the width of the indicator.",
  },
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
});

export const carouselComponentRenderer = createComponentRenderer(
  COMP,
  CarouselMd,
  ({ node, renderChild, layoutCss, extractValue, lookupEventHandler, registerComponentApi }) => {
    return (
      <CarouselComponent
        style={layoutCss}
        stopAutoplayOnInteraction={extractValue.asOptionalBoolean(
          node.props?.stopAutoplayOnInteraction,
        )}
        autoplayInterval={extractValue.asOptionalNumber(node.props?.autoplayInterval)}
        transitionDuration={extractValue.asOptionalNumber(node.props?.transitionDuration)}
        indicators={extractValue.asOptionalBoolean(node.props?.indicators)}
        controls={extractValue.asOptionalBoolean(node.props?.controls)}
        orientation={extractValue(node.props?.orientation)}
        onDisplayDidChange={lookupEventHandler("displayDidChange")}
        autoplay={extractValue.asOptionalBoolean(node.props?.autoplay)}
        registerComponentApi={registerComponentApi}
        loop={extractValue.asOptionalBoolean(node.props?.loop)}
        startIndex={extractValue.asOptionalNumber(node.props?.startIndex)}
        prevIcon={extractValue(node.props?.prevIcon)}
        nextIcon={extractValue(node.props?.nextIcon)}
        keyboard={extractValue.asOptionalBoolean(node.props?.keyboard)}
      >
        {renderChild(node.children)}
      </CarouselComponent>
    );
  },
);
