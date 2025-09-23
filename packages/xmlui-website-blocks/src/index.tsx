import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";
import { fancyButtonComponentRenderer } from "./FancyButton/FancyButton";
import { carouselComponentRenderer } from "./Carousel/Carousel";
import { helloRenderer } from "./Hello/Hello";

export default {
  namespace: "XMLUIExtensions",
  components: [
    heroSectionComponentRenderer,
    scrollToTopComponentRenderer,
    fancyButtonComponentRenderer,
    carouselComponentRenderer,
    helloRenderer
  ]
};
