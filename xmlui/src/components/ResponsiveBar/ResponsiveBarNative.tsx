import React, {
  forwardRef,
  useRef,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type ReactElement,
} from "react";
import classnames from "classnames";

import styles from "./ResponsiveBar.module.scss";
import { useResizeObserver } from "../../components-core/utils/hooks";
import { DropdownMenu, MenuItem } from "../DropdownMenu/DropdownMenuNative";

/**
 * ResponsiveBar Component - Adaptive Horizontal Layout with Overflow Management
 * 
 * The ResponsiveBar is a sophisticated layout component that automatically manages horizontal space
 * by moving child components that don't fit into a dropdown menu. It's ideal for toolbars, navigation
 * bars, and action panels that need to adapt to different screen sizes and container widths.
 * 
 * ## How It Works:
 * 
 * ### Two-Phase Rendering System
 * The component uses a two-phase rendering approach to accurately calculate layout:
 * 
 * **Phase 1 - Measurement Phase:**
 * - Renders all child components invisibly (visibility: hidden, opacity: 0) 
 * - Measures the actual width of each child component using getBoundingClientRect()
 * - Also measures the dropdown button width for accurate overflow calculations
 * - This phase ensures we have precise measurements before making layout decisions
 * 
 * **Phase 2 - Layout Phase:**
 * - Uses the measured widths to calculate which items fit in the available space
 * - Renders visible items in the main container and overflow items in a dropdown menu
 * - Accounts for gaps between items and the space needed for the dropdown button
 * 
 * ### Overflow Logic
 * The overflow calculation works as follows:
 * 1. Calculate total width needed for all items (including gaps)
 * 2. If all items fit: show all items, no dropdown
 * 3. If overflow needed: calculate how many items can fit alongside the dropdown button
 * 4. Ensure at least one item is always visible (even if it means showing dropdown with one item)
 * 5. Account for gaps between items and the gap before the dropdown button
 * 
 * ### Responsive Behavior
 * - Uses ResizeObserver to detect container width changes and recalculate layout
 * - Prevents infinite loops by only triggering recalculation during the layout phase
 * - Debounces calculations to avoid excessive re-renders during rapid resize events
 * 
 * ### Performance Optimizations
 * - Stable children array using React.useMemo to prevent unnecessary re-measurements
 * - Reference tracking to detect actual changes vs. rendering artifacts
 * - Calculation throttling to prevent excessive DOM measurements
 * - Layout completion tracking to ignore temporary children changes during layout updates
 * 
 * ### Key Features
 * - **Automatic overflow management**: Items that don't fit are moved to a dropdown
 * - **Configurable gaps**: Consistent spacing between items and dropdown
 * - **Custom overflow icon**: Customizable dropdown trigger button icon
 * - **Responsive**: Automatically adapts to container size changes
 * - **Accessible**: Uses proper dropdown menu with keyboard navigation
 * - **Performance optimized**: Minimal re-renders and efficient DOM measurements
 * 
 * @example
 * ```tsx
 * <ResponsiveBar gap={8} overflowIcon="menu">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 *   <Button>Action 3</Button>
 *   <Button>Action 4</Button>
 * </ResponsiveBar>
 * ```
 */

type ResponsiveBarProps = {
  children?: ReactNode;
  overflowIcon?: string;
  gap?: number; // Gap between children in pixels
  style?: CSSProperties;
  onClick?: () => void;
  [key: string]: any; // For test props
};

interface LayoutState {
  visibleItems: ReactElement[];
  overflowItems: ReactElement[];
}

// Helper component to avoid duplication of DropdownMenu properties
const ResponsiveBarDropdown = ({ 
  overflowIcon, 
  children, 
  className 
}: { 
  overflowIcon: string; 
  children: ReactNode; 
  className?: string;
}) => (
  <div className={className}>
    <DropdownMenu label="More options" triggerButtonIcon={overflowIcon}>
      {children}
    </DropdownMenu>
  </div>
);

export const defaultResponsiveBarProps = {
  overflowIcon: "ellipsisHorizontal:ResponsiveBar",
  gap: 0,
};

