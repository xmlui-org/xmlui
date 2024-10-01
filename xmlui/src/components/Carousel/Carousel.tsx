import { createMetadata, d } from "@abstractions/ComponentDefs";

import { createComponentRenderer } from "@components-core/renderers";
import { CarouselComponent } from "./CarouselNative";

const COMP = "Carousel";

export const CarouselMd = createMetadata({
  status: "in progress",
});

export const carouselComponentRenderer = createComponentRenderer(
  COMP,
  CarouselMd,
  ({ node, renderChild, layoutCss }) => {
    return <CarouselComponent style={layoutCss}>{renderChild(node.children)}</CarouselComponent>;
  },
);
