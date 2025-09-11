import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";
import { fancyButtonComponentRenderer } from "./FancyButton/FancyButton";

export default {
  namespace: "XMLUIExtensions",
  components: [heroSectionComponentRenderer, scrollToTopComponentRenderer, fancyButtonComponentRenderer],
};
