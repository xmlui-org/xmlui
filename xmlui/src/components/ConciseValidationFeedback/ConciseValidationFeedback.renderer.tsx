import { wrapComponent } from "../../runtime/rendering/adapter";
import { ConciseValidationFeedbackMd } from "./ConciseValidationFeedback";
import { ConciseValidationFeedback } from "./ConciseValidationFeedbackReact";

export const conciseValidationFeedbackRenderer = wrapComponent({
  name: "ConciseValidationFeedback",
  metadata: ConciseValidationFeedbackMd,
  renderer({ adapter }) {
    return (
      <ConciseValidationFeedback
        {...adapter.rootAttrs()}
        validationStatus={adapter.stringProp("validationStatus")}
        invalidMessages={adapter.prop("invalidMessages")}
        successIcon={adapter.stringProp("successIcon", "checkmark")}
        errorIcon={adapter.stringProp("errorIcon", "error")}
        className={adapter.className}
        style={adapter.style}
      />
    );
  },
});

