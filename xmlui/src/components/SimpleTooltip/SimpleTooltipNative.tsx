import {
  type ReactNode,
  type ForwardedRef,
  forwardRef,
  type RefObject,
  useEffect,
  useState,
} from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { isPlainObject } from "lodash-es";

import styles from "./SimpleTooltip.module.scss";

type SimpleTooltipOptions = {
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

type SimpleTooltipProps = SimpleTooltipOptions & {
  /**
   * The text content to display in the tooltip
   */
  text: string;

  /**
   * A ref to an external element that will trigger the tooltip on hover
   */
  triggerRef?: RefObject<HTMLElement>;

  /**
   * The content that will trigger the tooltip (used when triggerRef is not provided)
   */
  children?: ReactNode;
};

export type { SimpleTooltipProps, SimpleTooltipOptions };

export const defaultProps: SimpleTooltipOptions = {
  delayDuration: 700,
  skipDelayDuration: 300,
  defaultOpen: false,
  showArrow: true,
  side: "top",
  align: "center",
  sideOffset: 4,
  alignOffset: 0,
  avoidCollisions: true,
};

export const SimpleTooltip = forwardRef(function SimpleTooltip(
  {
    text,
    delayDuration = defaultProps.delayDuration,
    skipDelayDuration = defaultProps.skipDelayDuration,
    defaultOpen = defaultProps.defaultOpen,
    showArrow = defaultProps.showArrow,
    side = defaultProps.side,
    align = defaultProps.align,
    sideOffset = defaultProps.sideOffset,
    alignOffset = defaultProps.alignOffset,
    avoidCollisions = defaultProps.avoidCollisions,
    triggerRef,
    children,
  }: SimpleTooltipProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [open, setOpen] = useState(defaultOpen || false);

  useEffect(() => {
    if (!triggerRef?.current) return;

    const element = triggerRef.current;
    let delayTimer: NodeJS.Timeout;

    const handleMouseEnter = () => {
      delayTimer = setTimeout(() => {
        setOpen(true);
      }, delayDuration);
    };

    const handleMouseLeave = () => {
      clearTimeout(delayTimer);
      setOpen(false);
    };

    const handleFocus = () => {
      setOpen(true);
    };

    const handleBlur = () => {
      setOpen(false);
    };

    // Add event listeners to the external element
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("focus", handleFocus);
    element.addEventListener("blur", handleBlur);

    // Cleanup
    return () => {
      clearTimeout(delayTimer);
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("focus", handleFocus);
      element.removeEventListener("blur", handleBlur);
    };
  }, [triggerRef, delayDuration]);

  return (
    <Tooltip.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <Tooltip.Root
        open={triggerRef ? open : undefined}
        defaultOpen={!triggerRef ? defaultOpen : undefined}
      >
        {triggerRef ? (
          // When triggerRef is provided, create a positioned trigger element
          <Tooltip.Trigger asChild>
            <div
              ref={(node) => {
                if (node && triggerRef.current) {
                  const updatePosition = () => {
                    const rect = triggerRef.current!.getBoundingClientRect();
                    node.style.position = "fixed";
                    node.style.left = `${rect.left}px`;
                    node.style.top = `${rect.top}px`;
                    node.style.width = `${rect.width}px`;
                    node.style.height = `${rect.height}px`;
                  };
                  updatePosition();

                  // Update position when tooltip opens
                  if (open) {
                    updatePosition();
                  }
                }
              }}
              className={styles.hiddenTrigger}
            />
          </Tooltip.Trigger>
        ) : (
          // When children are provided, use them as the trigger
          <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        )}
        <Tooltip.Portal>
          <Tooltip.Content
            className={styles.content}
            side={side}
            align={align}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            avoidCollisions={avoidCollisions}
          >
            {text}
            {showArrow && <Tooltip.Arrow className={styles.arrow} />}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
});

/**
 * Parses tooltip options from any input and returns an object containing only the option properties
 * of SimpleTooltip (excludes non-option properties like text, triggerRef, and children)
 */
export function parseTooltipOptions(input: any): Partial<SimpleTooltipOptions> {
  // If input is a plain object, return it as SimpleTooltipOptions
  if (isPlainObject(input)) {
    return input as Partial<SimpleTooltipOptions>;
  }
  
  // If input is a string, split by semicolon
  if (typeof input === 'string') {
    const values = input.split(';').map(value => value.trim()).filter(value => value.length > 0);
    const options: Partial<SimpleTooltipOptions> = {};
    
    for (const value of values) {
      // Check if it's a name-value pair (contains colon)
      if (value.includes(':')) {
        const [name, val] = value.split(':').map(part => part.trim());
        if (name && val) {
          // Parse the value based on the property type
          const parsedValue = parseOptionValue(name, val);
          if (parsedValue !== undefined) {
            (options as any)[name] = parsedValue;
          }
        }
      } else {
        // Single value case - check various option types
        const sideValues = ['top', 'right', 'bottom', 'left'];
        const alignValues = ['start', 'center', 'end'];
        const booleanOptions = ['defaultOpen', 'showArrow', 'avoidCollisions'];
        
        if (sideValues.includes(value)) {
          options.side = value as 'top' | 'right' | 'bottom' | 'left';
        } else if (alignValues.includes(value)) {
          options.align = value as 'start' | 'center' | 'end';
        } else if (booleanOptions.includes(value)) {
          // Boolean option with true value
          (options as any)[value] = true;
        } else if (value.startsWith('!') && value.length > 1) {
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
    case 'delayDuration':
    case 'skipDelayDuration':
    case 'sideOffset':
    case 'alignOffset':
      // Parse as number
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : num;
    
    case 'defaultOpen':
    case 'showArrow':
    case 'avoidCollisions':
      // Parse as boolean
      const lowerVal = value.toLowerCase();
      if (lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes') return true;
      if (lowerVal === 'false' || lowerVal === '0' || lowerVal === 'no') return false;
      return undefined;
    
    case 'side':
      // Validate side values
      if (['top', 'right', 'bottom', 'left'].includes(value)) {
        return value as 'top' | 'right' | 'bottom' | 'left';
      }
      return undefined;
    
    case 'align':
      // Validate align values
      if (['start', 'center', 'end'].includes(value)) {
        return value as 'start' | 'center' | 'end';
      }
      return undefined;
    
    default:
      // Unknown property, return undefined
      return undefined;
  }
}
