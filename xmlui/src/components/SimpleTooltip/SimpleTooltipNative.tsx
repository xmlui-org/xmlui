import React, { type ReactNode, type ForwardedRef, forwardRef, type RefObject, useEffect, useState, useRef } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

import styles from "./SimpleTooltip.module.scss";

type SimpleTooltipProps = {
  /**
   * The text content to display in the tooltip
   */
  text: string;
  
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
  
  /**
   * A ref to an external element that will trigger the tooltip on hover
   */
  triggerRef?: RefObject<HTMLElement>;
  
  /**
   * The content that will trigger the tooltip (used when triggerRef is not provided)
   */
  children?: ReactNode;
};

export type { SimpleTooltipProps };

export const defaultProps: Pick<
  SimpleTooltipProps,
  "delayDuration" | "skipDelayDuration" | "defaultOpen" | "showArrow" | "side" | "align" | "sideOffset" | "alignOffset" | "avoidCollisions"
> = {
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
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      clearTimeout(delayTimer);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [triggerRef, delayDuration]);

  return (
    <Tooltip.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <Tooltip.Root open={triggerRef ? open : undefined} defaultOpen={!triggerRef ? defaultOpen : undefined}>
        {triggerRef ? (
          // When triggerRef is provided, create a positioned trigger element
          <Tooltip.Trigger asChild>
            <div 
              ref={(node) => {
                if (node && triggerRef.current) {
                  const updatePosition = () => {
                    const rect = triggerRef.current!.getBoundingClientRect();
                    node.style.position = 'fixed';
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
          <Tooltip.Trigger asChild>
            <div ref={forwardedRef}>
              {children}
            </div>
          </Tooltip.Trigger>
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
