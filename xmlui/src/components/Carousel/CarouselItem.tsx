import { createMetadata} from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { CarouselItemComponent } from "@components/Carousel/CarouselItemNative";

const COMP = "CarouselItem";

export const CarouselItemMd = createMetadata({});

export const carouselItemComponentRenderer = createComponentRenderer(
  COMP,
  CarouselItemMd,
  (rendererContext) => {
    const { node, renderChild } = rendererContext;
    return <CarouselItemComponent content={renderChild(node.children, {
        type: "Stack",
        orientation: "vertical",
    })} />;
  },
);
