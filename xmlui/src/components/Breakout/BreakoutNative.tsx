import { useRef, useState, type ReactNode, type CSSProperties } from "react";

import styles from "./Breakout.module.scss";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
};

export const Breakout = ({ children, style, ...rest }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [breakoutStyle, setBreakoutStyle] = useState<CSSProperties>({});
  const calculatedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const updateBreakoutStyle = () => {
      if (!ref.current) return;

      // Get the element's position WITHOUT margins applied
      // We need to temporarily remove margins to get the true container position
      const currentMarginLeft = ref.current.style.marginLeft;
      const currentMarginRight = ref.current.style.marginRight;
      const currentWidth = ref.current.style.width;

      ref.current.style.marginLeft = "0px";
      ref.current.style.marginRight = "0px";
      ref.current.style.width = "auto";

      const rect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Restore previous values temporarily
      ref.current.style.marginLeft = currentMarginLeft;
      ref.current.style.marginRight = currentMarginRight;
      ref.current.style.width = currentWidth;

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
    <div {...rest} ref={ref} style={{ ...breakoutStyle, ...style }} className={styles.breakout}>
      {children}
    </div>
  );
};
