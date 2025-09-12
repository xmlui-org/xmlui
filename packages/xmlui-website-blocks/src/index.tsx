import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";
import { fancyButtonComponentRenderer } from "./FancyButton/FancyButton";
import { carouselComponentRenderer } from "./Carousel/Carousel";

export default {
  namespace: "XMLUIExtensions",
  components: [
    heroSectionComponentRenderer,
    scrollToTopComponentRenderer,
    fancyButtonComponentRenderer,
    carouselComponentRenderer,
  ],
};
