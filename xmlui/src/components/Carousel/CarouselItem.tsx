import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { CarouselItemComponent } from "./CarouselItemNative";

const COMP = "CarouselItem";

export const CarouselItemMd = createMetadata({});

export const carouselItemComponentRenderer = createComponentRenderer(
  COMP,
  CarouselItemMd,
  (rendererContext) => {
    const { node, renderChild } = rendererContext;
    return <CarouselItemComponent>{renderChild(node.children)}</CarouselItemComponent>;
  },
);
