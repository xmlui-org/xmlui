import { AnimationMd } from "../src/Animation";
import { FadeAnimationMd } from "../src/FadeAnimation";
import { FadeInAnimationMd } from "../src/FadeInAnimation";
import { FadeOutAnimationMd } from "../src/FadeOutAnimation";
import { ScaleAnimationMd } from "../src/ScaleAnimation";
import { SlideInAnimationMd } from "../src/SlideInAnimation";

export const componentMetadata = {
  name: "Animations",
  metadata: {
    Animation: AnimationMd,
    FadeAnimation: FadeAnimationMd,
    FadeInAnimation: FadeInAnimationMd,
    FadeOutAnimation: FadeOutAnimationMd,
    ScaleAnimation: ScaleAnimationMd,
    SlideInAnimation: SlideInAnimationMd,
  },
};
