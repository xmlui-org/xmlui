import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { defaultProps } from "./StickyBox.defaults";

const styles = {
  wrapper: "wrapper",
  toTop: "toTop",
  toBottom: "toBottom",
  sentinel: "sentinel",
};

export type StickyBoxProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: ReactNode;
  to?: "top" | "bottom";
};

export const StickyBox = forwardRef<HTMLDivElement, StickyBoxProps>(function StickyBox(
  { children, className, style, to = defaultProps.to, ...rest },
  ref,
) {
  return (
    <>
      <div
        {...rest}
        ref={ref}
        className={cx(styles.wrapper, to === "top" ? styles.toTop : styles.toBottom, className)}
        style={style as CSSProperties}
      >
        {children}
      </div>
      <div aria-hidden="true" className={to === "top" ? styles.sentinel : undefined} hidden />
    </>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
