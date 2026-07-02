import * as React from "react";
import { useEffect, useRef } from "react";
import { useComposedRef } from "./useComposedRef";

const noop = () => {};

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Style = Omit<NonNullable<TextAreaProps["style"]>, "maxHeight" | "minHeight"> & {
  height?: number;
};

interface TextAreaAutosizeProps extends Omit<TextAreaProps, "style"> {
  maxRows?: number;
  minRows?: number;
  style?: Style;
}

const TextAreaResizable: React.ForwardRefRenderFunction<HTMLTextAreaElement, TextAreaAutosizeProps> = (
  { maxRows, minRows, onChange = noop, style, ...props },
  userRef
) => {
  const libRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = useComposedRef(libRef, userRef);
  const [minCompHeight, setMinCompHeight] = React.useState<number>();
  const [maxCompHeight, setMaxCompHeight] = React.useState<number>();

  useEffect(() => {
    if (!libRef.current) return;

    // --- Simple get the physical sizes of the component...
    const style = getComputedStyle(libRef.current as HTMLElement);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingSize = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderSize = parseFloat(style.borderTop) + parseFloat(style.borderBottom);
    const extraSize = (style.boxSizing === "border-box" ? borderSize : 0) + paddingSize;

    // --- ... and calculate the min and max heights based on the line height
    setMinCompHeight(lineHeight * (minRows ?? 1) + extraSize);
    setMaxCompHeight(lineHeight * (maxRows ?? 10_000) + extraSize);
  }, [maxRows, minRows]);

  return (
    <textarea
      ref={ref}
      {...props}
      onChange={onChange}
      style={{ ...style, minHeight: minCompHeight, maxHeight: maxCompHeight }}
    />
  );
};

export default React.forwardRef(TextAreaResizable);
