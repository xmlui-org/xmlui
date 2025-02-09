import { createMetadata, d } from "../../abstractions/ComponentDefs";

import { createComponentRenderer } from "../../components-core/renderers";
import { CarouselComponent } from "./CarouselNative";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./Carousel.module.scss";
import { dDidChange } from "../metadata-helpers";

const COMP = "Carousel";

export const CarouselMd = createMetadata({
  status: "in progress",
  description:
    `This component displays a slideshow by cycling through elements (images, text, or ` +
    `custom slides) like a carousel.`,
  props: {
    orientation: d(
      "This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.",
      ["horizontal", "vertical"],
      null,
      "horizontal",
    ),
    indicators: d(
      "This property indicates whether the carousel displays the indicators.",
      null,
      null,
      "true",
    ),
    controls: d(
      "This property indicates whether the carousel displays the controls.",
      null,
      null,
      "true",
    ),
    autoplay: d(
      "This property indicates whether the carousel automatically scrolls.",
      null,
      null,
      "false",
    ),
    loop: d("This property indicates whether the carousel loops.", null, null, "false"),
    startIndex: d(
      "This property indicates the index of the first slide to display.",
      null,
      null,
      "0",
    ),
    transitionDuration: d("This property specifies the duration of the transition between slides."),
    autoplayInterval: d("This property specifies the interval between autoplay transitions."),
    stopAutoplayOnInteraction: d("This property indicates whether autoplay stops on interaction."),
    prevIcon: d("This property specifies the icon to display for the previous control."),
    nextIcon: d("This property specifies the icon to display for the next control."),
    keyboard: d("This property indicates whether the carousel responds to keyboard events."),
  },
  events: {
    displayDidChange: dDidChange(COMP),
  },
  apis: {
    canScrollPrev: d(
      "This method returns `true` if the carousel can scroll to the previous slide.",
    ),
    canScrollNext: d("This method returns `true` if the carousel can scroll to the next slide."),
    scrollTo: d("This method scrolls the carousel to the specified slide index."),
    scrollPrev: d("This method scrolls the carousel to the previous slide."),
    scrollNext: d("This method scrolls the carousel to the next slide."),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-control-${COMP}`]: "$color-primary",
    [`color-text-control-${COMP}`]: "$color-text",
    [`color-bg-control-hover-${COMP}`]: "$color-primary",
    [`color-text-control-hover-${COMP}`]: "$color-text",
    [`color-bg-control-active-${COMP}`]: "$color-primary",
    [`color-bg-control-disabled-${COMP}`]: "$color-surface-200",
    [`color-text-control-disabled-${COMP}`]: "$color-text-disabled",
    [`color-text-control-active-${COMP}`]: "$color-primary",
    [`color-bg-indicator-${COMP}`]: "$color-surface-200",
    [`color-bg-indicator-active-${COMP}`]: "$color-primary",
    [`color-text-indicator-${COMP}`]: "$color-primary",
    [`color-text-indicator-active-${COMP}`]: "$color-primary",
    [`color-bg-indicator-hover-${COMP}`]: "$color-surface-200",
    [`color-text-indicator-hover-${COMP}`]: "$color-primary",
    [`width-indicator-${COMP}`]: "25px",
    [`height-indicator-${COMP}`]: "6px",
    [`height-control-${COMP}`]: "36px",
    [`width-control-${COMP}`]: "36px",
    [`radius-control-${COMP}`]: "50%",
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
