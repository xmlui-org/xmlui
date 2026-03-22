import { createComponentRenderer, createMetadata } from "xmlui";
import { CarouselItemComponent } from "./CarouselItemNative";

const COMP = "CarouselItemNew";

export const CarouselItemMd = createMetadata({
  status: "stable",
  description: "A slide item for the CarouselNew component.",
});

export const carouselItemNewComponentRenderer = createComponentRenderer(
  COMP,
  CarouselItemMd,
  (rendererContext) => {
    const { node, renderChild } = rendererContext;
    return <CarouselItemComponent>{renderChild(node.children)}</CarouselItemComponent>;
  },
);
