import { scaleAnimationRenderer } from "./ScaleAnimation";
import { fadeInAnimationRenderer } from "./FadeInAnimation";
import { slideInAnimationRenderer } from "./SlideInAnimation";
import { fadeOutAnimationRenderer } from "./FadeOutAnimation";
import { animationComponentRenderer } from "./Animation";
import { fadeAnimationRenderer } from "./FadeAnimation";


export default {
  namespace: "XMLUIExtensions",
  components: [
    animationComponentRenderer,
    fadeAnimationRenderer,
    fadeInAnimationRenderer,
    fadeOutAnimationRenderer,
    slideInAnimationRenderer,
    scaleAnimationRenderer]
};
