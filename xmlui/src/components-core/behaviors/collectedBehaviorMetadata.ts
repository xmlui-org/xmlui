import { animationBehavior } from "./AnimationBehavior";
import { bookmarkBehavior } from "./BookmarkBehavior";
import { displayWhenBehavior } from "./DisplayWhenBehavior";
import { formBindingBehavior } from "./FormBindingBehavior";
import { labelBehavior } from "./LabelBehavior";
import { tooltipBehavior } from "./TooltipBehavior";
import { validationBehavior } from "./ValidationBehavior";
import { variantBehavior } from "./VariantBehavior";

export const collectedBehaviorMetadata = {
  animation: animationBehavior.metadata,
  bookmark: bookmarkBehavior.metadata,
  displayWhen: displayWhenBehavior.metadata,
  formBinding: formBindingBehavior.metadata,
  label: labelBehavior.metadata,
  tooltip: tooltipBehavior.metadata,
  validation: validationBehavior.metadata,
  variant: variantBehavior.metadata,
};
