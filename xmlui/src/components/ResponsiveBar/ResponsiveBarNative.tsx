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
import { ThemedDropdownMenu as DropdownMenu, ThemedMenuItem as MenuItem } from "../DropdownMenu/DropdownMenu";
import type { AlignmentOptions } from "../abstractions";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { Part } from "../Part/Part";


// Component part names
const PART_OVERFLOW = "overflow";

/**
 * ResponsiveBar Component - Adaptive Layout with Overflow Management
 * 
 * The ResponsiveBar is a sophisticated layout component that automatically manages space
 * by moving child components that don't fit into a dropdown menu. It supports both horizontal 
 * and vertical orientations, making it ideal for toolbars, navigation bars, sidebars, and 
 * action panels that need to adapt to different screen sizes and container dimensions.
 * 
 * ## How It Works:
 * 
 * ### Orientation Support
 * - **Horizontal**: Items are arranged left-to-right, overflow is based on container width
 * - **Vertical**: Items are arranged top-to-bottom, overflow is based on container height
 * - Uses the parent container's available space (width for horizontal, height for vertical)
 * 
 * ### Two-Phase Rendering System
 * The component uses a two-phase rendering approach to accurately calculate layout:
 * 
 * **Phase 1 - Measurement Phase:**
 * - Renders all child components invisibly (visibility: hidden, opacity: 0) 
 * - Measures the actual size of each child component using getBoundingClientRect()
 * - For horizontal: measures width; for vertical: measures height
 * - Also measures the dropdown button size for accurate overflow calculations
 * - This phase ensures we have precise measurements before making layout decisions
 * 
 * **Phase 2 - Layout Phase:**
 * - Uses the measured dimensions to calculate which items fit in the available space
 * - Renders visible items in the main container and overflow items in a dropdown menu
 * - Accounts for gaps between items and the space needed for the dropdown button
 * 
 * ### Overflow Logic
 * The overflow calculation works as follows:
 * 1. Calculate total size needed for all items (including gaps)
 * 2. If all items fit: show all items, no dropdown
 * 3. If overflow needed: calculate how many items can fit alongside the dropdown button
 * 4. Ensure at least one item is always visible (even if it means showing dropdown with one item)
 * 5. Account for gaps between items and the gap before the dropdown button
 * 
 * ### Responsive Behavior
 * - Uses ResizeObserver to detect container size changes and recalculate layout
 * - Monitors width changes for horizontal orientation, height changes for vertical
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
 * - **Dual orientation support**: Works in both horizontal and vertical layouts
 * - **Automatic overflow management**: Items that don't fit are moved to a dropdown
 * - **Configurable gaps**: Consistent spacing between items and dropdown
 * - **Custom overflow icon**: Customizable dropdown trigger button icon
 * - **Responsive**: Automatically adapts to container size changes
 * - **Accessible**: Uses proper dropdown menu with keyboard navigation
 * - **Performance optimized**: Minimal re-renders and efficient DOM measurements
 * 
 * @example
 * ```tsx
 * // Horizontal toolbar
 * <ResponsiveBar orientation="horizontal" gap={8} overflowIcon="menu">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 *   <Button>Action 3</Button>
 * </ResponsiveBar>
 * 
 * // Vertical sidebar
 * <ResponsiveBar orientation="vertical" gap={4} overflowIcon="moreVertical">
 *   <NavItem>Home</NavItem>
 *   <NavItem>Settings</NavItem>
 *   <NavItem>Profile</NavItem>
 * </ResponsiveBar>
 * ```
 */

type ResponsiveBarProps = {
  children?: ReactNode;
  childNodes?: any[]; // XMLUI node definitions for context variable support
  renderChildFn?: (node: any, isOverflow: boolean) => ReactNode;
  overflowIcon?: string;
  dropdownText?: string;
  dropdownAlignment?: AlignmentOptions;
  triggerTemplate?: ReactNode;
  gap?: number; // Gap between children in pixels
  orientation?: "horizontal" | "vertical"; // Layout direction
  reverse?: boolean; // Reverse the direction of children
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  onWillOpen?: () => Promise<boolean | undefined>;
  registerComponentApi?: RegisterComponentApiFn;
  [key: string]: any; // For test props
};

interface LayoutState {
  visibleItems: ReactElement[];
  overflowItems: ReactElement[];
}

