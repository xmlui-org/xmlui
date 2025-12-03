import type { Option } from "../abstractions";
import { useEffect, useRef } from "react";
import { useOption } from "./OptionContext";

export function HiddenOption(option: Option) {
  const { onOptionAdd, onOptionRemove } = useOption();
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Add the option when it's created or updated
    let textNode: string | undefined;
    if (nodeRef.current) {
      textNode = nodeRef.current.textContent;
    }
    const opt = {
      ...option,
      label: option.label || textNode || option.value,
    };
    onOptionAdd(opt);

    // Remove the same option object when unmounting or before re-adding with new values
    return () => {
      onOptionRemove(opt);
    };
  }, [option, onOptionAdd, onOptionRemove]);

  return (
    <span
      ref={nodeRef}
      style={{ display: "none", visibility: "hidden", width: 0, height: 0, position: "absolute" }}
    >
      {option.children}
    </span>
  );
}
