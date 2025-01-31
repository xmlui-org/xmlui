import { scaleAnimationRenderer } from "./ScaleAnimation";
import { fadeInAnimationRenderer } from "./FadeInAnimation";
import { slideInAnimationRenderer } from "./SlideInAnimation";
import { fadeOutAnimationRenderer } from "./FadeOutAnimation";
import { animationComponentRenderer } from "./Animation";
import { fadeAnimationRenderer } from "./FadeAnimation";

const animations = [
  animationComponentRenderer,
  fadeAnimationRenderer,
  fadeInAnimationRenderer,
  fadeOutAnimationRenderer,
  slideInAnimationRenderer,
  scaleAnimationRenderer,
];

export default animations;
