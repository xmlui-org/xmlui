import { wrapComponent, createMetadata, type ComponentMetadata } from "xmlui";
import { CarouselItemComponent } from "./CarouselItemNative";

const COMP = "CarouselItem";

export const CarouselItemMd: ComponentMetadata = createMetadata({
  status: "stable",
  description: "A slide item for the Carousel component.",
});

export const carouselItemComponentRenderer = wrapComponent(COMP, CarouselItemComponent, CarouselItemMd);
