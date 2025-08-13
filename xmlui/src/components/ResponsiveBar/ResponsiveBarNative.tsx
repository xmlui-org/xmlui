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

interface LayoutState {
  visibleItems: ReactElement[];
  overflowItems: ReactElement[];
}

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
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenItemsRef = useRef<HTMLDivElement>(null);
    const guardRef = useRef<HTMLDivElement>(null);
    const isCalculatingRef = useRef(false);
    const lastContainerWidth = useRef(0);
    
    // Simple layout state
    const [layout, setLayout] = useState<LayoutState>({
      visibleItems: [],
      overflowItems: [],
    });

    // Convert children to array for processing
    const childrenArray = React.useMemo(() => {
      return React.Children.toArray(children).filter(
        (child): child is ReactElement => React.isValidElement(child)
      );
    }, [children]);

    // Calculate overflow layout with proper guards
    const calculateOverflowLayout = () => {
      if (isCalculatingRef.current || !containerRef.current || !hiddenItemsRef.current || childrenArray.length === 0) {
        return;
      }

      const container = containerRef.current;
      const hiddenContainer = hiddenItemsRef.current;
      const containerWidth = container.clientWidth;
      
      if (containerWidth === 0 || containerWidth === lastContainerWidth.current) {
        return; // Not ready yet or no change
      }

      isCalculatingRef.current = true;
      lastContainerWidth.current = containerWidth;

      // Get gap from computed style
      const computedStyle = getComputedStyle(container);
      const gap = parseFloat(computedStyle.gap) || 0;

      // Calculate total width if all items were visible
      let totalWidth = 0;
      for (let i = 0; i < childrenArray.length; i++) {
        const childElement = hiddenContainer.children[i] as HTMLElement;
        if (!childElement) continue;
        
        const childWidth = childElement.offsetWidth;
        const gapWidth = i > 0 ? gap : 0;
        totalWidth += gapWidth + childWidth;
      }

      let visibleItems: ReactElement[];
      let overflowItems: ReactElement[];

      // If all items fit, show all
      if (totalWidth <= containerWidth) {
        visibleItems = childrenArray;
        overflowItems = [];
      } else {
        // Need overflow - use a fixed dropdown width estimate
        const dropdownWidth = 50;
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

        visibleItems = childrenArray.slice(0, visibleCount);
        overflowItems = childrenArray.slice(visibleCount);
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

    // Initial calculation when children change
    useEffect(() => {
      calculateOverflowLayout();
    }, [childrenArray]);

    // Monitor container size changes - with guard element check
    useResizeObserver(containerRef, () => {
      // Only respond to resize if guard element is present (indicating we're fully rendered)
      if (guardRef.current) {
        calculateOverflowLayout();
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

        {/* Hidden measurement container - always present for measurements */}
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
