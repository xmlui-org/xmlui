import type { Option } from "../abstractions";
import { useOption } from "./OptionContext";
import React, { useEffect, useMemo, useState } from "react";

export function HiddenOption(option: Option) {
  const { optionRenderer, label } = option;
  const { onOptionRemove, onOptionAdd } = useOption();
  const [node, setNode] = useState(null);
  
  // Store the rendered content as ReactNode, not DOM element
  const renderedContent = optionRenderer?.({});
  
  const opt: Option = useMemo(() => {
    return {
      ...option,
      label: label ?? node?.textContent ?? "",
      keywords: [label ?? node?.textContent ?? ""],
      // Store the rendered ReactNode for dropdown display
      renderedContent: renderedContent,
    };
  }, [option, node, label, renderedContent]);

  useEffect(() => {
    onOptionAdd(opt);
    return () => onOptionRemove(opt);
  }, [opt, onOptionAdd, onOptionRemove]);

  return (
    <div ref={(el) => setNode(el)} style={{ display: "none" }}>
      {renderedContent}
    </div>
  );
}