// Helper component to avoid duplication of DropdownMenu properties
const ResponsiveBarDropdown = ({ 
  overflowIcon, 
  dropdownText,
  dropdownAlignment,
  triggerTemplate,
  children, 
  className,
  onWillOpen,
  registerComponentApi,
}: { 
  overflowIcon: string;
  dropdownText: string;
  dropdownAlignment: AlignmentOptions;
  triggerTemplate?: ReactNode; 
  children: ReactNode; 
  className?: string;
  onWillOpen?: () => Promise<boolean | undefined>;
  registerComponentApi?: RegisterComponentApiFn;
}) => (
  <Part partId={PART_OVERFLOW}>
    <div className={className}>
      <DropdownMenu 
        label={dropdownText} 
        triggerButtonIcon={overflowIcon}
        triggerTemplate={triggerTemplate}
        alignment={dropdownAlignment}
        compact={true}
        onWillOpen={onWillOpen}
        registerComponentApi={registerComponentApi}
      >
        {children}
      </DropdownMenu>
    </div>
  </Part>
);

export const defaultResponsiveBarProps = {
  overflowIcon: "ellipsisHorizontal:ResponsiveBar",
  dropdownText: "More options",
  gap: 0,
  orientation: "horizontal" as const,
  reverse: false,
};

