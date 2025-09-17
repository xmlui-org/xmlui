import { memo } from "react";
import type { Option } from "../abstractions";
import { useOptionType } from "./OptionTypeProvider";

// Default props for Option component
export const defaultProps = {
  enabled: true,
};

export function convertOptionValue(value: any): any {
  if (
    typeof value !== "string" &&
    (typeof value !== "number" ||
      (typeof value === "number" && isNaN(value))) &&
    typeof value !== "boolean" &&
    value !== null
  ) {
    return "";
  }
  return value;
}

export const OptionNative = memo((props: Option) => {
  const OptionType = useOptionType();
  if (!OptionType) {
    return null;
  }
  return <OptionType {...props} />;
});
OptionNative.displayName = "OptionNative";
