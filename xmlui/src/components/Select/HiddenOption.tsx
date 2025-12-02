import type { Option } from "../abstractions";
import { useOption } from "./OptionContext";
import { useEffect, useMemo, useState } from "react";

export function HiddenOption(option: Option) {
  const { label } = option;
  const { onOptionAdd, onOptionRemove } = useOption();
  const [node, setNode] = useState(null);

  const opt: Option = useMemo(() => {
    return {
      ...option,
      label: label ?? node?.textContent ?? "",
      keywords: option.keywords || [label ?? node?.textContent ?? ""],
      // Store the rendered ReactNode for dropdown display
    };
  }, [option, node, label]);

  useEffect(() => {
    // Add the option when it's created or updated
    onOptionAdd(opt);

    // Remove the same option object when unmounting or before re-adding with new values
    return () => {
      onOptionRemove(opt);
    };
  }, [opt, onOptionAdd, onOptionRemove]);

  return null;
}
