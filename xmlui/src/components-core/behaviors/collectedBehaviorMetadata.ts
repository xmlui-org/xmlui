import { animationBehavior } from "./AnimationBehavior";
import { bookmarkBehavior } from "./BookmarkBehavior";
import { formBindingBehavior } from "./FormBindingBehavior";
import { labelBehavior } from "./LabelBehavior";
import { tooltipBehavior } from "./TooltipBehavior";
import { validationBehavior } from "./ValidationBehavior";
import { variantBehavior } from "./VariantBehavior";

export const collectedBehaviorMetadata = {
  animation: animationBehavior.metadata,
  bookmark: bookmarkBehavior.metadata,
  formBinding: formBindingBehavior.metadata,
  label: labelBehavior.metadata,
  tooltip: tooltipBehavior.metadata,
  validation: validationBehavior.metadata,
  variant: variantBehavior.metadata,
};
