import { animationBehavior } from "./AnimationBehavior";
import { labelBehavior } from "./LabelBehavior";
import { pubSubBehavior } from "./PubSubBehavior";
import { tooltipBehavior } from "./TooltipBehavior";

export const collectedBehaviorMetadata = {
  tooltip: tooltipBehavior.metadata,
  animation: animationBehavior.metadata,
  label: labelBehavior.metadata,
  pubsub: pubSubBehavior.metadata,
};
