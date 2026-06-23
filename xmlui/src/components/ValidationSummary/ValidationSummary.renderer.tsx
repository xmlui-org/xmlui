import { wrapComponent } from "../../runtime/rendering/adapter";
import { ValidationSummaryMd } from "./ValidationSummary";
import { ValidationSummary } from "./ValidationSummaryReact";

export const validationSummaryRenderer = wrapComponent({
  name: "ValidationSummary",
  metadata: ValidationSummaryMd,
  renderer({ adapter }) {
    return (
      <ValidationSummary
        {...adapter.rootAttrs()}
        fieldValidationResults={adapter.prop("fieldValidationResults")}
        generalValidationResults={adapter.prop("generalValidationResults")}
        className={adapter.className}
        style={adapter.style}
      />
    );
  },
});

