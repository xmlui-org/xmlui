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

    // Convert children to array for processing (memoized to prevent unnecessary re-renders)
    const childrenArray = React.useMemo(() => 
      React.Children.toArray(children).filter(
        (child): child is ReactElement => React.isValidElement(child)
      ), [children]
    );

    // Single useEffect that handles everything
    useEffect(() => {
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

      console.log('Calculating overflow:', { containerWidth, gap, dropdownWidth, childrenCount: childrenArray.length });

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
        setVisibleItems(childrenArray);
        setOverflowItems([]);
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

      console.log('Overflow calculation result:', { visibleCount, overflowCount: childrenArray.length - visibleCount });
      
      setVisibleItems(childrenArray.slice(0, visibleCount));
      setOverflowItems(childrenArray.slice(visibleCount));
    }, [childrenArray]); // Only depend on children changes

    // Monitor container size changes (use a ref to trigger recalculation)
    const recalcTriggerRef = useRef(0);
    
    useResizeObserver(containerRef, () => {
      console.log('Container resized, forcing re-calculation...');
      // Increment trigger to force useEffect to run
      recalcTriggerRef.current += 1;
      // Force component to re-render, which will trigger the useEffect
      setVisibleItems(prev => prev.length === 0 ? [] : [...prev]);
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
          {visibleItems.length > 0 ? visibleItems : childrenArray}
        </div>

        {/* Overflow dropdown */}
        {overflowItems.length > 0 && (
          <div className={styles.overflowDropdown}>
            <DropdownMenu
              label="More options"
              triggerButtonIcon={overflowIcon}
            >
              {overflowItems.map((item, index) => (
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
