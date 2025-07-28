import React, { type CSSProperties, forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import styles from "./ResponsiveMenu.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { DropdownMenu, MenuItem, MenuSeparator } from "../DropdownMenu/DropdownMenuNative";
import { Button } from "../Button/ButtonNative";
import { Icon } from "../Icon/IconNative";

type ResponsiveMenuProps = {
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  style?: CSSProperties;
  overflowIcon?: string;
  overflowLabel?: string;
  className?: string;
};

export const defaultResponsiveMenuProps: Pick<
  ResponsiveMenuProps,
  "overflowIcon" | "overflowLabel"
> = {
  overflowIcon: "dotmenuhorizontal",
  overflowLabel: "More",
};

export const ResponsiveMenu = forwardRef(function ResponsiveMenu(
  {
    children,
    registerComponentApi,
    style,
    overflowIcon = defaultResponsiveMenuProps.overflowIcon,
    overflowLabel = defaultResponsiveMenuProps.overflowLabel,
    className,
  }: ResponsiveMenuProps,
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
    
    // Account for the overflow button width and some margin
    const overflowButtonWidth = 60; // More conservative estimate for ghost button with icon
    
    // Get the visible items container to check current styles
    const visibleContainer = container.querySelector(`.${styles.VisibleItems}`) as HTMLElement;
    
    if (!visibleContainer) {
      return;
    }

    // Create a temporary container that matches the styling of the actual menu
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-10000px';
    tempContainer.style.left = '-10000px';
    tempContainer.style.pointerEvents = 'none';
    
    // Copy computed styles from the visible container
    const containerStyles = getComputedStyle(visibleContainer);
    tempContainer.style.display = containerStyles.display;
    tempContainer.style.gap = containerStyles.gap;
    tempContainer.style.alignItems = containerStyles.alignItems;
    tempContainer.style.fontFamily = containerStyles.fontFamily;
    tempContainer.style.fontSize = containerStyles.fontSize;
    tempContainer.style.fontWeight = containerStyles.fontWeight;
    
    document.body.appendChild(tempContainer);

    // Instead of creating temporary elements, measure the actual rendered items
    const itemWidths: number[] = [];
    
    // Get all current menu item elements
    const menuItems = visibleContainer.querySelectorAll(`.${styles.MenuItem}`);
    
    for (let i = 0; i < Math.min(childrenArray.length, menuItems.length); i++) {
      const menuItem = menuItems[i] as HTMLElement;
      if (menuItem) {
        const rect = menuItem.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        itemWidths.push(width);
      } else {
        itemWidths.push(50); // Fallback width
      }
    }
    
    // If we have more children than rendered items, estimate remaining widths
    for (let i = menuItems.length; i < childrenArray.length; i++) {
      // Use average of existing widths or a reasonable default
      const avgWidth = itemWidths.length > 0 ? 
        itemWidths.reduce((sum, w) => sum + w, 0) / itemWidths.length : 50;
      itemWidths.push(Math.ceil(avgWidth));
    }

    // Calculate which items fit with proper spacing
    const gap = parseInt(containerStyles.gap) || 4;
    const containerPadding = 8; // Account for container padding
    const safetyBuffer = 8; // Add small buffer to prevent edge cases
    let currentWidth = containerPadding;
    const visible: ReactNode[] = [];
    const overflow: ReactNode[] = [];

    for (let i = 0; i < childrenArray.length; i++) {
      const child = childrenArray[i];
      if (!child) continue;
      
      const itemWidth = itemWidths[i] || 0;
      const gapWidth = visible.length > 0 ? gap : 0;
      const totalItemWidth = itemWidth + gapWidth;
      
      // Check if we need to start using overflow (with buffer for safety)
      const wouldNeedOverflow = currentWidth + totalItemWidth + overflowButtonWidth + safetyBuffer > availableWidth;
      
      if (wouldNeedOverflow && visible.length > 0) {
        // This item and all remaining items go to overflow
        for (let j = i; j < childrenArray.length; j++) {
          if (childrenArray[j]) {
            overflow.push(childrenArray[j]);
          }
        }
        break;
      } else if (currentWidth + totalItemWidth + safetyBuffer <= availableWidth) {
        // Item fits
        currentWidth += totalItemWidth;
        visible.push(child);
      } else {
        // First item doesn't fit, put all items in overflow
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
      className={classnames(styles.ResponsiveMenu, className)}
      style={style}
    >
        {/* Visible menu items */}
        <div className={styles.VisibleItems}>
          {(isCalculated ? visibleItems : childrenArray).map((item, index) => (
            <div key={`visible-${index}`} className={styles.MenuItem}>
              {item}
            </div>
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

// Helper component for responsive menu items
type ResponsiveMenuItemProps = {
  children?: ReactNode;
  label?: string;
  onClick?: () => void;
  icon?: ReactNode;
  active?: boolean;
  enabled?: boolean;
  className?: string;
};

export const ResponsiveMenuItem = forwardRef(function ResponsiveMenuItem(
  {
    children,
    label,
    onClick,
    icon,
    active = false,
    enabled = true,
    className,
  }: ResponsiveMenuItemProps,
  ref,
) {
  return (
    <button
      ref={ref as any}
      className={classnames(styles.ResponsiveMenuItem, className, {
        [styles.active]: active,
        [styles.disabled]: !enabled,
      })}
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      type="button"
    >
      {icon && <span className={styles.Icon}>{icon}</span>}
      <span className={styles.Label}>{label || children}</span>
    </button>
  );
});
