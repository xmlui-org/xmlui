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
    
    // Use a single state object to prevent cascading updates
    const [layout, setLayout] = useState<{
      visibleItems: ReactElement[];
      overflowItems: ReactElement[];
    }>({
      visibleItems: [],
      overflowItems: [],
    });

    // Convert children to array for processing
    const childrenArray = React.useMemo(() => 
      React.Children.toArray(children).filter(
        (child): child is ReactElement => React.isValidElement(child)
      ), [children]
    );

    // Calculation function that doesn't depend on state
    const calculateLayout = React.useCallback(() => {
      if (!containerRef.current || !hiddenItemsRef.current || childrenArray.length === 0) {
        return;
      }

      const container = containerRef.current;
      const hiddenContainer = hiddenItemsRef.current;
      const containerWidth = container.clientWidth;

      if (containerWidth === 0) {
        return; // Not ready yet
      }

      // Get gap from computed style
      const computedStyle = getComputedStyle(container);
      const gap = parseFloat(computedStyle.gap) || 0;
      const dropdownWidth = 50;

      console.log('Calculating layout:', { containerWidth, gap, dropdownWidth, childrenCount: childrenArray.length });

      // Calculate total width if all items were visible
      let totalWidth = 0;
      for (let i = 0; i < childrenArray.length; i++) {
        const childElement = hiddenContainer.children[i] as HTMLElement;
        if (!childElement) continue;
        
        const childWidth = childElement.offsetWidth;
        const gapWidth = i > 0 ? gap : 0;
        totalWidth += gapWidth + childWidth;
      }

      // If all items fit, show all
      if (totalWidth <= containerWidth) {
        console.log('All items fit');
        setLayout({
          visibleItems: childrenArray,
          overflowItems: [],
        });
        return;
      }

      // Otherwise, calculate how many fit with dropdown
      const availableWidth = containerWidth - dropdownWidth - gap;
      let accumulatedWidth = 0;
      let visibleCount = 0;

      for (let i = 0; i < childrenArray.length; i++) {
        const childElement = hiddenContainer.children[i] as HTMLElement;
        if (!childElement) continue;
        
        const childWidth = childElement.offsetWidth;
        const gapWidth = i > 0 ? gap : 0;
        const proposedWidth = accumulatedWidth + gapWidth + childWidth;

        if (proposedWidth <= availableWidth) {
          accumulatedWidth = proposedWidth;
          visibleCount++;
        } else {
          break;
        }
      }

      console.log('Layout calculation result:', { visibleCount, overflowCount: childrenArray.length - visibleCount });
      
      setLayout({
        visibleItems: childrenArray.slice(0, visibleCount),
        overflowItems: childrenArray.slice(visibleCount),
      });
    }, [childrenArray]); // Only depends on children

    // Calculate layout when children change
    useEffect(() => {
      console.log('Children changed, recalculating layout...');
      // Use a timeout to ensure DOM is ready
      const timeout = setTimeout(() => {
        calculateLayout();
      }, 0);
      
      return () => clearTimeout(timeout);
    }, [calculateLayout]);

    // Monitor container size changes - NO state updates here!
    useResizeObserver(containerRef, () => {
      console.log('Container resized, recalculating layout...');
      // Call the calculation directly without triggering state updates first
      calculateLayout();
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
        style={style}
        onClick={onClick}
        {...rest}
      >
        {/* Visible items */}
        <div className={styles.visibleItems}>
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

        {/* Hidden measurement container */}
        <div ref={hiddenItemsRef} className={styles.hiddenItems}>
          {childrenArray.map((child, index) => {
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
