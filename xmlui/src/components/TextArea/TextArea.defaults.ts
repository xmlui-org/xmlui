import { noop } from "../../components-core/constants";

export const defaultProps = {
  value: "",
  placeholder: "",
  required: false,
  readOnly: false,
  allowCopy: true,
  updateState: noop,
  autoFocus: false,
  initialValue: "",
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
  controlled: true,
  enterSubmits: true,
  rows: 2,
  enabled: true,
};
