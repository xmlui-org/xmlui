import { scaleAnimationRenderer } from "./ScaleAnimation";
import { fadeInAnimationRenderer } from "./FadeInAnimation";
import { slideInAnimationRenderer } from "./SlideInAnimation";
import { fadeOutAnimationRenderer } from "./FadeOutAnimation";
import { animationComponentRenderer } from "./Animation";

const animations = [
  animationComponentRenderer,
  fadeInAnimationRenderer,
  fadeOutAnimationRenderer,
  slideInAnimationRenderer,
  scaleAnimationRenderer,
];

export default animations;
