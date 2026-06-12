import { noop } from "../../components-core/constants";
import type { ValidationStatus } from "../abstractions";

export const defaultProps = {
  type: "text" as "text" | "password" | "search",
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  invalidMessages: [] as string[],
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
  onKeyDown: noop,
  updateState: noop,
  passwordVisibleIcon: "eye",
  passwordHiddenIcon: "eye-off",
  autoComplete: "off" as string | boolean,
};
