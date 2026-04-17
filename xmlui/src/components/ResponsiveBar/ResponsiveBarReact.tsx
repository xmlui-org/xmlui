import React, {
  forwardRef,
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type ReactElement,
} from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./ResponsiveBar.module.scss";
import { useResizeObserver } from "../../components-core/utils/hooks";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { ThemedDropdownMenu as DropdownMenu, ThemedMenuItem as MenuItem } from "../DropdownMenu/DropdownMenu";
import type { AlignmentOptions } from "../abstractions";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { Part } from "../Part/Part";
import { PART_OVERFLOW } from "../../components-core/parts";

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
  classes?: Record<string, string>;
  onClick?: () => void;
  onWillOpen?: () => Promise<boolean | undefined>;
  registerComponentApi?: RegisterComponentApiFn;
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

export const ResponsiveBar = memo(forwardRef<HTMLDivElement, ResponsiveBarProps>(function ResponsiveBar(
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
    classes,
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
  const composedRef = useComposedRefs(ref, containerRef);
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

  const openDropdown = useCallback(() => {
    dropdownApiRef.current?.open();
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownApiRef.current?.close();
  }, []);

  const hasOverflow = useCallback(() => {
    return layout.overflowItems.length > 0;
  }, [layout.overflowItems.length]);

  // Register component API
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        open: openDropdown,
        close: closeDropdown,
        hasOverflow,
      });
    }
  }, [registerComponentApi, openDropdown, closeDropdown, hasOverflow]);

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
      ref={composedRef}
      className={classnames(
        styles.responsiveBar, 
        orientation === "vertical" ? styles.vertical : styles.horizontal,
        classes?.[COMPONENT_PART_KEY],
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
}));
