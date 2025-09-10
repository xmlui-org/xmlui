import { forwardRef, useEffect, useState, useCallback } from "react";
import { Icon } from "xmlui";
import classnames from "classnames";
import styles from "./ScrollToTop.module.scss";

type Props = {
  position?: "start" | "center" | "end";
  visible?: boolean;
  threshold?: number;
  icon?: string;
  behavior?: "smooth" | "instant" | "auto";
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const defaultProps: Pick<Props, "position" | "visible" | "threshold" | "icon" | "behavior"> = {
  position: "end",
  visible: true,
  threshold: 300,
  icon: "chevronup",
  behavior: "smooth",
};

export const ScrollToTop = forwardRef<HTMLButtonElement, Props>(
  function ScrollToTop(
    {
      position = defaultProps.position,
      visible = defaultProps.visible,
      threshold = defaultProps.threshold,
      icon = defaultProps.icon,
      behavior = defaultProps.behavior,
      onClick,
      className,
      style,
    }: Props,
    ref,
  ) {
    const [isVisible, setIsVisible] = useState(false);

    // Validate position and fall back to "end" if invalid
    const validPosition = ["start", "center", "end"].includes(position || "") ? position : "end";
    
    // Validate behavior and fall back to "smooth" if invalid
    const validBehavior = ["smooth", "instant", "auto"].includes(behavior || "") ? behavior : "smooth";

    // Check scroll position to determine visibility
    useEffect(() => {
      if (!visible) {
        setIsVisible(false);
        return;
      }

      const handleScroll = () => {
        // Check multiple possible scroll containers using the same logic as scroll-to-top
        const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const bodyScrollTop = document.body.scrollTop;
        
        let maxScrollTop = Math.max(windowScrollTop, bodyScrollTop);
        
        // Check all elements that might be scrolled (same as in handleClick)
        const allElements = document.querySelectorAll('*');
        allElements.forEach((element) => {
          if (element instanceof HTMLElement && element.scrollTop > 0) {
            maxScrollTop = Math.max(maxScrollTop, element.scrollTop);
          }
        });
        
        // Also check common XMLUI containers
        const xmluiContainers = document.querySelectorAll(
          '.xmlui-app, .xmlui-page, .xmlui-container, [data-xmlui], main, .main, #root, .app'
        );
        xmluiContainers.forEach((element) => {
          if (element instanceof HTMLElement) {
            maxScrollTop = Math.max(maxScrollTop, element.scrollTop);
          }
        });
        
        // If threshold is 0, show the button regardless of scroll position
        if (threshold === 0) {
          setIsVisible(true);
        } else {
          setIsVisible(maxScrollTop > (threshold || 0));
        }
      };

      window.addEventListener("scroll", handleScroll);
      document.addEventListener("scroll", handleScroll, true); // Capture phase for all scroll events
      
      // Also listen to scroll events on common container elements
      const xmluiContainers = document.querySelectorAll(
        '.xmlui-app, .xmlui-page, .xmlui-container, [data-xmlui], main, .main, #root, .app'
      );
      xmluiContainers.forEach((element) => {
        element.addEventListener("scroll", handleScroll);
      });
      
      handleScroll(); // Check initial position

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("scroll", handleScroll, true);
        xmluiContainers.forEach((element) => {
          element.removeEventListener("scroll", handleScroll);
        });
      };
    }, [visible, threshold]);

    // Scroll to top functionality
    const handleClick = useCallback(() => {
      // Force scroll to top using multiple methods
      // This will work regardless of which container is scrolled
      
      // Convert behavior prop to ScrollBehavior type
      const scrollBehavior: ScrollBehavior = validBehavior === "instant" ? "instant" : validBehavior === "auto" ? "auto" : "smooth";
      
      // Method 1: Standard window scroll
      window.scrollTo({ top: 0, behavior: scrollBehavior });
      
      // Method 2: Direct property setting (for instant behavior)
      if (validBehavior === "instant") {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      
      // Method 3: Find and scroll any scrolled containers
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element) => {
        if (element instanceof HTMLElement && element.scrollTop > 0) {
          if (validBehavior === "instant") {
            element.scrollTop = 0;
          } else {
            element.scrollTo({ top: 0, behavior: scrollBehavior });
          }
        }
      });
      
      // Method 4: Scroll specific XMLUI containers (common patterns)
      const xmluiContainers = document.querySelectorAll(
        '.xmlui-app, .xmlui-page, .xmlui-container, [data-xmlui], main, .main, #root, .app'
      );
      xmluiContainers.forEach((element) => {
        if (element instanceof HTMLElement) {
          if (validBehavior === "instant") {
            element.scrollTop = 0;
          } else {
            element.scrollTo({ top: 0, behavior: scrollBehavior });
          }
        }
      });
      
      onClick?.();
    }, [validBehavior, onClick]);

    if (!isVisible) {
      return null;
    }

    return (
      <button
        ref={ref}
        className={classnames(
          styles.scrollToTop,
          {
            [styles.positionStart]: validPosition === "start",
            [styles.positionCenter]: validPosition === "center",
            [styles.positionEnd]: validPosition === "end",
          },
          className,
        )}
        onClick={handleClick}
        style={style}
        aria-label="Scroll to top"
        type="button"
      >
        <Icon className={styles.icon} name={icon} fallback="chevronup" aria-hidden />
      </button>
    );
  },
);
