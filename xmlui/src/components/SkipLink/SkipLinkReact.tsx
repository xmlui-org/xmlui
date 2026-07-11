import { forwardRef, memo, useState } from "react";
import { createPortal } from "react-dom";
import { defaultProps } from "./SkipLink.defaults";

export type SkipLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  target?: string;
  label?: string;
};

function findSkipTarget(id: string) {
  const escapedId = globalThis.CSS?.escape?.(id) ?? id.replace(/["\\]/g, "\\$&");
  return (
    document.getElementById(id) ??
    document.querySelector<HTMLElement>(`[data-xmlui-id="${escapedId}"]`) ??
    document.querySelector<HTMLElement>(`[data-testid="${escapedId}"]`)
  );
}

function getFocusableSkipTarget(element: HTMLElement) {
  if (
    element.matches(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    )
  ) {
    return element;
  }
  return (
    element.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    ) ?? element
  );
}

export const SkipLink = memo(forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  {
    target = defaultProps.target,
    label = defaultProps.label,
    style,
    onClick,
    onKeyDown,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const href = target.startsWith("#") ? target : `#${target}`;
  const activateSkipTarget = () => {
    const id = href.slice(1);
    const targetEl = findSkipTarget(id);
    if (!targetEl) return;
    const focusTarget = getFocusableSkipTarget(targetEl);
    focusTarget.focus?.({ preventScroll: true });
    focusTarget.scrollIntoView?.({ block: "start" });
  };
  const link = (
    <a
      {...rest}
      ref={ref}
      href={href}
      style={{
        position: "fixed",
        insetInlineStart: "50%",
        top: focused ? "1rem" : "-999px",
        transform: "translateX(-50%)",
        zIndex: 10000,
        padding: "0.625rem 1rem",
        background: "Canvas",
        color: "CanvasText",
        border: "2px solid currentColor",
        borderRadius: 4,
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.24)",
        font: "600 1rem/1.2 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        outline: focused ? "3px solid Highlight" : undefined,
        outlineOffset: 2,
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        activateSkipTarget();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        activateSkipTarget();
      }}
    >
      {label}
    </a>
  );

  return typeof document === "undefined" ? link : createPortal(link, document.body);
}));
