import { forwardRef, memo, useState } from "react";
import { defaultProps } from "./SkipLink.defaults";

export type SkipLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  target?: string;
  label?: string;
};

export const SkipLink = memo(forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  {
    target = defaultProps.target,
    label = defaultProps.label,
    style,
    onClick,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const href = target.startsWith("#") ? target : `#${target}`;
  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      style={{
        position: "fixed",
        insetInlineStart: "1rem",
        top: focused ? "1rem" : "-999px",
        zIndex: 10000,
        padding: "0.5rem 0.75rem",
        background: "Canvas",
        color: "CanvasText",
        border: "2px solid currentColor",
        borderRadius: 4,
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
        const id = href.slice(1);
        const targetEl = document.getElementById(id);
        targetEl?.focus?.({ preventScroll: true });
        targetEl?.scrollIntoView?.({ block: "start" });
      }}
    >
      {label}
    </a>
  );
}));
