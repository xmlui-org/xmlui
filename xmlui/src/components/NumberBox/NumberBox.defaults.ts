import { noop } from "../../components-core/constants";
import { NUMBERBOX_MAX_VALUE } from "./numberbox-abstractions";
import type { ValidationStatus } from "../abstractions";

export const defaultProps = {
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  hasSpinBox: true,
  integersOnly: false,
  zeroOrPositive: false,
  min: -NUMBERBOX_MAX_VALUE,
  max: NUMBERBOX_MAX_VALUE,
  step: 1,
  updateState: noop,
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
};
