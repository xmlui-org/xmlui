import {
  type ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type React from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { createPortal } from "react-dom";
import { isPlainObject } from "lodash-es";
import classnames from "classnames";

import styles from "./Tooltip.module.scss";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Markdown } from "../Markdown/Markdown";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { defaultProps } from "./Tooltip.defaults";

type TooltipOptions = {
  /**
   * The duration from when the mouse enters a tooltip trigger until the tooltip opens
   */
  delayDuration?: number;

  /**
   * How much time a user has to enter another trigger without incurring a delay again
   */
  skipDelayDuration?: number;

  /**
   * The open state of the tooltip when it is initially rendered
   */
  defaultOpen?: boolean;

  /**
   * Whether to show the arrow pointing to the trigger element
   */
  showArrow?: boolean;

  /**
   * The preferred side of the trigger to render against when open
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * The preferred alignment against the trigger
   */
  align?: "start" | "center" | "end";

  /**
   * The distance in pixels from the trigger
   */
  sideOffset?: number;

  /**
   * An offset in pixels from the "start" or "end" alignment options
   */
  alignOffset?: number;

  /**
   * When true, overrides the side and align preferences to prevent collisions with boundary edges
   */
  avoidCollisions?: boolean;
};

type TooltipProps = TooltipOptions & React.HTMLAttributes<HTMLDivElement> & {
  /**
   * The open state of the tooltip externally controlled
   */
  open?: boolean;

  /**
   * The text content to display in the tooltip
   */
  text: string;

  /**
   * The markdown content to display in the tooltip
   */
  markdown?: string;

  /**
   * The template for the tooltip content
   */
  tooltipTemplate?: React.ReactNode;

  classes?: Record<string, string>;
};

export type { TooltipProps, TooltipOptions };

export const Tooltip = memo(forwardRef(function Tooltip({
  text,
  markdown,
  tooltipTemplate,
  delayDuration = defaultProps.delayDuration,
  skipDelayDuration = defaultProps.skipDelayDuration,
  defaultOpen = defaultProps.defaultOpen,
  showArrow = defaultProps.showArrow,
  side = defaultProps.side,
  align = defaultProps.align,
  sideOffset = defaultProps.sideOffset,
  alignOffset = defaultProps.alignOffset,
  avoidCollisions = defaultProps.avoidCollisions,
  children,
  open,
  className,
  classes,
}: TooltipProps, ref: ForwardedRef<HTMLDivElement>) {
  const { root } = useTheme();
  const showTooltip = !!(text || markdown || tooltipTemplate);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, contentRef);
  const delayRef = useRef<number>();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<React.CSSProperties>();
  const isOpen = open ?? uncontrolledOpen;

  const show = useCallback(() => {
    window.clearTimeout(delayRef.current);
    delayRef.current = window.setTimeout(() => setUncontrolledOpen(true), delayDuration);
  }, [delayDuration]);

  const hide = useCallback(() => {
    window.clearTimeout(delayRef.current);
    setUncontrolledOpen(false);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) {
      return;
    }
    const triggerBox = trigger.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    const offset = Number(sideOffset) || 0;
    const crossOffset = Number(alignOffset) || 0;
    let top = 0;
    let left = 0;

    if (side === "left" || side === "right") {
      top = triggerBox.top + triggerBox.height / 2 - contentBox.height / 2;
      if (align === "start") top = triggerBox.top + crossOffset;
      if (align === "end") top = triggerBox.bottom - contentBox.height - crossOffset;
      left = side === "left" ? triggerBox.left - contentBox.width - offset : triggerBox.right + offset;
    } else {
      left = triggerBox.left + triggerBox.width / 2 - contentBox.width / 2;
      if (align === "start") left = triggerBox.left + crossOffset;
      if (align === "end") left = triggerBox.right - contentBox.width - crossOffset;
      top = side === "top" ? triggerBox.top - contentBox.height - offset : triggerBox.bottom + offset;
    }

    if (avoidCollisions) {
      left = Math.max(0, Math.min(left, window.innerWidth - contentBox.width));
      top = Math.max(0, Math.min(top, window.innerHeight - contentBox.height));
    }

    setPosition({ position: "fixed", left, top });
  }, [align, alignOffset, avoidCollisions, side, sideOffset]);

  useEffect(() => () => window.clearTimeout(delayRef.current), []);

  useLayoutEffect(() => {
    if (!isOpen || !showTooltip) {
      return;
    }
    updatePosition();
    const animationFrame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, showTooltip, updatePosition, text, markdown, tooltipTemplate]);

  const content = tooltipTemplate ? (
    tooltipTemplate
  ) : markdown ? (
    <Markdown>{markdown}</Markdown>
  ) : (
    text
  );

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseOver={show}
        onMouseOut={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            hide();
          }
        }}
        onFocus={show}
        onBlur={hide}
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>
      {showTooltip &&
        isOpen &&
        createPortal(
          <div
            ref={composedRef}
            role="tooltip"
            className={classnames(styles.content, classes?.[COMPONENT_PART_KEY], className)}
            data-side={side}
            data-align={align}
            data-tooltip-container
            style={{ position: "fixed", left: 0, top: 0, width: "max-content", ...position }}
          >
            {content}
            {showArrow && <span aria-hidden="true" className={styles.arrow} />}
          </div>,
          root ?? document.body,
        )}
    </>
  );
}));

