import { createMetadata, d } from "@abstractions/ComponentDefs";

import { createComponentRenderer } from "@components-core/renderers";
import { CarouselComponent } from "./CarouselNative";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "@components/Carousel/Carousel.module.scss";

const COMP = "Carousel";

export const CarouselMd = createMetadata({
  status: "in progress",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-control-${COMP}`]: "$color-bg-primary",
    [`color-text-control-${COMP}`]: "$color-text-primary",
    [`color-bg-control-hover-${COMP}`]: "$color-bg-primary",
    [`color-text-control-hover-${COMP}`]: "$color-text-primary",
    [`color-bg-control-active-${COMP}`]: "$color-bg-primary",
    [`color-bg-control-disabled-${COMP}`]: "$color-surface-200",
    [`color-text-control-disabled-${COMP}`]: "$color-text-disabled",
    [`color-text-control-active-${COMP}`]: "$color-text-primary",
    [`color-bg-indicator-${COMP}`]: "$color-surface-200",
    [`color-bg-indicator-active-${COMP}`]: "$color-bg-primary",
    [`color-text-indicator-${COMP}`]: "$color-text-primary",
    [`color-text-indicator-active-${COMP}`]: "$color-text-primary",
    [`color-bg-indicator-hover-${COMP}`]: "$color-surface-200",
    [`color-text-indicator-hover-${COMP}`]: "$color-text-primary",
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
  ({ node, renderChild, layoutCss }) => {
    return <CarouselComponent style={layoutCss}>{renderChild(node.children)}</CarouselComponent>;
  },
);
