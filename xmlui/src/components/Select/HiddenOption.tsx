import type { Option } from "../abstractions";
import { useOption } from "./OptionContext";
import React, { useEffect, useMemo, useState } from "react";

export function HiddenOption(option: Option) {
  const { label } = option;
  const { onOptionAdd } = useOption();
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
    onOptionAdd(opt);
    // Don't remove options when component unmounts - they should persist
  }, [opt, onOptionAdd]);

  return (
    <div ref={(el) => setNode(el)} style={{ display: "none" }}>
      {option.children}
    </div>
  );
}
