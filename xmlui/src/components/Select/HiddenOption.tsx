import type { Option } from "../abstractions";
import { useOption } from "./OptionContext";
import React, { useEffect, useMemo, useState } from "react";

export function HiddenOption(option: Option) {
  const { optionRenderer, label } = option;
  const { onOptionRemove, onOptionAdd } = useOption();
  const [node, setNode] = useState(null);
  const opt: Option = useMemo(() => {
    return {
      ...option,
      label: label ?? node?.textContent ?? "",
      keywords: [label ?? node?.textContent ?? ""],
    };
  }, [option, node]);

  useEffect(() => {
    onOptionAdd(opt);
    return () => onOptionRemove(opt);
  }, [opt, onOptionAdd, onOptionRemove]);

  return (
    <div ref={(el) => setNode(el)} style={{ display: "none" }}>
      {optionRenderer?.({})}
    </div>
  );
}
