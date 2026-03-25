import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";
import { fancyButtonRenderer } from "./FancyButton/FancyButton";
import { carouselComponentRenderer } from "./Carousel/Carousel";
import { carouselItemComponentRenderer } from "./Carousel/CarouselItem";
import { backdropComponentRenderer } from "./Backdrop/Backdrop";
import { breakoutComponentRenderer } from "./Breakout/Breakout";

export default {
  namespace: "XMLUIExtensions",
  components: [
    heroSectionComponentRenderer,
    scrollToTopComponentRenderer,
    fancyButtonRenderer,
    carouselComponentRenderer,
    carouselItemComponentRenderer,
    backdropComponentRenderer,
    breakoutComponentRenderer,
  ]
};
