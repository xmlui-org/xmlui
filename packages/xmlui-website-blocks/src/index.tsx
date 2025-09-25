import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";
import { fancyButtonRenderer } from "./FancyButton2/FancyButton";
import { carouselComponentRenderer } from "./Carousel/Carousel";
import { helloRenderer } from "./Hello/Hello";

export default {
  namespace: "XMLUIExtensions",
  components: [
    heroSectionComponentRenderer,
    scrollToTopComponentRenderer,
    fancyButtonRenderer,
    carouselComponentRenderer,
    helloRenderer
  ]
};
