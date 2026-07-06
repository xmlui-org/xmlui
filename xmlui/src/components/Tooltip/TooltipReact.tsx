import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode, Ref } from "react";
import { Children, cloneElement, forwardRef, isValidElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTheme } from "../../components-core/theming/ThemeContext";
import { defaultProps } from "./Tooltip.defaults";
import styles from "./Tooltip.module.scss";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

export type TooltipOptions = {
  delayDuration?: number;
  skipDelayDuration?: number;
  defaultOpen?: boolean;
  showArrow?: boolean;
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
};

export type TooltipProps = TooltipOptions & Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: ReactNode;
  markdown?: string;
  open?: boolean;
  text?: string;
  tooltipTemplate?: ReactNode;
};

export const TooltipComponent = forwardRef<HTMLDivElement, TooltipProps>(function TooltipComponent(
  {
    align = defaultProps.align,
    alignOffset = defaultProps.alignOffset,
    children,
    className,
    defaultOpen = defaultProps.defaultOpen,
    delayDuration = defaultProps.delayDuration,
    skipDelayDuration: _skipDelayDuration = defaultProps.skipDelayDuration,
    avoidCollisions: _avoidCollisions = defaultProps.avoidCollisions,
    markdown,
    open,
    showArrow = defaultProps.showArrow,
    side = defaultProps.side,
    sideOffset = defaultProps.sideOffset,
    style,
    text,
    tooltipTemplate,
    ...rest
  },
  ref,
) {
  const { root } = useTheme();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [hoverOpen, setHoverOpen] = useState(defaultOpen);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const visible = open ?? hoverOpen;
  const content = tooltipTemplate ?? (markdown ? renderTinyMarkdown(markdown) : text);
  const hasTooltip = content !== undefined && content !== null && content !== "";
  const child = Children.count(children) === 1 && isValidElement(children)
    ? children as ReactElement<Record<string, unknown>>
    : null;

  const triggerHandlers = {
    onBlur: composeEventHandlers(child?.props.onBlur, () => setHoverOpen(false)),
    onFocus: composeEventHandlers(child?.props.onFocus, () => setHoverOpen(true)),
    onMouseEnter: composeEventHandlers(child?.props.onMouseEnter, () => {
      window.setTimeout(() => setHoverOpen(true), Number(delayDuration) || 0);
    }),
    onMouseLeave: composeEventHandlers(child?.props.onMouseLeave, () => setHoverOpen(false)),
  };

  const trigger = child ? (
    cloneElement(child, {
      ...triggerHandlers,
      ref: composeRefs((child as ReactElement & { ref?: Ref<HTMLElement> }).ref, triggerRef),
    })
  ) : (
    <span
      className={styles.trigger}
      {...triggerHandlers}
      ref={triggerRef}
    >
      {children}
    </span>
  );

  const tooltip = visible && hasTooltip ? (
    <div
      {...rest}
      ref={ref}
      className={[styles.content, className].filter(Boolean).join(" ")}
      data-side={side}
      data-tooltip-container
      role="tooltip"
      style={{
        ...(style as CSSProperties),
        left: coords.left,
        top: coords.top,
        "--xmlui-tooltip-side-offset": `${Number(sideOffset) || 0}px`,
      } as CSSProperties}
    >
      {content}
      {showArrow ? <span aria-hidden="true" className={styles.arrow} /> : null}
    </div>
  ) : null;
  const portalRoot = root ?? (typeof document === "undefined" ? null : document.body);

  useEffect(() => {
    if (!visible || !triggerRef.current) {
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const offset = Number(sideOffset) || 0;
    const alignDelta = align === "start" ? -rect.width / 4 : align === "end" ? rect.width / 4 : 0;
    const next = side === "left" || side === "right"
      ? {
          left: side === "left" ? rect.left - offset : rect.right + offset,
          top: rect.top + rect.height / 2 + alignDelta + Number(alignOffset || 0),
        }
      : {
          left: rect.left + rect.width / 2 + alignDelta + Number(alignOffset || 0),
          top: side === "top" ? rect.top - offset : rect.bottom + offset,
        };
    setCoords(next);
  }, [align, alignOffset, side, sideOffset, visible]);

  return (
    <span className={styles.root} data-xmlui-component="TooltipTrigger">
      {trigger}
      {portalRoot && tooltip ? createPortal(tooltip, portalRoot) : tooltip}
    </span>
  );
});

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}

function composeEventHandlers(
  originalHandler: unknown,
  ourHandler: () => void,
) {
  return (event: unknown) => {
    if (typeof originalHandler === "function") {
      originalHandler(event);
    }
    ourHandler();
  };
}

export function parseTooltipOptions(input: unknown): Partial<TooltipOptions> {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Partial<TooltipOptions>;
  }
  if (typeof input !== "string") {
    return {};
  }
  const options: Partial<TooltipOptions> = {};
  for (const value of input.split(";").map((item) => item.trim()).filter(Boolean)) {
    const separator = value.indexOf(":");
    if (separator >= 0) {
      const name = value.slice(0, separator).trim();
      const rawValue = value.slice(separator + 1).trim();
      const parsed = parseOptionValue(name, rawValue);
      if (parsed !== undefined) {
        (options as Record<string, unknown>)[name] = parsed;
      }
      continue;
    }
    if (["top", "right", "bottom", "left"].includes(value)) {
      options.side = value as TooltipSide;
    } else if (["start", "center", "end"].includes(value)) {
      options.align = value as TooltipAlign;
    } else if (["defaultOpen", "showArrow", "avoidCollisions"].includes(value)) {
      (options as Record<string, unknown>)[value] = true;
    } else if (value.startsWith("!") && ["defaultOpen", "showArrow", "avoidCollisions"].includes(value.slice(1))) {
      (options as Record<string, unknown>)[value.slice(1)] = false;
    }
  }
  return options;
}

function parseOptionValue(name: string, value: string): unknown {
  if (["delayDuration", "skipDelayDuration", "sideOffset", "alignOffset"].includes(name)) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  if (["defaultOpen", "showArrow", "avoidCollisions"].includes(name)) {
    if (/^(true|1|yes)$/i.test(value)) {
      return true;
    }
    if (/^(false|0|no)$/i.test(value)) {
      return false;
    }
    return undefined;
  }
  if (name === "side" && ["top", "right", "bottom", "left"].includes(value)) {
    return value;
  }
  if (name === "align" && ["start", "center", "end"].includes(value)) {
    return value;
  }
  return undefined;
}

function renderTinyMarkdown(markdown: string): ReactNode {
  const parts = markdown.split(/(`[^`]+`|\*[^*]+\*|_[^_]+_)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}
