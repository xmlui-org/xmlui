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
  gap?: number; // Explicit gap property
};

export const defaultResponsiveBarProps: Pick<
  ResponsiveBarProps,
  "overflowIcon" | "overflowLabel" | "gap"
> = {
  overflowIcon: "dotmenuhorizontal",
  overflowLabel: "More",
  gap: 4,
};

export const ResponsiveBar = forwardRef(function ResponsiveBar(
  {
    children,
    registerComponentApi,
    style,
    overflowIcon = defaultResponsiveBarProps.overflowIcon,
    overflowLabel = defaultResponsiveBarProps.overflowLabel,
    className,
    gap = defaultResponsiveBarProps.gap,
  }: ResponsiveBarProps,
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementContainerRef = useRef<HTMLDivElement>(null);
  const overflowButtonRef = useRef<HTMLDivElement>(null);
  
  // Convert children to array for easier manipulation
  const childrenArray = Array.isArray(children) ? children : children ? [children] : [];

  // Two-phase rendering state
  const [renderPhase, setRenderPhase] = useState<'measuring' | 'calculated'>('measuring');
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [overflowButtonWidth, setOverflowButtonWidth] = useState<number>(0);
  
  // Final layout state
  const [visibleItems, setVisibleItems] = useState<ReactNode[]>([]);
  const [overflowItems, setOverflowItems] = useState<ReactNode[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    registerComponentApi?.({
      recalculate: () => startMeasurement(),
    });
  }, [registerComponentApi]);

  const startMeasurement = () => {
    console.log('🔄 ResponsiveBar: Starting measurement phase');
    setRenderPhase('measuring');
    setItemWidths([]);
    setOverflowButtonWidth(0);
    setVisibleItems([]);
    setOverflowItems([]);
  };

  const measureDimensions = () => {
    if (!measurementContainerRef.current || !overflowButtonRef.current) {
      console.log('❌ ResponsiveBar: Measurement containers not ready');
      return;
    }

    console.log('📏 ResponsiveBar: Measuring dimensions');

    // Measure overflow button first
    const overflowRect = overflowButtonRef.current.getBoundingClientRect();
    const overflowWidth = overflowRect.width; // No rounding
    setOverflowButtonWidth(overflowWidth);
    console.log(`📏 Overflow button width: ${overflowWidth}px`);

    // Measure all child items - use direct children to avoid measuring other instances
    const measurementContainer = measurementContainerRef.current;
    const itemElements = measurementContainer.children;
    
    console.log(`📏 Found ${itemElements.length} items to measure (expected ${childrenArray.length})`);
    
    const widths: number[] = [];
    for (let i = 0; i < childrenArray.length; i++) {
      const itemElement = itemElements[i] as HTMLElement;
      if (itemElement) {
        const rect = itemElement.getBoundingClientRect();
        const width = rect.width; // No rounding
        widths.push(width);
        console.log(`📏 Item ${i} width: ${width}px (element: ${itemElement.tagName})`);
      } else {
        // Fallback if element not found
        widths.push(50);
        console.log(`📏 Item ${i} fallback width: 50px (element not found)`);
      }
    }

    setItemWidths(widths);
    
    // Move to calculation phase
    setTimeout(() => {
      setRenderPhase('calculated');
    }, 0);
  };

  const calculateLayout = () => {
    if (!containerRef.current || itemWidths.length === 0 || overflowButtonWidth === 0) {
      console.log('❌ ResponsiveBar: Not ready for layout calculation');
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    console.log(`🧮 ResponsiveBar: Calculating layout for container width: ${containerWidth}px`);

    // Calculate total width needed for all items with gaps
    let totalWidthNeeded = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      totalWidthNeeded += itemWidths[i];
      if (i > 0) {
        totalWidthNeeded += gap; // Add gap between items
      }
    }

    console.log(`🧮 Total width needed: ${totalWidthNeeded}px, Available: ${containerWidth}px`);

    const visible: ReactNode[] = [];
    const overflow: ReactNode[] = [];

    if (totalWidthNeeded <= containerWidth) {
      // All items fit
      console.log('✅ All items fit');
      visible.push(...childrenArray.filter(child => child));
    } else {
      // Need overflow - reserve space for overflow button
      const availableForItems = containerWidth - overflowButtonWidth;
      console.log(`🧮 Available space with overflow button: ${availableForItems}px`);

      let currentWidth = 0;
      for (let i = 0; i < childrenArray.length; i++) {
        const child = childrenArray[i];
        if (!child) continue;

        const itemWidth = itemWidths[i];
        const gapWidth = visible.length > 0 ? gap : 0;
        const requiredWidth = itemWidth + gapWidth;

        if (currentWidth + requiredWidth <= availableForItems) {
          currentWidth += requiredWidth;
          visible.push(child);
          console.log(`✅ Item ${i} fits (${itemWidth}px + ${gapWidth}px gap), total: ${currentWidth}px`);
        } else {
          console.log(`❌ Item ${i} doesn't fit, moving remaining to overflow`);
          // All remaining items go to overflow
          for (let j = i; j < childrenArray.length; j++) {
            if (childrenArray[j]) {
              overflow.push(childrenArray[j]);
            }
          }
          break;
        }
      }
    }

    console.log(`🎯 Final layout: ${visible.length} visible, ${overflow.length} overflow`);
    setVisibleItems(visible);
    setOverflowItems(overflow);
  };

  // Effect for measurement phase completion
  useEffect(() => {
    if (renderPhase === 'measuring' && childrenArray.length > 0) {
      // Wait for DOM update, then measure
      setTimeout(() => {
        measureDimensions();
      }, 0);
    }
  }, [renderPhase, childrenArray.length]);

  // Effect for calculation phase
  useEffect(() => {
    if (renderPhase === 'calculated' && itemWidths.length > 0 && overflowButtonWidth > 0) {
      calculateLayout();
    }
  }, [renderPhase, itemWidths, overflowButtonWidth, gap]);

  // ResizeObserver for container only
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      console.log('📐 ResponsiveBar: Container resized');
      
      // Don't recalculate if dropdown is open to avoid closing it
      if (isDropdownOpen) {
        console.log('📐 ResponsiveBar: Skipping recalculation - dropdown is open');
        return;
      }
      
      if (renderPhase === 'calculated') {
        // If we already have measurements, just recalculate layout
        calculateLayout();
      } else {
        // Otherwise, start fresh measurement
        startMeasurement();
      }
    });

    resizeObserver.observe(container);
    console.log('👁️ ResponsiveBar: ResizeObserver attached');

    return () => {
      resizeObserver.disconnect();
      console.log('👁️ ResponsiveBar: ResizeObserver disconnected');
    };
  }, [renderPhase, isDropdownOpen]);

  // Start measurement when children change
  useEffect(() => {
    console.log('🔄 ResponsiveBar: Children changed, restarting measurement');
    startMeasurement();
  }, [children]);

  // Initial measurement
  useEffect(() => {
    if (childrenArray.length > 0) {
      console.log('🚀 ResponsiveBar: Initial measurement');
      startMeasurement();
    }
  }, []);

  const containerStyle: CSSProperties = {
    ...style,
    padding: 0, // Force zero padding - user cannot change
    gap: `${gap}px`,
  };

  return (
    <div
      ref={containerRef}
      className={classnames(styles.ResponsiveBar, className)}
      style={containerStyle}
    >
      {/* Phase 1: Invisible measurement containers */}
      {renderPhase === 'measuring' && (
        <>
          {/* Invisible container for measuring items */}
          <div
            ref={measurementContainerRef}
            style={{
              position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              visibility: 'hidden',
              pointerEvents: 'none',
              display: 'flex',
              gap: `${gap}px`,
              padding: 0,
            }}
          >
            {childrenArray.map((item, index) => (
              <ResponsiveBarItem key={`measure-${index}`}>
                {item}
              </ResponsiveBarItem>
            ))}
          </div>

          {/* Invisible overflow button */}
          <div
            ref={overflowButtonRef}
            style={{
              position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              visibility: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <Button
              variant="ghost"
              icon={<Icon name={overflowIcon} fallback="dotmenuhorizontal" />}
              aria-label={overflowLabel}
            />
          </div>
        </>
      )}

      {/* Phase 2: Visible layout based on calculations */}
      {renderPhase === 'calculated' && (
        <>
          {/* Visible items */}
          <div className={styles.VisibleItems}>
            {visibleItems.map((item, index) => (
              <ResponsiveBarItem key={`visible-${index}`}>
                {item}
              </ResponsiveBarItem>
            ))}
          </div>

          {/* Overflow dropdown if needed */}
          {overflowItems.length > 0 && (
            <div className={styles.OverflowContainer}>
              <DropdownMenu
                triggerTemplate={
                  <Button
                    variant="ghost"
                    icon={<Icon name={overflowIcon} fallback="dotmenuhorizontal" />}
                    aria-label={overflowLabel}
                    onClick={() => setIsDropdownOpen(true)}
                  />
                }
                onWillOpen={() => {
                  setIsDropdownOpen(true);
                  return Promise.resolve(true);
                }}
              >
                <div
                  onMouseLeave={() => {
                    // Reset dropdown state when menu closes
                    setTimeout(() => setIsDropdownOpen(false), 100);
                  }}
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
                </div>
              </DropdownMenu>
            </div>
          )}
        </>
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
