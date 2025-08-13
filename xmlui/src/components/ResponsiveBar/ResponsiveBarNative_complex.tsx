import React, { 
  forwardRef, 
  useRef, 
  useEffect, 
  useState, 
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
  style?: CSSProperties;
  onClick?: () => void;
  [key: string]: any; // For test props
};

export const defaultResponsiveBarProps = {
  overflowIcon: "ellipsisHorizontal:ResponsiveBar",
};

export const ResponsiveBar = forwardRef<HTMLDivElement, ResponsiveBarProps>(
  function ResponsiveBar(
    {
      children,
      overflowIcon = defaultResponsiveBarProps.overflowIcon,
      style,
      onClick,
      ...rest
    }: ResponsiveBarProps,
    ref,
  ) {
    // Diagnostic: Re-render counter
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;
    console.log(`🔄 ResponsiveBar render #${renderCountRef.current}`);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenItemsRef = useRef<HTMLDivElement>(null);
    const [visibleItems, setVisibleItems] = useState<ReactElement[]>([]);
    const [overflowItems, setOverflowItems] = useState<ReactElement[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    
    // Convert children to array for processing (memoized to prevent unnecessary re-renders)
    const childrenArray = React.useMemo(() => 
      React.Children.toArray(children).filter(
        (child): child is ReactElement => React.isValidElement(child)
      ), [children]
    );

    // Monitor container size changes 
    useResizeObserver(containerRef, (entries) => {
      const newWidth = entries[0]?.contentRect.width || 0;
      console.log('Container resized to:', newWidth, 'isCalculating:', isCalculatingRef.current);
      
      // Don't trigger measurement during calculation to prevent loops
      if (!isCalculatingRef.current && newWidth > 0) {
        console.log('Triggering measurement due to resize');
        setState(prev => ({ ...prev, measurementPhase: true }));
      }
    });

    // Handle measurement phase and calculations
    useEffect(() => {
      console.log('useEffect triggered:', { 
        hasHiddenRef: !!hiddenItemsRef.current, 
        hasContainerRef: !!containerRef.current, 
        measurementPhase: state.measurementPhase,
        childrenCount: childrenArray.length 
      });

      if (!hiddenItemsRef.current || !containerRef.current) {
        console.log('Skipping - missing refs');
        return;
      }

      if (state.measurementPhase) {
        // Set flag to prevent resize-triggered recalculation
        isCalculatingRef.current = true;
        
        // Wait for DOM to be ready before calculation
        const raf = requestAnimationFrame(() => {
          console.log('Starting calculation...');
          
          const container = containerRef.current!;
          const hiddenContainer = hiddenItemsRef.current!;
          const containerWidth = container.clientWidth;
          
          console.log('Container width:', containerWidth);
          console.log('Hidden container children count:', hiddenContainer.children.length);
          
          if (containerWidth === 0) {
            console.log('Container width is 0, postponing calculation');
            // Retry after a short delay
            setTimeout(() => setState(prev => ({ ...prev, measurementPhase: true })), 50);
            return;
          }
          
          // Get computed gap value from the visible items container (more accurate)
          const visibleItemsContainer = container.querySelector(`.${styles.visibleItems}`) as HTMLElement;
          const computedStyle = getComputedStyle(visibleItemsContainer || container);
          const gap = parseFloat(computedStyle.gap) || 0;
          
          console.log('Gap calculation:', { gap, computedGap: computedStyle.gap });
          
          // Account for dropdown button width (more accurate measurement)
          const dropdownWidth = 50; // Increased to be more conservative
          
          console.log('ResponsiveBar calculation:', {
            containerWidth,
            gap,
            childrenCount: childrenArray.length,
            dropdownWidth
          });

          let totalWidth = 0;
          let visibleCount = 0;
          
          // Always reserve space for dropdown in calculation
          const dropdownSpaceReserved = dropdownWidth + gap;
          const availableWidth = containerWidth - dropdownSpaceReserved;
          
          console.log('Width calculation:', { 
            containerWidth, 
            dropdownSpaceReserved, 
            availableWidth 
          });
          
          // Calculate how many items fit in available space
          for (let i = 0; i < childrenArray.length; i++) {
            const childElement = hiddenContainer.children[i] as HTMLElement;
            if (!childElement) {
              console.warn(`Could not find child element at index ${i} in hidden container`);
              continue;
            }
            
            const childWidth = childElement.offsetWidth;
            const gapWidth = i > 0 ? gap : 0;
            const proposedWidth = totalWidth + gapWidth + childWidth;
            
            console.log(`Child ${i}:`, {
              childWidth,
              gapWidth,
              proposedWidth,
              availableWidth,
              willFit: proposedWidth <= availableWidth
            });
            
            if (proposedWidth <= availableWidth) {
              totalWidth = proposedWidth;
              visibleCount++;
            } else {
              console.log(`Breaking at child ${i} - would exceed available width`);
              break;
            }
          }
          
          // If all items fit with dropdown space reserved, we don't actually need the dropdown
          if (visibleCount === childrenArray.length) {
            // Double-check if all items fit in full container width without dropdown
            if (totalWidth <= containerWidth) {
              console.log('All items fit without dropdown needed');
              // Keep all items visible, no dropdown needed
            } else {
              console.log('All items fit with dropdown space, but dropdown not needed');
              visibleCount = childrenArray.length;
            }
          }
          
          console.log('Final calculation result:', {
            visibleCount,
            overflowCount: childrenArray.length - visibleCount,
            totalCalculatedWidth: totalWidth,
            willShowDropdown: visibleCount < childrenArray.length
          });
          
          // Batch all state updates into a single setState call
          setState({
            visibleItems: childrenArray.slice(0, visibleCount),
            overflowItems: childrenArray.slice(visibleCount),
            measurementPhase: false,
          });
          
          // Clear the flag after a short delay to allow dropdown to settle
          setTimeout(() => {
            isCalculatingRef.current = false;
            console.log('Calculation complete, resize monitoring restored');
          }, 100);
        });
        
        return () => cancelAnimationFrame(raf);
      }
    }, [state.measurementPhase, childrenArray]);

    // Start measurement when children change (with debouncing to reduce re-renders)
    useEffect(() => {
      console.log('Children changed, scheduling measurement phase');
      isCalculatingRef.current = false; // Reset flag when children change
      
      // Debounce to avoid multiple rapid re-renders
      const timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, measurementPhase: true }));
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }, [children]);

    // Debug measurement phase changes with timeout fallback
    useEffect(() => {
      console.log('Measurement phase changed to:', state.measurementPhase);
      
      if (state.measurementPhase) {
        // Fallback: end measurement phase after 1 second if it gets stuck
        const timeout = setTimeout(() => {
          console.log('Measurement phase timeout - forcing end');
          setState(prev => ({ ...prev, measurementPhase: false }));
        }, 1000);
        
        return () => clearTimeout(timeout);
      }
    }, [state.measurementPhase]);

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
        style={style}
        onClick={onClick}
        {...rest}
      >
        {/* Visible items in normal layout */}
        <div className={styles.visibleItems}>
          {state.measurementPhase ? childrenArray : (state.visibleItems.length > 0 ? state.visibleItems : childrenArray)}
        </div>

        {/* Overflow dropdown (only show if there are overflow items) */}
        {!state.measurementPhase && state.overflowItems.length > 0 && (
          <div className={styles.overflowDropdown}>
            <DropdownMenu
              label="More options"
              triggerButtonIcon={overflowIcon}
            >
              {state.overflowItems.map((item, index) => (
                <MenuItem key={index}>
                  {item}
                </MenuItem>
              ))}
            </DropdownMenu>
          </div>
        )}

        {/* Hidden measurement container - always renders all items invisibly */}
        <div ref={hiddenItemsRef} className={styles.hiddenItems}>
          {childrenArray.map((child, index) => {
            // Clone element and remove all test-related props to avoid conflicts
            const { testId, "data-testid": dataTestId, ...cleanProps } = child.props || {};
            return React.cloneElement(child, { 
              ...cleanProps,
              key: `hidden-${index}`,
            });
          })}
        </div>
      </div>
    );
  },
);

ResponsiveBar.displayName = "ResponsiveBar";
