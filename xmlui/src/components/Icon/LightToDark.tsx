import Icon from "./svg/light_to_dark.svg?react";
import type {IconBaseProps} from "./IconNative";

export const LightToDarkIcon = (props: IconBaseProps) => (
  <Icon fill="currentColor" stroke="currentColor" strokeWidth={0} {...props} />
);
