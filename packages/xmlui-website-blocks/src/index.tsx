import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";
import { carouselComponentRenderer } from "./Carousel/Carousel";

export default {
  namespace: "XMLUIExtensions",
  components: [heroSectionComponentRenderer, scrollToTopComponentRenderer, carouselComponentRenderer],
};
