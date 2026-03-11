import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useRef } from "react";
import classnames from "classnames";

import styles from "./StickySection.module.scss";

// =====================================================================================================================
// StickySection React component

export const defaultProps = {
  stickTo: "top" as const,
};

type Props = {
  children?: ReactNode;
  stickTo?: "top" | "bottom";
  uid?: string;
  style?: CSSProperties;
  className?: string;
};

const DATA_ATTR_TOP = "data-sticky-section-top";
const DATA_ATTR_BOTTOM = "data-sticky-section-bottom";

/**
 * Finds the nearest scrollable ancestor of an element.
 */
function findScrollParent(el: HTMLElement): HTMLElement {
  const overflowRegex = /(auto|scroll)/;
  let parent = el.parentElement;
  while (parent && parent !== document.documentElement) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (overflowRegex.test(overflow + overflowY)) return parent;
    parent = parent.parentElement;
  }
  return document.documentElement as HTMLElement;
}

/**
 * Recomputes z-indices for all sticky sections of a given direction within a scroll parent.
 *
 * For `top`:  later DOM elements (scrolled past most recently) get higher z-index — natural
 *             paint order already achieves this, but we make it explicit for robustness.
 * For `bottom`: earlier DOM elements (next upcoming section) must win, so they get higher
 *               z-index. Without this the last DOM element would always paint on top, showing
 *               the furthest-away section instead of the nearest one.
 */
function recomputeZIndices(attr: string, scrollParent: HTMLElement) {
  const els = Array.from(
    scrollParent.querySelectorAll<HTMLElement>(`[${attr}]`),
  );
  if (els.length === 0) return;

  // Sort by natural page position (offsetTop ascending = DOM order for our use-cases)
  els.sort((a, b) => a.offsetTop - b.offsetTop);
  const n = els.length;

  if (attr === DATA_ATTR_TOP) {
    // Later element → higher z-index (first = 1, last = n)
    els.forEach((el, i) => {
      el.style.zIndex = String(i + 1);
    });
  } else {
    // Earlier element → higher z-index (first = n, last = 1)
    els.forEach((el, i) => {
      el.style.zIndex = String(n - i);
    });
  }
}

export const StickySection = forwardRef<HTMLDivElement, Props>(function StickySection(
  { children, stickTo = defaultProps.stickTo, uid, style, className },
  ref,
) {
  const innerRef = useRef<HTMLDivElement>(null);

  // Compose external ref with internal ref
  const composedRef = (node: HTMLDivElement | null) => {
    (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const attr = stickTo === "top" ? DATA_ATTR_TOP : DATA_ATTR_BOTTOM;
    el.setAttribute(attr, "true");

    const scrollParent = findScrollParent(el);

    // Defer so all sibling StickySection instances have had a chance to mount and
    // register their data attributes first.
    const timer = setTimeout(() => recomputeZIndices(attr, scrollParent), 0);

    return () => {
      clearTimeout(timer);
      el.removeAttribute(attr);
      el.style.zIndex = "";
      // Re-balance remaining siblings after this one unmounts
      recomputeZIndices(attr, scrollParent);
    };
  }, [stickTo]);

  return (
    <div
      ref={composedRef}
      data-uid={uid}
      className={classnames(
        styles.stickySection,
        stickTo === "top" ? styles.stickToTop : styles.stickToBottom,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
});