/**
 * Parses tooltip options from any input and returns an object containing only the option properties
 * of Tooltip (excludes non-option properties like text, triggerRef, and children)
 */
export function parseTooltipOptions(input: any): Partial<TooltipOptions> {
  // If input is a plain object, return it as TooltipOptions
  if (isPlainObject(input)) {
    return input as Partial<TooltipOptions>;
  }

  // If input is a string, split by semicolon
  if (typeof input === "string") {
    const values = input
      .split(";")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const options: Partial<TooltipOptions> = {};

    for (const value of values) {
      // Check if it's a name-value pair (contains colon)
      if (value.includes(":")) {
        const [name, val] = value.split(":").map((part) => part.trim());
        if (name && val) {
          // Parse the value based on the property type
          const parsedValue = parseOptionValue(name, val);
          if (parsedValue !== undefined) {
            (options as any)[name] = parsedValue;
          }
        }
      } else {
        // Single value case - check various option types
        const sideValues = ["top", "right", "bottom", "left"];
        const alignValues = ["start", "center", "end"];
        const booleanOptions = ["defaultOpen", "showArrow", "avoidCollisions"];

        if (sideValues.includes(value)) {
          options.side = value as "top" | "right" | "bottom" | "left";
        } else if (alignValues.includes(value)) {
          options.align = value as "start" | "center" | "end";
        } else if (booleanOptions.includes(value)) {
          // Boolean option with true value
          (options as any)[value] = true;
        } else if (value.startsWith("!") && value.length > 1) {
          // Boolean option with false value (negated with !)
          const optionName = value.substring(1);
          if (booleanOptions.includes(optionName)) {
            (options as any)[optionName] = false;
          }
        }
        // If it doesn't match any known values, ignore it
      }
    }

    return options;
  }

  // For any other type, return empty object
  return {};
}

/**
 * Helper function to parse option values based on the property name
 */
function parseOptionValue(name: string, value: string): any {
  switch (name) {
    case "delayDuration":
    case "skipDelayDuration":
    case "sideOffset":
    case "alignOffset":
      // Parse as number
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : num;

    case "defaultOpen":
    case "showArrow":
    case "avoidCollisions":
      // Parse as boolean
      const lowerVal = value.toLowerCase();
      if (lowerVal === "true" || lowerVal === "1" || lowerVal === "yes") return true;
      if (lowerVal === "false" || lowerVal === "0" || lowerVal === "no") return false;
      return undefined;

    case "side":
      // Validate side values
      if (["top", "right", "bottom", "left"].includes(value)) {
        return value as "top" | "right" | "bottom" | "left";
      }
      return undefined;

    case "align":
      // Validate align values
      if (["start", "center", "end"].includes(value)) {
        return value as "start" | "center" | "end";
      }
      return undefined;

    default:
      // Unknown property, return undefined
      return undefined;
  }
}
