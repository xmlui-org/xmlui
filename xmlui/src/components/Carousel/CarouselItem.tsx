import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { CarouselItemComponent } from "./CarouselItemNative";

const COMP = "CarouselItem";

export const CarouselItemMd = createMetadata({
  status: "in progress",
});

export const carouselItemComponentRenderer = createComponentRenderer(
  COMP,
  CarouselItemMd,
  (rendererContext) => {
    const { node, renderChild } = rendererContext;
    return <CarouselItemComponent>{renderChild(node.children)}</CarouselItemComponent>;
  },
);
