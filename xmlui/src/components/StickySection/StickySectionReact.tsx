import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useRef } from "react";

import { defaultProps } from "./StickySection.defaults";

const styles = {
  stickySection: "stickySection",
  stickToTop: "stickToTop",
  stickToBottom: "stickToBottom",
};

const DATA_ATTR_TOP = "data-sticky-section-top";
const DATA_ATTR_BOTTOM = "data-sticky-section-bottom";

export type StickySectionProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: ReactNode;
  stickTo?: "top" | "bottom";
};

export const StickySection = forwardRef<HTMLDivElement, StickySectionProps>(function StickySection(
  { children, className, stickTo = defaultProps.stickTo, style, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) {
      return;
    }
    const attr = stickTo === "top" ? DATA_ATTR_TOP : DATA_ATTR_BOTTOM;
    el.setAttribute(attr, "true");
    const scrollParent = findScrollParent(el);
    const timer = window.setTimeout(() => recomputeZIndices(attr, scrollParent), 0);
    return () => {
      window.clearTimeout(timer);
      el.removeAttribute(attr);
      el.style.zIndex = "";
      recomputeZIndices(attr, scrollParent);
    };
  }, [stickTo]);

  return (
    <div
      {...rest}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cx(
        styles.stickySection,
        stickTo === "top" ? styles.stickToTop : styles.stickToBottom,
        className,
      )}
      style={style as CSSProperties}
    >
      {children}
    </div>
  );
});

function findScrollParent(el: HTMLElement): HTMLElement {
  const overflowRegex = /(auto|scroll)/;
  let parent = el.parentElement;
  while (parent && parent !== document.documentElement) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (overflowRegex.test(`${overflow}${overflowY}`)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
}

function recomputeZIndices(attr: string, scrollParent: HTMLElement) {
  const els = Array.from(scrollParent.querySelectorAll<HTMLElement>(`[${attr}]`));
  if (els.length === 0) {
    return;
  }
  els.sort((a, b) => a.offsetTop - b.offsetTop);
  const count = els.length;
  els.forEach((el, index) => {
    el.style.zIndex = attr === DATA_ATTR_TOP ? String(index + 1) : String(count - index);
  });
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
