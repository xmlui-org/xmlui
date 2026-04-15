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

// Returns true only for large containers that are likely the main page scroll area,
// not small overlays like search result dropdowns.
function isMainScrollContainer(element: HTMLElement): boolean {
  return element.offsetHeight > window.innerHeight * 0.5;
}

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

    const validPosition = ["start", "center", "end"].includes(position || "") ? position : "end";
    const validBehavior = ["smooth", "instant", "auto"].includes(behavior || "") ? behavior : "smooth";

    useEffect(() => {
      if (!visible) {
        setIsVisible(false);
        return;
      }

      const getPageScrollTop = () => {
        const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const bodyScrollTop = document.body.scrollTop;
        let maxScrollTop = Math.max(windowScrollTop, bodyScrollTop);

        document.querySelectorAll("*").forEach((element) => {
          if (
            element instanceof HTMLElement &&
            element.scrollTop > 0 &&
            isMainScrollContainer(element)
          ) {
            maxScrollTop = Math.max(maxScrollTop, element.scrollTop);
          }
        });

        return maxScrollTop;
      };

      const handleScroll = (event?: Event) => {
        // Ignore scroll events from small elements (e.g. search result dropdowns)
        if (
          event &&
          event.target instanceof HTMLElement &&
          !isMainScrollContainer(event.target)
        ) {
          return;
        }

        const scrollTop = getPageScrollTop();
        if (threshold === 0) {
          setIsVisible(true);
        } else {
          setIsVisible(scrollTop > (threshold || 0));
        }
      };

      window.addEventListener("scroll", handleScroll);
      // Capture phase catches scroll events on div containers (not just window)
      document.addEventListener("scroll", handleScroll, true);

      handleScroll();

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("scroll", handleScroll, true);
      };
    }, [visible, threshold]);

    const handleClick = useCallback(() => {
      const scrollBehavior: ScrollBehavior =
        validBehavior === "instant" ? "instant" : validBehavior === "auto" ? "auto" : "smooth";

      window.scrollTo({ top: 0, behavior: scrollBehavior });

      if (validBehavior === "instant") {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      // Only reset main scroll containers, not small overlays like dropdowns
      document.querySelectorAll("*").forEach((element) => {
        if (
          element instanceof HTMLElement &&
          element.scrollTop > 0 &&
          isMainScrollContainer(element)
        ) {
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
        <Icon name={icon} fallback="chevronup" aria-hidden />
      </button>
    );
  },
);
