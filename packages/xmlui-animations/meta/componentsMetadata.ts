import { AnimationMd } from "../src/Animation";
import { FadeAnimationMd } from "../src/FadeAnimation";
import { FadeInAnimationMd } from "../src/FadeInAnimation";
import { FadeOutAnimationMd } from "../src/FadeOutAnimation";
import { ScaleAnimationMd } from "../src/ScaleAnimation";
import { SlideInAnimationMd } from "../src/SlideInAnimation";

export const componentMetadata = {
  name: "Animations",
  description: "This package contains components that deal with different sorts of animations.\n" +
    "These components can wrap other components and provide different sorts of animations " +
    "that run when the child component visibility changes.",
  metadata: {
    Animation: AnimationMd,
    FadeAnimation: FadeAnimationMd,
    FadeInAnimation: FadeInAnimationMd,
    FadeOutAnimation: FadeOutAnimationMd,
    ScaleAnimation: ScaleAnimationMd,
    SlideInAnimation: SlideInAnimationMd,
  },
};
