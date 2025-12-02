import type { Option } from "../abstractions";
import { useEffect } from "react";
import { useSelect } from "./SelectContext";

export function HiddenOption(option: Option) {
  const { onOptionAdd, onOptionRemove} = useSelect();

  useEffect(() => {
    // Add the option when it's created or updated
    onOptionAdd(option);

    // Remove the same option object when unmounting or before re-adding with new values
    return () => {
      onOptionRemove(option);
    };
  }, [option, onOptionAdd, onOptionRemove]);

  return null;
}
