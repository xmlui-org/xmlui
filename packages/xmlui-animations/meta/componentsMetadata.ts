import { AnimationMd } from "../src/Animation";
import { FadeAnimationMd } from "../src/FadeAnimation";
import { FadeInAnimationMd } from "../src/FadeInAnimation";
import { FadeOutAnimationMd } from "../src/FadeOutAnimation";
import { ScaleAnimationMd } from "../src/ScaleAnimation";
import { SlideInAnimationMd } from "../src/SlideInAnimation";

export const componentMetadata = {
  name: "Animations",
  metadata: {
    animation: AnimationMd,
    fadeAnimation: FadeAnimationMd,
    fadeInAnimation: FadeInAnimationMd,
    fadeOutAnimation: FadeOutAnimationMd,
    scaleAnimation: ScaleAnimationMd,
    slideInAnimation: SlideInAnimationMd,
  },
};
