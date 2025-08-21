import { type ReactNode, type ForwardedRef, forwardRef } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { isPlainObject } from "lodash-es";

import styles from "./Tooltip.module.scss";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Markdown } from "../Markdown/Markdown";

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

type TooltipProps = TooltipOptions & {
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
  tooltipTemplate?: ReactNode;

  /**
   * The content that will trigger the tooltip (used when triggerRef is not provided)
   */
  children?: ReactNode;
};

export type { TooltipProps, TooltipOptions };

export const defaultProps: TooltipOptions = {
  delayDuration: 700,
  skipDelayDuration: 300,
  defaultOpen: false,
  showArrow: false,
  side: "top",
  align: "center",
  sideOffset: 4,
  alignOffset: 0,
  avoidCollisions: true,
};

export const Tooltip = function Tooltip({
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
}: TooltipProps) {
  const { root } = useTheme();
  const showTooltip = !!(text || markdown || tooltipTemplate);

  return (
    <RadixTooltip.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <RadixTooltip.Root defaultOpen={defaultOpen}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal container={root}>
          {showTooltip && (
            <RadixTooltip.Content
              className={styles.content}
              side={side}
              align={align}
              sideOffset={sideOffset}
              alignOffset={alignOffset}
              avoidCollisions={avoidCollisions}
            >
              {tooltipTemplate ? (
                tooltipTemplate
              ) : markdown ? (
                <Markdown>{markdown}</Markdown>
              ) : (
                text
              )}
              {showArrow && <RadixTooltip.Arrow className={styles.arrow} />}
            </RadixTooltip.Content>
          )}
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

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
