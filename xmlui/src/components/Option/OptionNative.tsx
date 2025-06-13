import { memo } from "react";
import type { Option } from "../abstractions";
import { useOptionType } from "./OptionTypeProvider";

// Default props for Option component
export const defaultProps = {
  enabled: true
};

export const OptionNative = memo((props: Option) => {
  const OptionType = useOptionType();
  if (!OptionType) {
    return null;
  }
  return <OptionType {...props} />;
});
OptionNative.displayName = "OptionNative";