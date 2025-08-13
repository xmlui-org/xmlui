import React, { 
  forwardRef, 
  useRef, 
  useEffect, 
  useState, 
  useCallback,
  type CSSProperties, 
  type ReactNode,
  type ReactElement 
} from "react";
import classnames from "classnames";

import styles from "./ResponsiveBar.module.scss";
import { useResizeObserver } from "../../components-core/utils/hooks";
import { DropdownMenu, MenuItem } from "../DropdownMenu/DropdownMenuNative";

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

export const defaultResponsiveBarProps = {
  overflowIcon: "ellipsisHorizontal:ResponsiveBar",
  gap: 0,
};

export const ResponsiveBar = forwardRef<HTMLDivElement, ResponsiveBarProps>(
  function ResponsiveBar(
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
    const guardRef = useRef<HTMLDivElement>(null);
    const isCalculatingRef = useRef(false);
    const lastContainerWidth = useRef(0);
    const lastChildrenCount = useRef(0);
    
    // Two-phase rendering state
    const [isInMeasurementPhase, setIsInMeasurementPhase] = useState(true);
    const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);
    
    // Simple layout state
    const [layout, setLayout] = useState<LayoutState>({
      visibleItems: [],
      overflowItems: [],
    });

    // Convert children to array for processing
    const childrenArray = React.useMemo(() => {
      const result = React.Children.toArray(children).filter(
        (child): child is ReactElement => React.isValidElement(child)
      );
      console.log('👶 childrenArray updated:', result.length, 'children');
      return result;
    }, [children]);

    // Measurement phase - measure all items in the same container
      const measureItems = () => {
      if (!containerRef.current) return;

      console.log('📏 measureItems - Starting measurement phase');
      const items: HTMLElement[] = [];
      
      // Get all child elements in measurement phase containers
      const measurementContainers = containerRef.current.querySelectorAll(`.${styles.measurementPhase}`);
      console.log('📏 Found measurement containers:', measurementContainers.length);
      
      measurementContainers.forEach((container) => {
        const child = container.firstElementChild as HTMLElement;
        if (child) {
          items.push(child);
        }
      });

      console.log('📏 Items to measure:', items.length);
      const widths = items.map((item, index) => {
        const rect = item.getBoundingClientRect();
        console.log(`📏 Item ${index} measurement:`, {
          tagName: item.tagName,
          className: item.className,
          width: rect.width
        });
        return rect.width;
      });

      console.log('📏 All measured widths:', widths);
      setMeasuredWidths(widths);
      setIsInMeasurementPhase(false);
      console.log('📏 Measurement phase complete, transitioning to layout phase');
    };    // Calculate overflow layout with pre-measured widths
    const calculateOverflowLayout = () => {
      if (isCalculatingRef.current || !containerRef.current || childrenArray.length === 0 || measuredWidths.length === 0) {
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
      console.log('Phase 2 - Using gap value:', gapValue); // Debug log
      console.log('Phase 2 - Container width:', containerWidth); // Debug log

      // First, calculate if all items fit without any dropdown
      let totalWidth = 0;
      
      for (let i = 0; i < childrenArray.length; i++) {
        const childWidth = measuredWidths[i];
        if (!childWidth) continue;
        
        const gapWidth = i > 0 ? gapValue : 0;
        totalWidth += gapWidth + childWidth;
      }

      console.log('Phase 2 - Total width calculated:', totalWidth); // Debug log

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
        const existingDropdown = container.querySelector(`.${styles.overflowDropdown}`) as HTMLElement;
        if (existingDropdown) {
          dropdownWidth = existingDropdown.getBoundingClientRect().width;
          console.log('Found existing dropdown, width:', dropdownWidth); // Debug log
        } 
        // Then try the measurement dropdown
        else if (measurementDropdownRef.current) {
          dropdownWidth = measurementDropdownRef.current.getBoundingClientRect().width;
          console.log('Using measurement dropdown, width:', dropdownWidth); // Debug log
        } 
        else {
          console.log('No dropdown found, using fallback width:', dropdownWidth); // Debug log
        }
        
        console.log('Dropdown width:', dropdownWidth); // Debug log
        
        // Reserve space for dropdown (flexbox gap handles spacing automatically)
        const availableWidthForItems = containerWidth - dropdownWidth;
        console.log('Available width for items:', availableWidthForItems); // Debug log
        
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

        console.log(`Final calculation: visibleCount=${visibleCount}, childrenArray.length=${childrenArray.length}`); // Debug log
        
        // Verify our calculation
        if (visibleCount > 0) {
          let verifyWidth = 0;
          for (let i = 0; i < visibleCount; i++) {
            verifyWidth += measuredWidths[i];
          }
          // When we have overflow: visibleCount items + dropdown need visibleCount gaps total
          // (visibleCount-1 gaps between items + 1 gap before dropdown)
          const totalGaps = visibleCount * gapValue;
          console.log(`FINAL: ${visibleCount} items (${verifyWidth}px) + ${visibleCount} gaps (${totalGaps}px) + dropdown (${dropdownWidth}px) = ${verifyWidth + totalGaps + dropdownWidth}px vs container ${containerWidth}px`);
        }
        
        // Also check actual visible item widths for comparison
        const visibleContainer = containerRef.current?.querySelector(`.${styles.visibleItems}`) as HTMLElement;
        if (visibleContainer && visibleContainer.children.length > 0) {
          console.log('Actual visible item widths:');
          let actualTotalWidth = 0;
          for (let i = 0; i < Math.min(visibleContainer.children.length, visibleCount); i++) {
            const actualWidth = (visibleContainer.children[i] as HTMLElement).offsetWidth;
            actualTotalWidth += actualWidth;
            console.log(`  Visible item ${i}: measured=${measuredWidths[i]}px, actual=${actualWidth}px`);
          }
          console.log(`Actual total width of visible items: ${actualTotalWidth}px (plus ${(visibleCount-1) * gapValue}px gaps = ${actualTotalWidth + (visibleCount-1) * gapValue}px)`);
          console.log(`Visible container total width: ${visibleContainer.offsetWidth}px`);
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

        console.log(`Final layout: ${visibleItems.length} visible, ${overflowItems.length} overflow items`); // Debug log
      }

      // Only update if there's an actual change
      if (visibleItems.length !== layout.visibleItems.length || 
          overflowItems.length !== layout.overflowItems.length) {
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
      console.log('🔄 Phase 1 Effect - children change check');
      console.log('Current children count:', childrenArray.length, 'Last count:', lastChildrenCount.current);
      if (childrenArray.length !== lastChildrenCount.current) {
        console.log('📊 Children count changed, starting measurement phase');
        lastChildrenCount.current = childrenArray.length;
        setIsInMeasurementPhase(true);
        setMeasuredWidths([]);
      }
    }, [childrenArray]);

    // Phase 1: Trigger measurement after render
    useEffect(() => {
      console.log('🔄 Phase 1 Effect - trigger measurement');
      console.log('isInMeasurementPhase:', isInMeasurementPhase);
      if (isInMeasurementPhase) {
        console.log('📏 Scheduling measurement in 10ms');
        const timer = setTimeout(() => {
          console.log('📏 Timer fired, calling measureItems');
          measureItems();
        }, 10);
        return () => clearTimeout(timer);
      }
    }, [isInMeasurementPhase, childrenArray]);

    // Phase 2: Calculate layout when measurements are ready
    useEffect(() => {
      console.log('🔄 Phase 2 Effect - calculate layout');
      console.log('isInMeasurementPhase:', isInMeasurementPhase, 'measuredWidths.length:', measuredWidths.length);
      if (!isInMeasurementPhase && measuredWidths.length > 0) {
        console.log('📊 Starting layout calculation with widths:', measuredWidths);
        calculateOverflowLayout();
      }
    }, [isInMeasurementPhase, measuredWidths]);

    // Monitor container size changes - only in phase 2 to avoid infinite loops
    useResizeObserver(containerRef, () => {
      if (!isInMeasurementPhase && guardRef.current && containerRef.current) {
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
          if (typeof ref === 'function') {
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
          // Phase 1: Render all items invisibly for measurement
          childrenArray.map((child, index) => (
            <div key={`measure-${index}`} className={styles.measurementPhase}>
              {child}
            </div>
          ))
        ) : (
          // Phase 2: Render final layout
          <>
            <div 
              className={styles.visibleItems}
              style={{ gap: `${gap}px` }} // Gap between visible items
            >
              {layout.visibleItems.length > 0 ? layout.visibleItems : childrenArray}
            </div>
            
            {/* Overflow dropdown */}
            {layout.overflowItems.length > 0 && (
              <div className={styles.overflowDropdown}>
                <DropdownMenu
                  label="More options"
                  triggerButtonIcon={overflowIcon}
                >
                  {layout.overflowItems.map((item, index) => (
                    <MenuItem key={index}>
                      {item}
                    </MenuItem>
                  ))}
                </DropdownMenu>
              </div>
            )}
          </>
        )}

        {/* Guard element - zero width, invisible, but present for resize detection */}
        <div 
          ref={guardRef}
          style={{ 
            width: 0, 
            height: 0, 
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            border: 'none'
          }}
          aria-hidden="true"
        />

        {/* Hidden dropdown for width measurement */}
        <div 
          ref={measurementDropdownRef}
          className={styles.hiddenItems}
        >
          <div className={styles.overflowDropdown}>
            <DropdownMenu
              label="More options"
              triggerButtonIcon={overflowIcon}
            >
              {childrenArray.length > 0 && (
                <MenuItem>
                  {childrenArray[0]}
                </MenuItem>
              )}
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  },
);

ResponsiveBar.displayName = "ResponsiveBar";
