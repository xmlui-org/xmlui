import { useRef, useState, type HTMLAttributes, type CSSProperties, useLayoutEffect, forwardRef, memo, type ForwardedRef } from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

import styles from "./Breakout.module.scss";

type Props = HTMLAttributes<HTMLDivElement>;

export const Breakout = memo(
  forwardRef(function Breakout({ children, style, ...rest }: Props, ref: ForwardedRef<HTMLDivElement>) {
  const innerRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, innerRef);
  const [breakoutStyle, setBreakoutStyle] = useState<CSSProperties>({});
  const calculatedRef = useRef(false);

  useLayoutEffect(() => {
    const updateBreakoutStyle = () => {
      if (!innerRef.current) return;

      // Get the element's position WITHOUT margins applied
      // We need to temporarily remove margins to get the true container position
      const currentMarginLeft = innerRef.current.style.marginLeft;
      const currentMarginRight = innerRef.current.style.marginRight;
      const currentWidth = innerRef.current.style.width;

      innerRef.current.style.marginLeft = "0px";
      innerRef.current.style.marginRight = "0px";
      innerRef.current.style.width = "auto";

      const rect = innerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Restore previous values temporarily
      innerRef.current.style.marginLeft = currentMarginLeft;
      innerRef.current.style.marginRight = currentMarginRight;
      innerRef.current.style.width = currentWidth;

      // Calculate how far the element is from the left edge of the viewport
      const offsetLeft = rect.left;
      const offsetRight = viewportWidth - rect.right;

      const newStyle = {
        marginLeft: `-${offsetLeft}px`,
        marginRight: `-${offsetRight}px`,
        width: `${viewportWidth}px`,
      };

      setBreakoutStyle(newStyle);
      calculatedRef.current = true;
    };

    // Only calculate initially and on window resize
    if (!calculatedRef.current) {
      updateBreakoutStyle();
    }

    // Recalculate on window resize
    const handleResize = () => {
      calculatedRef.current = false;
      updateBreakoutStyle();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div {...rest} ref={composedRef} style={{ ...breakoutStyle, ...style }} className={styles.breakout}>
      {children}
    </div>
  );
}),
);
