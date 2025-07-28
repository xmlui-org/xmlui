import React, { type CSSProperties, forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import styles from "./ResponsiveBar.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { DropdownMenu, MenuItem } from "../DropdownMenu/DropdownMenuNative";
import { Button } from "../Button/ButtonNative";
import { Icon } from "../Icon/IconNative";

type ResponsiveBarProps = {
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  style?: CSSProperties;
  overflowIcon?: string;
  overflowLabel?: string;
  className?: string;
};

export const defaultResponsiveBarProps: Pick<
  ResponsiveBarProps,
  "overflowIcon" | "overflowLabel"
> = {
  overflowIcon: "dotmenuhorizontal",
  overflowLabel: "More",
};

export const ResponsiveBar = forwardRef(function ResponsiveBar(
  {
    children,
    registerComponentApi,
    style,
    overflowIcon = defaultResponsiveBarProps.overflowIcon,
    overflowLabel = defaultResponsiveBarProps.overflowLabel,
    className,
  }: ResponsiveBarProps,
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Convert children to array for easier manipulation
  const childrenArray = Array.isArray(children) ? children : children ? [children] : [];

  // Initialize with empty arrays, calculation will populate them
  const [visibleItems, setVisibleItems] = useState<ReactNode[]>([]);
  const [overflowItems, setOverflowItems] = useState<ReactNode[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    registerComponentApi?.({
      recalculate: () => calculateVisibleItems(),
    });
  }, [registerComponentApi]);

  const calculateVisibleItems = () => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const availableWidth = container.offsetWidth;
    
    if (availableWidth === 0) {
      return;
    }
    
    // Account for the overflow button width - use a more conservative estimate
    let overflowButtonWidth = 60; // More conservative estimate for ghost button with icon
    const existingOverflowButton = container.querySelector(`.${styles.OverflowContainer} button`) as HTMLElement;
    if (existingOverflowButton) {
      const overflowRect = existingOverflowButton.getBoundingClientRect();
      overflowButtonWidth = Math.max(60, Math.ceil(overflowRect.width) + 16); // Ensure minimum 60px with extra margin
    }
    
    // Get the visible items container (Stack) to check current styles
    const visibleContainer = container.querySelector(`.${styles.VisibleItems}`) as HTMLElement;
    
    if (!visibleContainer) {
      return;
    }

    // Get computed styles from both the main container and visible container
    const containerStyles = getComputedStyle(container);
    const visibleStyles = getComputedStyle(visibleContainer);

    // Instead of creating temporary elements, measure the actual rendered items
    const itemWidths: number[] = [];
    
    // Get all current bar item elements (ResponsiveBarItem components)
    const barItems = visibleContainer.querySelectorAll(`.${styles.ResponsiveBarItem}`);
    
    for (let i = 0; i < Math.min(childrenArray.length, barItems.length); i++) {
      const barItem = barItems[i] as HTMLElement;
      if (barItem) {
        const rect = barItem.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        itemWidths.push(width);
      } else {
        itemWidths.push(50); // Fallback width
      }
    }
    
    // If we have more children than rendered items, estimate remaining widths
    for (let i = barItems.length; i < childrenArray.length; i++) {
      // Use average of existing widths or a reasonable default
      const avgWidth = itemWidths.length > 0 ? 
        itemWidths.reduce((sum, w) => sum + w, 0) / itemWidths.length : 50;
      itemWidths.push(Math.ceil(avgWidth));
    }

    // Calculate which items fit with proper spacing
    const gap = parseInt(visibleStyles.gap) || 4;
    
    // Get actual padding from the main container styles
    const paddingLeft = parseInt(containerStyles.paddingLeft) || 0;
    const paddingRight = parseInt(containerStyles.paddingRight) || 0;
    const containerPadding = paddingLeft + paddingRight;
    
    const safetyBuffer = 16; // Much larger buffer for measurement precision
    let currentWidth = containerPadding;
    const visible: ReactNode[] = [];
    const overflow: ReactNode[] = [];

    for (let i = 0; i < childrenArray.length; i++) {
      const child = childrenArray[i];
      if (!child) continue;
      
      const itemWidth = itemWidths[i] || 0;
      const gapWidth = visible.length > 0 ? gap : 0;
      const totalItemWidth = itemWidth + gapWidth;
      
      // Always check if we need overflow space when there are remaining items
      const hasRemainingItems = i < childrenArray.length - 1;
      const spaceNeededForOverflow = hasRemainingItems ? overflowButtonWidth : 0;
      
      // Check if this item fits with the required space for overflow (if needed)
      const totalSpaceNeeded = currentWidth + totalItemWidth + spaceNeededForOverflow + safetyBuffer;
      
      if (totalSpaceNeeded <= availableWidth) {
        // Item fits
        currentWidth += totalItemWidth;
        visible.push(child);
      } else {
        // This item and all remaining items go to overflow
        for (let j = i; j < childrenArray.length; j++) {
          if (childrenArray[j]) {
            overflow.push(childrenArray[j]);
          }
        }
        break;
      }
    }

    setVisibleItems(visible);
    setOverflowItems(overflow);
    setIsCalculated(true);
  };

  // Recalculate on resize and content changes
  useEffect(() => {
    const handleResize = () => {
      // Use setTimeout to ensure DOM has been updated
      setTimeout(() => {
        calculateVisibleItems();
      }, 0);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial calculation after mount
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  // Force initial calculation on mount
  React.useLayoutEffect(() => {
    if (containerRef.current) {
      // Give the DOM a chance to render, then calculate
      const timer = setTimeout(() => {
        calculateVisibleItems();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Additional effect to recalculate when children change
  useEffect(() => {
    setTimeout(() => {
      calculateVisibleItems();
    }, 0);
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={classnames(styles.ResponsiveBar, className)}
      style={style}
    >
        {/* Visible menu items */}
        <div className={styles.VisibleItems}>
          {(isCalculated ? visibleItems : childrenArray).map((item, index) => (
            <ResponsiveBarItem key={`visible-${index}`}>
              {item}
            </ResponsiveBarItem>
          ))}
        </div>

        {/* Overflow dropdown */}
        {isCalculated && overflowItems.length > 0 && (
          <div className={styles.OverflowContainer}>
            <DropdownMenu
              triggerTemplate={
                <Button
                  variant="ghost"
                  icon={<Icon name={overflowIcon} fallback="dotmenuhorizontal" />}
                  aria-label={overflowLabel}
                />
              }
            >
              {overflowItems.map((item, index) => {
                // If the item is already a MenuItem, render it directly
                // Otherwise, wrap it in a MenuItem
                if (React.isValidElement(item) && item.type === MenuItem) {
                  return <div key={`overflow-${index}`}>{item}</div>;
                }
                
                return (
                  <MenuItem key={`overflow-${index}`}>
                    {item}
                  </MenuItem>
                );
              })}
            </DropdownMenu>
          </div>
        )}
    </div>
  );
});

// Helper component for responsive bar items
type ResponsiveBarItemProps = {
  children?: ReactNode;
  className?: string;
};

export const ResponsiveBarItem = forwardRef(function ResponsiveBarItem(
  {
    children,
    className,
  }: ResponsiveBarItemProps,
  ref,
) {
  return (
    <div
      ref={ref as any}
      className={classnames(styles.ResponsiveBarItem, className)}
    >
      {children}
    </div>
  );
});
