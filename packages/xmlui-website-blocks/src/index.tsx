import { helloComponentRenderer } from "./Hello/Hello";
import { heroSectionComponentRenderer } from "./HeroSection/HeroSection";

export default {
  namespace: "XMLUIExtensions",
  components: [helloComponentRenderer, heroSectionComponentRenderer],
};
