import { helloComponentRenderer } from "./Hello/Hello";
import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";
import { scrollToTopComponentRenderer } from "./ScrollToTop/ScrollToTop";

export default {
  namespace: "XMLUIExtensions",
  components: [helloComponentRenderer, heroSectionComponentRenderer, scrollToTopComponentRenderer],
};