export const ResponsiveBar = forwardRef<HTMLDivElement, ResponsiveBarProps>(function ResponsiveBar(
  {
    children,
    childNodes,
    renderChildFn,
    overflowIcon = defaultResponsiveBarProps.overflowIcon,
    dropdownText = defaultResponsiveBarProps.dropdownText,
    dropdownAlignment,
    triggerTemplate,
    gap = defaultResponsiveBarProps.gap,
    orientation = defaultResponsiveBarProps.orientation,
    reverse = defaultResponsiveBarProps.reverse,
    style,
    className,
    onClick,
    onWillOpen,
    registerComponentApi,
    ...rest
  }: ResponsiveBarProps,
  ref,
) {
  // Compute default alignment based on reverse if not explicitly provided
  const effectiveAlignment: AlignmentOptions = dropdownAlignment ?? (reverse ? "start" : "end");
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementDropdownRef = useRef<HTMLDivElement>(null);
  const isCalculatingRef = useRef(false);
  const lastContainerSize = useRef(0); // Renamed for clarity - stores width OR height
  const lastChildrenCount = useRef(0);
  const lastChildrenRef = useRef<ReactNode>(null);
  const layoutCompletedRef = useRef(false);
  const dropdownApiRef = useRef<{ open: () => void; close: () => void } | null>(null);

  // Two-phase rendering state
  const [isInMeasurementPhase, setIsInMeasurementPhase] = useState(true);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);
  const [measuredDropdownSize, setMeasuredDropdownSize] = useState<number>(0);

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

  // Register component API
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        open: () => {
          dropdownApiRef.current?.open();
        },
        close: () => {
          dropdownApiRef.current?.close();
        },
        hasOverflow: () => {
          return layout.overflowItems.length > 0;
        },
      });
    }
  }, [registerComponentApi, layout.overflowItems.length]);

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

    const measurements = items.map((item) => {
      const rect = item.getBoundingClientRect();
      // For horizontal orientation, use width; for vertical, use height
      return orientation === "horizontal" ? rect.width : rect.height;
    });

    // Also measure the dropdown size during measurement phase
    let dropdownSize = orientation === "horizontal" ? 147 : 47; // Default fallback
    if (measurementDropdownRef.current) {
      const dropdownRect = measurementDropdownRef.current.getBoundingClientRect();
      const measuredSize = orientation === "horizontal" ? dropdownRect.width : dropdownRect.height;
      if (measuredSize > 0) {
        dropdownSize = measuredSize;
      }
    }

    setMeasuredWidths(measurements);
    setMeasuredDropdownSize(dropdownSize);
    setIsInMeasurementPhase(false);
  }; 
  
  // Calculate overflow layout with pre-measured dimensions
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
    const containerRect = container.getBoundingClientRect();
    const containerSize = orientation === "horizontal" ? containerRect.width : containerRect.height;
    const lastSize = lastContainerSize.current;

    if (containerSize === 0 || containerSize === lastSize) {
      return; // Not ready yet or no change
    }

    isCalculatingRef.current = true;
    lastContainerSize.current = containerSize;

    // Use the gap prop instead of computed style
    const gapValue = gap;

    // First, calculate if all items fit without any dropdown
    let totalSize = 0;

    for (let i = 0; i < childrenArray.length; i++) {
      const childSize = measuredWidths[i];
      if (!childSize) continue;

      const gapSize = i > 0 ? gapValue : 0;
      totalSize += gapSize + childSize;
    }

    let visibleItems: ReactElement[];
    let overflowItems: ReactElement[];

    // If all items fit, show all
    if (totalSize <= containerSize) {
      visibleItems = childrenArray;
      overflowItems = [];
    } else {
      // Use pre-measured dropdown size from measurement phase
      let dropdownSize = measuredDropdownSize > 0 ? measuredDropdownSize : (orientation === "horizontal" ? 147 : 47);

      // Try to get actual dropdown size if it exists in the visible layout (for resize scenarios)
      const existingDropdown = container.querySelector(
        `.${styles.overflowDropdown}`,
      ) as HTMLElement;
      if (existingDropdown) {
        const dropdownRect = existingDropdown.getBoundingClientRect();
        const currentSize = orientation === "horizontal" ? dropdownRect.width : dropdownRect.height;
        if (currentSize > 0) {
          dropdownSize = currentSize;
        }
      }

      let accumulatedSize = 0;
      let visibleCount = 0;

      for (let i = 0; i < childrenArray.length; i++) {
        const childSize = measuredWidths[i];
        if (!childSize) continue;

        const gapSize = i > 0 ? gapValue : 0;
        const proposedSize = accumulatedSize + gapSize + childSize;

        // Check if this item would fit alongside the dropdown
        // When we have overflow: visibleItems + dropdown = visibleCount items + visibleCount gaps
        // The proposedSize already accounts for (visibleCount-1) gaps between items
        // We need to add 1 more gap for the space before the dropdown
        const totalSizeWithDropdown = proposedSize + gapValue + dropdownSize;

        if (totalSizeWithDropdown <= containerSize) {
          accumulatedSize = proposedSize;
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
      setMeasuredDropdownSize(0);
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
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentSize = orientation === "horizontal" ? containerRect.width : containerRect.height;

      if (currentSize !== lastContainerSize.current) {
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
      className={classnames(
        styles.responsiveBar, 
        orientation === "vertical" ? styles.vertical : styles.horizontal,
        className
      )}
      style={{
        ...style,
        gap: `${gap}px`, // Gap between visibleItems and overflowDropdown
        flexDirection: orientation === "horizontal" 
          ? (reverse ? "row-reverse" : "row") 
          : (reverse ? "column-reverse" : "column"),
        height: orientation === "vertical" ? "100%" : undefined,
        width: orientation === "horizontal" ? "100%" : undefined,
      }}
      onClick={onClick}
      {...rest}
    >
      {isInMeasurementPhase ? (
        // Phase 1: Render all items invisibly for measurement - identical structure to layout phase
        <>
          <div
            className={classnames(
              styles.visibleItems, 
              orientation === "vertical" ? styles.vertical : styles.horizontal
            )}
            style={{
              gap: `${gap}px`, // Gap between items same as layout phase
              visibility: "hidden",
              opacity: 0,
              pointerEvents: "none",
              flexDirection: orientation === "horizontal" 
                ? (reverse ? "row-reverse" : "row") 
                : (reverse ? "column-reverse" : "column"),
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
              dropdownText={dropdownText}
              dropdownAlignment={effectiveAlignment}
              triggerTemplate={triggerTemplate}
              className={styles.overflowDropdown}
              onWillOpen={onWillOpen}
              registerComponentApi={(api) => {
                // Don't store measurement dropdown API
              }}
            >
              {childrenArray.length > 0 && <MenuItem>{childrenArray[0]}</MenuItem>}
            </ResponsiveBarDropdown>
          </div>
        </>
      ) : (
        // Phase 2: Render final layout
        <>
          <div
            className={classnames(
              styles.visibleItems, 
              orientation === "vertical" ? styles.vertical : styles.horizontal
            )}
            style={{ 
              gap: `${gap}px`, // Gap between visible items
              flexDirection: orientation === "horizontal" 
                ? (reverse ? "row-reverse" : "row") 
                : (reverse ? "column-reverse" : "column"),
            }}
          >
            {childrenArray.map((child, index) => {
              const isVisible =
                layout.visibleItems.length > 0 ? index < layout.visibleItems.length : true;
              return (
                <div key={`item-${index}`} style={{ display: isVisible ? "flex" : "none", alignItems: "stretch" }}>
                  {renderChildFn && childNodes ? renderChildFn(childNodes[index], false) : child}
                </div>
              );
            })}
          </div>

          {/* Overflow dropdown */}
          {layout.overflowItems.length > 0 && (
            <ResponsiveBarDropdown 
              overflowIcon={overflowIcon}
              dropdownText={dropdownText}
              dropdownAlignment={effectiveAlignment}
              triggerTemplate={triggerTemplate}
              className={styles.overflowDropdown}
              onWillOpen={onWillOpen}
              registerComponentApi={(api) => {
                dropdownApiRef.current = api as { open: () => void; close: () => void };
              }}
            >
              {layout.overflowItems.map((item, index) => {
                const originalIndex = layout.visibleItems.length + index;
                const renderedChild = renderChildFn && childNodes ? renderChildFn(childNodes[originalIndex], true) : item;
                return (
                  <MenuItem key={index} compact={true}>
                    {renderedChild}
                  </MenuItem>
                );
              })}
            </ResponsiveBarDropdown>
          )}
        </>
      )}
    </div>
  );
});