export const ResponsiveBar = forwardRef<HTMLDivElement, ResponsiveBarProps>(function ResponsiveBar(
  {
    children,
    overflowIcon = defaultResponsiveBarProps.overflowIcon,
    gap = defaultResponsiveBarProps.gap,
    style,
    onClick,
    ...rest
  }: ResponsiveBarProps,
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementDropdownRef = useRef<HTMLDivElement>(null);
  const isCalculatingRef = useRef(false);
  const lastContainerWidth = useRef(0);
  const lastChildrenCount = useRef(0);
  const lastChildrenRef = useRef<ReactNode>(null);
  const layoutCompletedRef = useRef(false);

  // Two-phase rendering state
  const [isInMeasurementPhase, setIsInMeasurementPhase] = useState(true);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);

  // Simple layout state
  const [layout, setLayout] = useState<LayoutState>({
    visibleItems: [],
    overflowItems: [],
  });

  // Convert children to array for processing - use stable reference
  const childrenArray = React.useMemo(() => {
    const result = React.Children.toArray(children).filter((child): child is ReactElement =>
      React.isValidElement(child),
    );
    return result;
  }, [children]);

  // Stable children count to prevent unnecessary re-measurements
  const childrenCount = childrenArray.length;

  // Measurement phase - measure all items in the same container
  const measureItems = () => {
    if (!containerRef.current) return;

    const items: HTMLElement[] = [];

    // Get the visibleItems container (during measurement phase, it has inline visibility styles)
    const measurementContainer = containerRef.current.querySelector(
      `.${styles.visibleItems}`,
    ) as HTMLElement;

    if (measurementContainer) {
      // Get all direct child divs within the measurement container
      const childDivs = Array.from(measurementContainer.children) as HTMLElement[];

      childDivs.forEach((div) => {
        const child = div.firstElementChild as HTMLElement;
        if (child) {
          items.push(child);
        }
      });
    }

    const widths = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width;
    });

    setMeasuredWidths(widths);
    setIsInMeasurementPhase(false);
  }; // Calculate overflow layout with pre-measured widths
  const calculateOverflowLayout = () => {
    if (
      isCalculatingRef.current ||
      !containerRef.current ||
      childrenArray.length === 0 ||
      measuredWidths.length === 0
    ) {
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.getBoundingClientRect().width;

    if (containerWidth === 0 || containerWidth === lastContainerWidth.current) {
      return; // Not ready yet or no change
    }

    isCalculatingRef.current = true;
    lastContainerWidth.current = containerWidth;

    // Use the gap prop instead of computed style
    const gapValue = gap;

    // First, calculate if all items fit without any dropdown
    let totalWidth = 0;

    for (let i = 0; i < childrenArray.length; i++) {
      const childWidth = measuredWidths[i];
      if (!childWidth) continue;

      const gapWidth = i > 0 ? gapValue : 0;
      totalWidth += gapWidth + childWidth;
    }

    let visibleItems: ReactElement[];
    let overflowItems: ReactElement[];

    // If all items fit, show all
    if (totalWidth <= containerWidth) {
      visibleItems = childrenArray;
      overflowItems = [];
    } else {
      // Need overflow - measure actual dropdown width
      let dropdownWidth = 147; // Fallback to your measured value

      // First try existing dropdown in the visible layout
      const existingDropdown = container.querySelector(
        `.${styles.overflowDropdown}`,
      ) as HTMLElement;
      if (existingDropdown) {
        dropdownWidth = existingDropdown.getBoundingClientRect().width;
      }
      // Then try the measurement dropdown
      else if (measurementDropdownRef.current) {
        dropdownWidth = measurementDropdownRef.current.getBoundingClientRect().width;
      }

      let accumulatedWidth = 0;
      let visibleCount = 0;

      for (let i = 0; i < childrenArray.length; i++) {
        const childWidth = measuredWidths[i];
        if (!childWidth) continue;

        const gapWidth = i > 0 ? gapValue : 0;
        const proposedWidth = accumulatedWidth + gapWidth + childWidth;

        // Check if this item would fit alongside the dropdown
        // When we have overflow: visibleItems + dropdown = visibleCount items + visibleCount gaps
        // The proposedWidth already accounts for (visibleCount-1) gaps between items
        // We need to add 1 more gap for the space before the dropdown
        const totalWidthWithDropdown = proposedWidth + gapValue + dropdownWidth;

        if (totalWidthWithDropdown <= containerWidth) {
          accumulatedWidth = proposedWidth;
          visibleCount++;
        } else {
          // This item doesn't fit when considering the dropdown gap, so stop here
          break;
        }
      }

      // Verify our calculation
      if (visibleCount > 0) {
        let verifyWidth = 0;
        for (let i = 0; i < visibleCount; i++) {
          verifyWidth += measuredWidths[i];
        }
        // When we have overflow: visibleCount items + dropdown need visibleCount gaps total
        // (visibleCount-1 gaps between items + 1 gap before dropdown)
        const totalGaps = visibleCount * gapValue;
      }

      // Also check actual visible item widths for comparison
      const visibleContainer = containerRef.current?.querySelector(
        `.${styles.visibleItems}`,
      ) as HTMLElement;
      if (visibleContainer && visibleContainer.children.length > 0) {
        let actualTotalWidth = 0;
        for (let i = 0; i < Math.min(visibleContainer.children.length, visibleCount); i++) {
          const actualWidth = (visibleContainer.children[i] as HTMLElement).offsetWidth;
          actualTotalWidth += actualWidth;
        }
      }

      // Ensure we move at least one item to overflow if we're showing dropdown
      if (visibleCount >= childrenArray.length) {
        // If all items would fit with dropdown space, don't show dropdown
        visibleItems = childrenArray;
        overflowItems = [];
      } else if (visibleCount === 0) {
        // If no items fit, show at least one visible and rest in overflow
        visibleItems = childrenArray.slice(0, 1);
        overflowItems = childrenArray.slice(1);
      } else {
        visibleItems = childrenArray.slice(0, visibleCount);
        overflowItems = childrenArray.slice(visibleCount);
      }
    }

    // Only update if there's an actual change
    if (
      visibleItems.length !== layout.visibleItems.length ||
      overflowItems.length !== layout.overflowItems.length
    ) {
      setLayout({
        visibleItems,
        overflowItems,
      });
    }

    // Allow future calculations
    setTimeout(() => {
      isCalculatingRef.current = false;
    }, 50);
  };

  // Phase 1: Measure items when children actually change
  useEffect(() => {

    // Ignore children changes that happen immediately after layout completion
    if (layoutCompletedRef.current) {
      setTimeout(() => {
        layoutCompletedRef.current = false;
      }, 100);
      return;
    }

    if (childrenCount !== lastChildrenCount.current) {
      lastChildrenCount.current = childrenCount;
      setIsInMeasurementPhase(true);
      setMeasuredWidths([]);
    }
  }, [childrenCount]);

  // Phase 1: Trigger measurement after render
  useEffect(() => {
    if (isInMeasurementPhase) {
      const timer = setTimeout(() => {
        measureItems();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isInMeasurementPhase, childrenCount]);

  // Phase 2: Calculate layout when measurements are ready
  useEffect(() => {
    if (!isInMeasurementPhase && measuredWidths.length > 0) {
      calculateOverflowLayout();
      // Mark that layout just completed to ignore immediate children changes
      layoutCompletedRef.current = true;
    }
  }, [isInMeasurementPhase, measuredWidths]);

  // Monitor container size changes - only in phase 2 to avoid infinite loops
  useResizeObserver(containerRef, () => {
    if (!isInMeasurementPhase && containerRef.current) {
      const currentWidth = containerRef.current.getBoundingClientRect().width;

      if (currentWidth !== lastContainerWidth.current) {
        calculateOverflowLayout();
      }
    }
  });

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      className={classnames(styles.responsiveBar)}
      style={{
        ...style,
        gap: `${gap}px`, // Gap between visibleItems and overflowDropdown
      }}
      onClick={onClick}
      {...rest}
    >
      {isInMeasurementPhase ? (
        // Phase 1: Render all items invisibly for measurement - identical structure to layout phase
        <>
          <div
            className={styles.visibleItems}
            style={{
              gap: `${gap}px`, // Gap between items same as layout phase
              visibility: "hidden",
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            {childrenArray.map((child, index) => (
              <div key={`item-${index}`}>{child}</div>
            ))}
          </div>

          {/* Measurement dropdown - rendered in same location as visible dropdown */}
          <div 
            ref={measurementDropdownRef}
            style={{
              visibility: "hidden",
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <ResponsiveBarDropdown 
              overflowIcon={overflowIcon}
              className={styles.overflowDropdown}
            >
              {childrenArray.length > 0 && <MenuItem>{childrenArray[0]}</MenuItem>}
            </ResponsiveBarDropdown>
          </div>
        </>
      ) : (
        // Phase 2: Render final layout
        <>
          <div
            className={styles.visibleItems}
            style={{ gap: `${gap}px` }} // Gap between visible items
          >
            {childrenArray.map((child, index) => {
              const isVisible =
                layout.visibleItems.length > 0 ? index < layout.visibleItems.length : true;
              return (
                <div key={`item-${index}`} style={{ display: isVisible ? "block" : "none" }}>
                  {child}
                </div>
              );
            })}
          </div>

          {/* Overflow dropdown */}
          {layout.overflowItems.length > 0 && (
            <ResponsiveBarDropdown 
              overflowIcon={overflowIcon}
              className={styles.overflowDropdown}
            >
              {layout.overflowItems.map((item, index) => (
                <MenuItem key={index}>{item}</MenuItem>
              ))}
            </ResponsiveBarDropdown>
          )}
        </>
      )}
    </div>
  );
});

ResponsiveBar.displayName = "ResponsiveBar";
